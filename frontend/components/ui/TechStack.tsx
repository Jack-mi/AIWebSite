import React from 'react';
import { cn } from '@/lib/utils';

interface TechStackProps {
  stacks: {
    category: string;
    technologies: string[];
  }[];
}

const TechStack: React.FC<TechStackProps> = ({ stacks }) => {
  const categoryColors: Record<string, { color: string; icon: string }> = {
    frontend: {
      color: 'blue',
      icon: '🎨'
    },
    backend: {
      color: 'green',
      icon: '⚙️'
    },
    database: {
      color: 'purple',
      icon: '🗄️'
    },
    hosting: {
      color: 'orange',
      icon: '☁️'
    },
    devops: {
      color: 'cyan',
      icon: '🚀'
    },
    other: {
      color: 'pink',
      icon: '📦'
    }
  };

  const getCategoryColor = (category: string) => {
    const key = category.toLowerCase();
    return categoryColors[key] || categoryColors.other;
  };

  return (
    <div className="space-y-6">
      {stacks.map((stack, index) => {
        const { color, icon } = getCategoryColor(stack.category);
        const colorMap = {
          blue: 'from-blue-500 to-blue-600',
          green: 'from-green-500 to-green-600',
          purple: 'from-purple-500 to-purple-600',
          orange: 'from-orange-500 to-orange-600',
          cyan: 'from-cyan-500 to-cyan-600',
          pink: 'from-pink-500 to-pink-600'
        };

        return (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            {/* 标题栏 */}
            <div className={cn(
              'bg-gradient-to-r px-6 py-4 flex items-center gap-3',
              colorMap[color as keyof typeof colorMap]
            )}>
              <span className="text-2xl">{icon}</span>
              <h3 className="text-lg font-bold text-white capitalize">{stack.category}</h3>
              <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white font-medium">
                {stack.technologies.length} 项技术
              </span>
            </div>

            {/* 技术列表 */}
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {stack.technologies.map((tech, techIndex) => (
                  <div
                    key={techIndex}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-default',
                      color === 'blue' && 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
                      color === 'green' && 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
                      color === 'purple' && 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
                      color === 'orange' && 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
                      color === 'cyan' && 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100',
                      color === 'pink' && 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                    <span className="font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TechStack;