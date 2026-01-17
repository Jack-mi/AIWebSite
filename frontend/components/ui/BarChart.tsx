import React from 'react';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  height?: number;
  showValues?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 200,
  showValues = true
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
      )}

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const gradient = item.color || colors[index % colors.length];

          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                {showValues && (
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                )}
              </div>

              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg',
                    gradient
                  )}
                  style={{ width: `${percentage}%` }}
                >
                  <div className="h-full w-2 bg-white/30 rounded-full blur-sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;