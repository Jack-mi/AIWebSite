import React from 'react';
import { cn, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  trend,
  icon,
  color = 'blue',
  size = 'md'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200'
    }
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const colors = colorClasses[color];

  return (
    <div className={cn(
      'rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg',
      colors.bg,
      colors.border,
      sizes[size]
    )}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={cn('p-3 rounded-lg', colors.iconBg)}>
            {icon}
          </div>
        )}
        {change && trend && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full',
            trend === 'up' ? 'text-green-600 bg-green-100' :
            trend === 'down' ? 'text-red-600 bg-red-100' :
            'text-gray-600 bg-gray-100'
          )}>
            {trend === 'up' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>}
            {trend === 'down' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>}
            {change}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', colors.text)}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
    </div>
  );
};

export default MetricCard;