import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = '出错了',
  message,
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* 错误图标 */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
          <div className="text-6xl">😵</div>
        </div>

        {/* 装饰性光晕 */}
        <div className="absolute -inset-4 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-2xl" />
      </div>

      {/* 标题 */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h3>

      {/* 错误消息 */}
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        {message}
      </p>

      {/* 重试按钮 */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>重试</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;