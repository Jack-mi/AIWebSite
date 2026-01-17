import React from 'react';
import { cn } from '@/lib/utils';

interface WebsiteIntroProps {
  data: {
    overview: string;
    main_features: string[];
    founding_team: {
      description: string;
      background: string;
    };
    business_model: string;
    target_audience: string;
  };
}

const WebsiteIntro: React.FC<WebsiteIntroProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* 平台概述 */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-500/30">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3">平台概述</h3>
            <p className="text-lg leading-relaxed text-white/90">
              {data.overview}
            </p>
          </div>
        </div>
      </div>

      {/* 主要功能 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          核心功能
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.main_features.map((feature, index) => (
            <div
              key={index}
              className="group flex items-start gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-400 hover:bg-green-50 transition-all duration-300 cursor-default"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold group-hover:scale-110 transition-transform duration-300">
                {index + 1}
              </div>
              <p className="text-gray-700 leading-relaxed">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 团队和商业模式 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 创始团队 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">创始团队</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium mb-1">团队描述</p>
              <p className="text-gray-700">{data.founding_team.description}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium mb-1">团队背景</p>
              <p className="text-gray-700">{data.founding_team.background}</p>
            </div>
          </div>
        </div>

        {/* 商业模式和目标用户 */}
        <div className="space-y-6">
          {/* 商业模式 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">商业模式</h3>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-gray-700">{data.business_model}</p>
            </div>
          </div>

          {/* 目标用户 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">目标用户</h3>
            </div>
            <div className="bg-cyan-50 rounded-lg p-4">
              <p className="text-gray-700">{data.target_audience}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteIntro;