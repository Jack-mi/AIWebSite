import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
}

const Section: React.FC<SectionProps> = ({
  title,
  description,
  icon,
  children,
  className,
  gradient = 'blue'
}) => {
  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-xl overflow-hidden', className)}>
      {/* 标题栏 */}
      <div className={cn(
        'bg-gradient-to-r px-6 py-4 flex items-center gap-3',
        gradients[gradient]
      )}>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {description && (
            <p className="text-white/80 text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Section;