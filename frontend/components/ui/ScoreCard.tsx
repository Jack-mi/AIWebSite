import React from 'react';
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils';

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'neon' | 'gradient';
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  icon,
  description,
  size = 'md',
  variant = 'gradient'
}) => {
  const sizes = {
    sm: { score: 'text-3xl', container: 'p-4' },
    md: { score: 'text-4xl', container: 'p-6' },
    lg: { score: 'text-5xl', container: 'p-8' }
  };

  const variants = {
    default: 'bg-white border border-gray-200 shadow-lg',
    neon: 'bg-gray-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-xl'
  };

  return (
    <div className={cn(
      'rounded-xl transition-all duration-300 hover:scale-105',
      variants[variant],
      sizes[size].container
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', getScoreBgColor(score).replace('bg-', 'bg-opacity-10 bg-'))}>
            {icon}
          </div>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className={cn('font-bold', sizes[size].score, getScoreColor(score))}>
          {score}
        </span>
        <span className="text-gray-400 text-sm mb-1">/100</span>
      </div>
      {description && (
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      )}
      {/* 进度条 */}
      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            getScoreBgColor(score)
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreCard;