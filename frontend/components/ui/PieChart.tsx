import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PieChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  size = 'md',
  showLegend = true
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sizes = {
    sm: { container: 'w-32 h-32', circle: 'w-24 h-24' },
    md: { container: 'w-48 h-48', circle: 'w-40 h-40' },
    lg: { container: 'w-64 h-64', circle: 'w-56 h-56' }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500'
  ];

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const renderPieSlice = (startPercent: number, endPercent: number, color: string, index: number) => {
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`
    ].join(' ');

    return (
      <path
        d={pathData}
        fill={color}
        className={cn(
          'transition-all duration-300 cursor-pointer',
          hoveredIndex === index ? 'transform scale-110 shadow-lg' : 'hover:scale-105'
        )}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
      />
    );
  };

  let cumulativePercent = 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
      )}

      <div className="flex items-start gap-8">
        {/* 饼图 */}
        <div className={cn('relative', sizes[size].container)}>
          <svg
            viewBox="-1.2 -1.2 2.4 2.4"
            className={cn('w-full h-full', sizes[size].circle)}
          >
            {data.map((item, index) => {
              const percent = item.value / total;
              const startPercent = cumulativePercent;
              cumulativePercent += percent;
              const color = item.color || colors[index % colors.length];

              return renderPieSlice(startPercent, cumulativePercent, color, index);
            })}
          </svg>
        </div>

        {/* 图例 */}
        {showLegend && (
          <div className="flex-1 space-y-3">
            {data.map((item, index) => {
              const color = item.color || colors[index % colors.length];
              const percentage = ((item.value / total) * 100).toFixed(1);

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-all duration-300',
                    hoveredIndex === index ? 'bg-gray-50 scale-105' : ''
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={cn('w-4 h-4 rounded-full', color)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChart;