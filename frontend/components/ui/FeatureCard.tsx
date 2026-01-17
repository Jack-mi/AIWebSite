import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  color = 'blue',
  delay = 0
}) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      glow: 'group-hover:shadow-blue-500/50'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      glow: 'group-hover:shadow-green-500/50'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      glow: 'group-hover:shadow-purple-500/50'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      glow: 'group-hover:shadow-orange-500/50'
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      glow: 'group-hover:shadow-red-500/50'
    }
  };

  const colors = colorClasses[color];

  return (
    <div
      className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 背景光晕效果 */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500',
        colors.gradient
      )} />

      {/* 图标容器 */}
      <div className={cn(
        'relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300',
        colors.gradient
      )}>
        <div className="text-white text-2xl">
          {icon}
        </div>
      </div>

      {/* 内容 */}
      <h3 className="relative text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
        {title}
      </h3>
      <p className="relative text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* 装饰性元素 */}
      <div className={cn(
        'absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500',
        colors.glow,
        colors.gradient.replace('to-', 'shadow-')
      )} />
    </div>
  );
};

export default FeatureCard;