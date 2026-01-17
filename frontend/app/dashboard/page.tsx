'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const analyzeWebsite = async () => {
    if (!url) {
      setError('请输入网站URL')
      return
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('请输入完整的URL（包含http://或https://）')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          analysis_types: ['basic', 'tech_stack', 'traffic', 'website_intro', 'user_needs']
        })
      })

      if (!response.ok) {
        throw new Error('分析失败')
      }

      const data = await response.json()
      setResults(data.results)
    } catch (err) {
      setError('分析过程中出现错误，请稍后再试')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                InsightEye
              </span>
            </h1>
          </Link>
          <p className="text-gray-600">AI驱动的网站分析平台</p>
        </div>

        {/* Analysis Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">网站分析</h2>

          <div className="flex gap-4 mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请输入网站URL，例如：https://example.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={analyzeWebsite}
              disabled={loading || !url}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '分析中...' : '开始分析'}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Basic Analysis */}
            {results.basic && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">基础分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.basic.performance_score}</div>
                      <div className="text-sm text-gray-600 mb-2">性能评分</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {results.basic.performance_explanation || "基于页面加载速度、资源优化程度等综合评估"}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{results.basic.seo_score}</div>
                      <div className="text-sm text-gray-600 mb-2">SEO评分</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {results.basic.seo_explanation || "考虑了页面标题优化、meta描述完整性等SEO关键因素"}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{results.basic.accessibility_score}</div>
                      <div className="text-sm text-gray-600 mb-2">可访问性评分</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {results.basic.accessibility_explanation || "评估了色彩对比度、键盘导航支持等无障碍访问标准"}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-700">{results.basic.description}</p>
                  {results.basic.technologies && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-600">检测到的技术：</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {results.basic.technologies.map((tech: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {results.tech_stack && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">技术栈分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(results.tech_stack).map(([category, technologies]: [string, any]) => (
                    <div key={category} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">{category}</h4>
                      <div className="space-y-1">
                        {Array.isArray(technologies) ? technologies.map((tech: string, index: number) => (
                          <div key={index} className="text-sm text-gray-600">{tech}</div>
                        )) : (
                          <div className="text-sm text-gray-600">{technologies}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traffic Analysis */}
            {results.traffic && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">流量分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(results.traffic).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">{value}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Website Introduction */}
            {results.website_intro && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">网站介绍</h3>

                {/* Overview */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">平台概述</h4>
                  <p className="text-gray-700">{results.website_intro.overview}</p>
                </div>

                {/* Main Features */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">主要功能</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.website_intro.main_features?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team & Business Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">创始团队</h4>
                    <p className="text-gray-700 text-sm mb-2">{results.website_intro.founding_team?.description}</p>
                    <p className="text-gray-600 text-sm">{results.website_intro.founding_team?.background}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">商业模式</h4>
                    <p className="text-gray-700 text-sm mb-2">{results.website_intro.business_model}</p>
                    <p className="text-gray-600 text-sm"><strong>目标用户：</strong>{results.website_intro.target_audience}</p>
                  </div>
                </div>
              </div>
            )}

            {/* User Needs Analysis */}
            {results.user_needs && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">用户需求分析</h3>
                <p className="text-gray-600 mb-6">该网站主要解决以下市场需求：</p>

                <div className="space-y-6">
                  {results.user_needs.primary_needs?.map((need: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{need.need}</h4>
                          <p className="text-gray-700 mb-3">{need.description}</p>
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>市场规模：</strong>{need.market_size}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Animation */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 animate-float">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-glow">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI正在分析中...</h3>
                <p className="text-gray-600">正在使用Gemini 2.5 Flash深度解析网站</p>
              </div>

              {/* Progress Steps */}
              <div className="max-w-md mx-auto">
                <div className="space-y-4">
                  {[
                    { step: 1, label: "获取网站数据", icon: "🌐" },
                    { step: 2, label: "AI智能分析", icon: "🧠" },
                    { step: 3, label: "生成洞察报告", icon: "📊" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">步骤 {item.step}</div>
                        <div className="text-xs text-gray-600">{item.label}</div>
                      </div>
                      <div className="w-6 h-6">
                        {index === 1 ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : index === 0 ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse-delay-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Animated Dots */}
              <div className="mt-8 flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"
                     style={{ width: '60%', transition: 'width 2s ease-in-out' }}></div>
              </div>

              {/* Fun Facts */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">💡 分析提示：</span>
                  我们的AI能够识别网站的技术栈、用户意图、商业模式等深层信息
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-blue-600 animate-pulse">150+</div>
                  <div className="text-xs text-gray-600">技术识别</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-green-600 animate-pulse-delay-1">95%</div>
                  <div className="text-xs text-gray-600">准确率</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-purple-600 animate-pulse-delay-2">30s</div>
                  <div className="text-xs text-gray-600">平均时长</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sample Analysis */}
        {!results && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">示例分析结果</h3>
            <p className="text-gray-600 mb-4">以下是分析结果的示例展示：</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">85</div>
                <div className="text-sm text-gray-600">性能评分</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">78</div>
                <div className="text-sm text-gray-600">SEO评分</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">92</div>
                <div className="text-sm text-gray-600">可访问性评分</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">输入网站URL开始您的第一次分析！</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}