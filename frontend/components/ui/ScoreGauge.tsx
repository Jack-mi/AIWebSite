import React from 'react';
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  size = 'md',
  showLabel = true
}) => {
  const sizes = {
    sm: { container: 'w-24 h-24', circle: 'w-20 h-20', text: 'text-2xl' },
    md: { container: 'w-32 h-32', circle: 'w-28 h-28', text: 'text-4xl' },
    lg: { container: 'w-40 h-40', circle: 'w-36 h-36', text: 'text-5xl' }
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = getScoreBgColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className={cn('relative', sizes[size].container)}>
        {/* 背景圆环 */}
        <svg
          className={cn('absolute inset-0', sizes[size].circle)}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        {/* 进度圆环 */}
        <svg
          className={cn('absolute inset-0 -rotate-90', sizes[size].circle)}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
              filter: `drop-shadow(0 0 8px ${strokeColor}40)`
            }}
          />
        </svg>

        {/* 分数 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', sizes[size].text, getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>

      {showLabel && (
        <p className="mt-3 text-sm font-medium text-gray-600">{label}</p>
      )}
    </div>
  );
};

export default ScoreGauge;