import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const colors = {
    blue: 'border-blue-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
    orange: 'border-orange-500 border-t-transparent'
  };

  const Container = fullScreen ? 'div' : React.Fragment;

  return (
    <Container {...(fullScreen && {
      className: 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'
    })}>
      <div className="flex flex-col items-center gap-4">
        <div className={cn('rounded-full animate-spin', sizes[size], colors[color])} />
        {text && (
          <p className="text-gray-600 font-medium animate-pulse">{text}</p>
        )}
      </div>
    </Container>
  );
};

export default LoadingSpinner;