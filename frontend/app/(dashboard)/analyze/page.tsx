'use client'

import React, { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

interface AnalysisResult {
  website_id: string
  url: string
  domain: string
  title: string
  status: string
  intent_analysis?: any
  technology_stack?: any
  user_experience?: any
  processing_time_ms?: number
}

export default function AnalyzePage() {
  const { user, isLoading } = useUser()
  const [url, setUrl] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!url) {
      setError('请输入网站URL')
      return
    }

    setLoading(true)
    setError('')
    setAnalysisResult(null)

    try {
      // Submit analysis
      const response = await fetch('/api/v1/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          analysis_types: ['intent', 'tech_stack', 'ux']
        })
      })

      if (!response.ok) {
        throw new Error('分析提交失败')
      }

      const submitResult = await response.json()

      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/v1/analysis/analyze/${submitResult.analysis_id}`)
          if (statusResponse.ok) {
            const statusResult = await statusResponse.json()

            if (statusResult.status === 'completed') {
              setAnalysisResult(statusResult)
              setLoading(false)
              clearInterval(pollInterval)
            } else if (statusResult.status === 'failed') {
              setError('分析失败，请重试')
              setLoading(false)
              clearInterval(pollInterval)
            }
          }
        } catch (err) {
          console.error('轮询错误:', err)
        }
      }, 2000)

      // Clear interval after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (loading) {
          setError('分析超时，请重试')
          setLoading(false)
        }
      }, 120000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败')
      setLoading(false)
    }
  }

  if (isLoading) {
    return <div className=\"min-h-screen flex items-center justify-center\">加载中...</div>
  }

  if (!user) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <div className=\"text-center\">
          <h1 className=\"text-2xl font-bold mb-4\">请先登录</h1>
          <a href=\"/api/auth/login\" className=\"bg-blue-600 text-white px-4 py-2 rounded\">
            登录
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className=\"min-h-screen bg-gray-50 py-8\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
        {/* Header */}
        <div className=\"mb-8\">
          <div className=\"flex justify-between items-center\">
            <h1 className=\"text-3xl font-bold text-gray-900\">网站分析</h1>
            <div className=\"flex items-center space-x-4\">
              <span className=\"text-sm text-gray-600\">欢迎, {user.name}</span>
              <a href=\"/api/auth/logout\" className=\"text-sm text-blue-600 hover:text-blue-800\">
                退出登录
              </a>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className=\"bg-white rounded-lg shadow-sm p-6 mb-8\">
          <h2 className=\"text-lg font-semibold mb-4\">输入要分析的网站URL</h2>
          <div className=\"flex space-x-4\">
            <input
              type=\"url\"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder=\"例如: https://example.com\"
              className=\"flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url}
              className=\"px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              {loading ? '分析中...' : '开始分析'}
            </button>
          </div>
          {error && (
            <div className=\"mt-4 p-3 bg-red-50 border border-red-200 rounded-md\">
              <p className=\"text-red-600 text-sm\">{error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className=\"bg-white rounded-lg shadow-sm p-8 text-center\">
            <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4\"></div>
            <p className=\"text-gray-600\">正在分析网站，请稍候...</p>
            <p className=\"text-sm text-gray-500 mt-2\">这可能需要30秒到2分钟的时间</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className=\"space-y-6\">
            {/* Basic Info */}
            <div className=\"bg-white rounded-lg shadow-sm p-6\">
              <h3 className=\"text-lg font-semibold mb-4\">网站基础信息</h3>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div>
                  <label className=\"text-sm font-medium text-gray-500\">网站标题</label>
                  <p className=\"mt-1 text-gray-900\">{analysisResult.title || 'N/A'}</p>
                </div>
                <div>
                  <label className=\"text-sm font-medium text-gray-500\">域名</label>
                  <p className=\"mt-1 text-gray-900\">{analysisResult.domain}</p>
                </div>
                <div>
                  <label className=\"text-sm font-medium text-gray-500\">分析状态</label>
                  <span className=\"mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800\">
                    {analysisResult.status}
                  </span>
                </div>
                <div>
                  <label className=\"text-sm font-medium text-gray-500\">处理时间</label>
                  <p className=\"mt-1 text-gray-900\">
                    {analysisResult.processing_time_ms ? `${analysisResult.processing_time_ms}ms` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Intent Analysis */}
            {analysisResult.intent_analysis && (
              <div className=\"bg-white rounded-lg shadow-sm p-6\">
                <h3 className=\"text-lg font-semibold mb-4\">智能意图解构</h3>
                {analysisResult.intent_analysis.user_intents && (
                  <div className=\"mb-6\">
                    <h4 className=\"font-medium mb-3\">用户意图分析</h4>
                    <div className=\"space-y-3\">
                      {analysisResult.intent_analysis.user_intents.map((intent: any, index: number) => (
                        <div key={index} className=\"border border-gray-200 rounded-lg p-4\">
                          <div className=\"flex justify-between items-start mb-2\">
                            <h5 className=\"font-medium text-gray-900\">{intent.intent}</h5>
                            <span className=\"text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded\">
                              {intent.priority}
                            </span>
                          </div>
                          <p className=\"text-gray-600 text-sm mb-2\">{intent.description}</p>
                          {intent.evidence && intent.evidence.length > 0 && (
                            <div className=\"mt-2\">
                              <span className=\"text-xs font-medium text-gray-500\">支持证据:</span>
                              <ul className=\"list-disc list-inside text-xs text-gray-500 mt-1\">
                                {intent.evidence.slice(0, 3).map((evidence: string, i: number) => (
                                  <li key={i}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.intent_analysis.features && (
                  <div>
                    <h4 className=\"font-medium mb-3\">功能特性分析</h4>
                    <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                      {analysisResult.intent_analysis.features.slice(0, 6).map((feature: any, index: number) => (
                        <div key={index} className=\"border border-gray-200 rounded-lg p-3\">
                          <div className=\"flex justify-between items-start mb-1\">
                            <h6 className=\"font-medium text-sm\">{feature.feature_name}</h6>
                            <span className=\"text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded\">
                              {feature.category}
                            </span>
                          </div>
                          <p className=\"text-xs text-gray-600\">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Technology Stack */}
            {analysisResult.technology_stack && (
              <div className=\"bg-white rounded-lg shadow-sm p-6\">
                <h3 className=\"text-lg font-semibold mb-4\">技术栈分析</h3>
                {analysisResult.technology_stack.technologies_by_category && (
                  <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                    {Object.entries(analysisResult.technology_stack.technologies_by_category).map(([category, technologies]: [string, any]) => (
                      <div key={category} className=\"border border-gray-200 rounded-lg p-4\">
                        <h4 className=\"font-medium mb-3 capitalize\">{category}</h4>
                        <div className=\"space-y-2\">
                          {technologies.map((tech: any, index: number) => (
                            <div key={index} className=\"flex justify-between items-center\">
                              <span className=\"text-sm text-gray-900\">{tech.technology}</span>
                              <span className=\"text-xs bg-green-100 text-green-700 px-2 py-1 rounded\">
                                {Math.round(tech.confidence * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User Experience */}
            {analysisResult.user_experience && (
              <div className=\"bg-white rounded-lg shadow-sm p-6\">
                <h3 className=\"text-lg font-semibold mb-4\">用户体验分析</h3>
                <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
                  {analysisResult.user_experience.navigation && (
                    <div>
                      <h4 className=\"font-medium mb-3\">导航结构</h4>
                      <div className=\"space-y-2 text-sm\">
                        <div className=\"flex justify-between\">
                          <span>总链接数</span>
                          <span className=\"font-medium\">{analysisResult.user_experience.navigation.total_links}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span>内部链接</span>
                          <span className=\"font-medium\">{analysisResult.user_experience.navigation.internal_links}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span>外部链接</span>
                          <span className=\"font-medium\">{analysisResult.user_experience.navigation.external_links}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisResult.user_experience.content && (
                    <div>
                      <h4 className=\"font-medium mb-3\">内容质量</h4>
                      <div className=\"space-y-2 text-sm\">
                        <div className=\"flex justify-between\">
                          <span>总词数</span>
                          <span className=\"font-medium\">{analysisResult.user_experience.content.total_words}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span>可读性评分</span>
                          <span className=\"font-medium\">
                            {Math.round(analysisResult.user_experience.content.readability_score * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisResult.user_experience.interactivity && (
                    <div>
                      <h4 className=\"font-medium mb-3\">交互性</h4>
                      <div className=\"space-y-2 text-sm\">
                        <div className=\"flex justify-between\">
                          <span>表单数量</span>
                          <span className=\"font-medium\">{analysisResult.user_experience.interactivity.forms_count}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span>图片数量</span>
                          <span className=\"font-medium\">{analysisResult.user_experience.interactivity.images_count}</span>
                        </div>
                        <div className=\"flex justify-between\">
                          <span>搜索功能</span>
                          <span className=\"font-medium\">
                            {analysisResult.user_experience.interactivity.has_search ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}