import React from 'react';
import { cn } from '@/lib/utils';

interface NeedCardProps {
  number: number;
  title: string;
  description: string;
  marketSize: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}

const NeedCard: React.FC<NeedCardProps> = ({
  number,
  title,
  description,
  marketSize,
  color = 'blue',
  delay = 0
}) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      shadow: 'shadow-green-500/20'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      shadow: 'shadow-purple-500/20'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      shadow: 'shadow-orange-500/20'
    }
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl p-6 border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden',
        colors.border,
        colors.shadow
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 背景装饰 */}
      <div className={cn(
        'absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500',
        colors.bg
      )} />

      {/* 序号 */}
      <div className={cn(
        'relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300',
        colors.gradient
      )}>
        {number}
      </div>

      {/* 内容 */}
      <h3 className="relative text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
        {title}
      </h3>

      <p className="relative text-gray-600 leading-relaxed mb-4">
        {description}
      </p>

      {/* 市场规模标签 */}
      <div className={cn(
        'relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
        colors.bg,
        colors.text
      )}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        市场规模: {marketSize}
      </div>

      {/* 装饰性边框 */}
      <div className={cn(
        'absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
        colors.border
      )} />
    </div>
  );
};

export default NeedCard;