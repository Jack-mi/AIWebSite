import React, { useState, useEffect } from 'react';

interface ShareButtonProps {
  url: string;
  title?: string;
  disabled?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title = '网站分析报告',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '𝕏',
      color: 'bg-blue-400',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${url}`)}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-600',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-500',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300',
          disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 active:scale-95'
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>分享报告</span>
        <svg className={cn('w-4 h-4 transition-transform duration-300', isOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单 */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2">
              {/* 复制链接 */}
              <button
                onClick={() => {
                  handleCopy();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                )}>
                  {copied ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">复制链接</p>
                  <p className="text-xs text-gray-500">{copied ? '已复制!' : '分享给任何人'}</p>
                </div>
              </button>

              <div className="border-t border-gray-100 my-2" />

              {/* 社交分享 */}
              {shareOptions.map((option, index) => (
                <a
                  key={index}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl', option.color)}>
                    {option.icon}
                  </div>
                  <span className="font-medium text-gray-700">{option.name}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default ShareButton;