import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideIn';
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className,
  delay = 0,
  animation = 'fadeIn'
}) => {
  const animations = {
    fadeIn: 'animate-in fade-in duration-700',
    slideUp: 'animate-in slide-in-from-bottom-8 fade-in duration-700',
    scaleIn: 'animate-in zoom-in-95 fade-in duration-700',
    slideIn: 'animate-in slide-in-from-left-8 fade-in duration-700'
  };

  return (
    <div
      className={cn(
        animations[animation],
        'transition-all duration-700',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;