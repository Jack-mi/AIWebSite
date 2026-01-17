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
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <a href="/api/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded">
            登录
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">网站分析</h1>
              <p className="text-gray-600">使用AI深度分析网站的技术栈、意图和用户体验</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎, {user.name}</span>
              <a href="/api/auth/logout" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                退出登录
              </a>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">输入网站URL</h2>
          <div className="flex space-x-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="例如: https://example.com"
              className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {loading ? '分析中...' : '开始分析'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 animate-glow">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">AI正在分析中...</h3>
            <p className="text-gray-600 mb-1">正在深度解析网站信息</p>
            <p className="text-sm text-gray-500">这可能需要30秒到2分钟的时间</p>
            <div className="mt-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">网站基础信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 block mb-2">网站标题</label>
                  <p className="text-gray-900 font-medium">{analysisResult.title || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 block mb-2">域名</label>
                  <p className="text-gray-900 font-medium">{analysisResult.domain}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 block mb-2">分析状态</label>
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-green-200 text-green-800">
                    {analysisResult.status}
                  </span>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <label className="text-sm font-semibold text-gray-600 block mb-2">处理时间</label>
                  <p className="text-gray-900 font-medium">
                    {analysisResult.processing_time_ms ? `${analysisResult.processing_time_ms}ms` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Intent Analysis */}
            {analysisResult.intent_analysis && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">智能意图解构</h3>
                {analysisResult.intent_analysis.user_intents && (
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-6 text-gray-800">用户意图分析</h4>
                    <div className="space-y-4">
                      {analysisResult.intent_analysis.user_intents.map((intent: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-bold text-gray-900">{intent.intent}</h5>
                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                              {intent.priority}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{intent.description}</p>
                          {intent.evidence && intent.evidence.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="text-xs font-bold text-gray-600">支持证据:</span>
                              <ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-1">
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
                    <h4 className="text-lg font-bold mb-6 text-gray-800">功能特性分析</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analysisResult.intent_analysis.features.slice(0, 6).map((feature: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-bold text-sm text-gray-900">{feature.feature_name}</h6>
                            <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-lg">
                              {feature.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Technology Stack */}
            {analysisResult.technology_stack && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">技术栈分析</h3>
                {analysisResult.technology_stack.technologies_by_category && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(analysisResult.technology_stack.technologies_by_category).map(([category, technologies]: [string, any]) => (
                      <div key={category} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                        <h4 className="font-bold mb-4 capitalize text-gray-900 text-lg">{category}</h4>
                        <div className="space-y-3">
                          {technologies.map((tech: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-900">{tech.technology}</span>
                              <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">
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
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">用户体验分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {analysisResult.user_experience.navigation && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <h4 className="font-bold mb-4 text-gray-900">导航结构</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">总链接数</span>
                          <span className="font-bold text-gray-900">{analysisResult.user_experience.navigation.total_links}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">内部链接</span>
                          <span className="font-bold text-gray-900">{analysisResult.user_experience.navigation.internal_links}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">外部链接</span>
                          <span className="font-bold text-gray-900">{analysisResult.user_experience.navigation.external_links}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisResult.user_experience.content && (
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <h4 className="font-bold mb-4 text-gray-900">内容质量</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">总词数</span>
                          <span className="font-bold text-gray-900">{analysisResult.user_experience.content.total_words}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">可读性评分</span>
                          <span className="font-bold text-gray-900">
                            {Math.round(analysisResult.user_experience.content.readability_score * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisResult.user_experience.interactivity && (
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <h4 className="font-bold mb-4 text-gray-900">交互性</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">表单数量</span>
                          <span className="font-bold text-gray-900">{analysisResult.user_experience.interactivity.forms_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">图片数量</span>
                          <span className="font-bold text-gray-900">{analysisResult.user_experience.interactivity.images_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">搜索功能</span>
                          <span className="font-bold text-gray-900">
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
