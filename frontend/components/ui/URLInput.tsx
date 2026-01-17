import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  loading?: boolean;
  placeholder?: string;
  error?: string;
}

const URLInput: React.FC<URLInputProps> = ({
  value,
  onChange,
  onAnalyze,
  loading = false,
  placeholder = 'https://example.com',
  error
}) => {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        {/* 背景光晕 */}
        <div className={cn(
          'absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300',
          focused && 'opacity-30'
        )} />

        {/* 主容器 */}
        <div className={cn(
          'relative flex items-center gap-4 bg-white rounded-2xl border-2 transition-all duration-300 shadow-xl',
          error ? 'border-red-400' : focused ? 'border-blue-500 shadow-blue-500/25' : 'border-gray-200',
          'group-hover:border-blue-300'
        )}>
          {/* 图标 */}
          <div className="pl-6 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 0a9 9 0 019-9m9 9c1.657 0 3 4.03 3 9s-1.343 9-3 9" />
            </svg>
          </div>

          {/* 输入框 */}
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={loading}
            className={cn(
              'flex-1 py-4 pr-4 text-lg text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none disabled:opacity-50',
              error && 'text-red-600 placeholder-red-300'
            )}
          />

          {/* 分析按钮 */}
          <button
            type="submit"
            disabled={loading || !value}
            className={cn(
              'px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300',
              loading || !value
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>分析中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>开始分析</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="absolute -bottom-8 left-0 text-red-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </form>
  );
};

export default URLInput;