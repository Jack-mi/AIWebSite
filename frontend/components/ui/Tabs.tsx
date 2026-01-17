import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  defaultTab?: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange(tabId);
  };

  const variants = {
    default: 'bg-gray-100 rounded-xl p-1',
    pills: 'bg-gray-100 rounded-full p-1',
    underline: 'border-b border-gray-200'
  };

  return (
    <div className={variants[variant]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        const tabStyles = variant === 'underline'
          ? cn(
              'relative px-6 py-3 font-medium transition-all duration-300',
              isActive
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )
          : cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300',
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            );

        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={tabStyles}
          >
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
            {variant === 'underline' && isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;