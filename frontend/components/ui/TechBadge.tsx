import React from 'react';
import { cn } from '@/lib/utils';

interface TechBadgeProps {
  name: string;
  category?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
}

const TechBadge: React.FC<TechBadgeProps> = ({
  name,
  category,
  color = 'blue',
  size = 'md'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-500'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      dot: 'bg-purple-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      dot: 'bg-orange-500'
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-700',
      dot: 'bg-pink-500'
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      dot: 'bg-cyan-500'
    }
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const colors = colorClasses[color];

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-md cursor-default',
      colors.bg,
      colors.border,
      sizes[size]
    )}>
      <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
      <span className={cn('font-medium', colors.text)}>{name}</span>
      {category && (
        <span className={cn('text-xs opacity-70', colors.text)}>({category})</span>
      )}
    </div>
  );
};

export default TechBadge;