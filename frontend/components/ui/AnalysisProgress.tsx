import React, { useState, useEffect } from 'react';

interface AnalysisProgressProps {
  steps: Array<{ label: string; status: 'pending' | 'active' | 'complete' }>;
  currentStep: number;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ steps, currentStep }) => {
  const [animatedStep, setAnimatedStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedStep(prev => {
        if (prev < currentStep) return prev + 1;
        if (prev > currentStep) return prev - 1;
        return prev;
      });
    }, 300);
    return () => clearInterval(timer);
  }, [currentStep]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">正在分析网站</h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isPast = index < animatedStep;
          const isCurrent = index === animatedStep;
          const isFuture = index > animatedStep;

          return (
            <div
              key={index}
              className="flex items-center gap-4 transition-all duration-500"
              style={{
                opacity: isFuture ? 0.5 : 1,
                transform: isCurrent ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {/* 状态图标 */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all duration-500',
                  isPast && 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30',
                  isCurrent && 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 animate-pulse',
                  isFuture && 'bg-gray-200 text-gray-400'
                )}
              >
                {isPast ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                ) : (
                  index + 1
                )}
              </div>

              {/* 连接线 */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 transition-all duration-500',
                    isPast ? 'bg-green-400' : 'bg-gray-200'
                  )}
                />
              )}

              {/* 步骤标签 */}
              <div className="flex-1">
                <p
                  className={cn(
                    'font-medium transition-colors duration-300',
                    isPast && 'text-green-600',
                    isCurrent && 'text-blue-600',
                    isFuture && 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-gray-500 mt-1 animate-pulse">
                    处理中...
                  </p>
                )}
                {isPast && (
                  <p className="text-sm text-green-600 mt-1">完成</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 整体进度 */}
      <div className="mt-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>分析进度</span>
          <span className="font-semibold text-blue-600">
            {Math.round((animatedStep / (steps.length - 1)) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(animatedStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;