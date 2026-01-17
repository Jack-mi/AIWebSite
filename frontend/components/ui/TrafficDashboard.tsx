import React from 'react';
import { cn, formatNumber } from '@/lib/utils';

interface TrafficDashboardProps {
  data: {
    monthly_visits: string;
    bounce_rate: string;
    avg_session_duration: string;
    top_countries: string[];
  };
}

const TrafficDashboard: React.FC<TrafficDashboardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          流量分析
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* 关键指标 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="月访问量"
            value={data.monthly_visits}
            color="purple"
            trend="up"
            change="+12.5%"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>}
          />

          <MetricCard
            label="跳出率"
            value={data.bounce_rate}
            color="orange"
            trend="down"
            change="-3.2%"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>}
          />

          <MetricCard
            label="平均会话时长"
            value={data.avg_session_duration}
            color="green"
            trend="up"
            change="+8.1%"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
          />
        </div>

        {/* 热门国家 */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2.5 2.5 0 002.5-2.5V3.935a8.008 8.008 0 011.35-.525 2.3 2.3 0 011.535.525 2.3 2.3 0 01-.535 1.525 8.008 8.008 0 01-1.35.525 2.3 2.3 0 01-1.535-.525 2.3 2.3 0 01.535-1.525 8.008 8.008 0 011.35-.525z" />
            </svg>
            热门访问地区
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.top_countries.map((country, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default"
              >
                <div className="text-3xl mb-2">
                  {['🇺🇸', '🇬🇧', '🇨🇦', '🇩🇪', '🇫🇷', '🇯🇵', '🇦🇺', '🇮🇳'][index % 8] || '🌍'}
                </div>
                <p className="text-sm font-medium text-gray-700">{country}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((1 - index * 0.15) * 100)}% 访问量
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 内部使用的 MetricCard 组件
function MetricCard({ label, value, color, trend, change, icon }: {
  label: string;
  value: string;
  color: 'purple' | 'orange' | 'green';
  trend: 'up' | 'down';
  change: string;
  icon: React.ReactNode;
}) {
  const colorClasses = {
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      text: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      text: 'text-orange-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      text: 'text-green-600'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={cn('rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg', colors.bg, 'border-gray-200')}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg', colors.iconBg)}>
          {icon}
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          trend === 'up' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        )}>
          {trend === 'up' ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          {change}
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', colors.text)}>{value}</p>
    </div>
  );
}

export default TrafficDashboard;