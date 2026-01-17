import React from 'react';

interface OverviewHeaderProps {
  url: string;
  title?: string;
  description?: string;
  logo?: string;
  favicon?: string;
}

const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  url,
  title,
  description,
  logo,
  favicon
}) => {
  const domain = new URL(url).hostname;

  return (
    <div className="relative overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />

      {/* 装饰性图案 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* 内容 */}
      <div className="relative px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 网站信息 */}
          <div className="flex items-start gap-6 mb-8">
            {/* Logo/Favicon */}
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl">
              {favicon ? (
                <img src={favicon} alt="" className="w-16 h-16 object-contain" />
              ) : logo ? (
                <img src={logo} alt="" className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-4xl">🌐</span>
              )}
            </div>

            {/* 网站标题和URL */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {title || domain}
              </h1>
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 0a9 9 0 019-9m9 9c1.657 0 3 4.03 3 9s-1.343 9-3 9" />
                </svg>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors hover:underline"
                >
                  {url}
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* 描述 */}
          {description && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-lg text-white/90 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* 分析时间戳 */}
          <div className="mt-6 flex items-center gap-2 text-white/70 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>分析完成于 {new Date().toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>

      {/* 底部渐变遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
    </div>
  );
};

export default OverviewHeader;