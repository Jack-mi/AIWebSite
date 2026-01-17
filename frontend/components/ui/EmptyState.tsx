import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* 图标 */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-6xl">
            {icon || (
              <svg className="w-20 h-20 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9.75 0a9 9 0 00-9 9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 0a9 9 0 019-9m9 9c1.657 0 3 4.03 3 9s-1.343 9-3 9" />
              </svg>
            )}
          </div>
        </div>

        {/* 装饰性光晕 */}
        <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* 标题 */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;