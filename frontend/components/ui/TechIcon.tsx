import React from 'react';
import { cn } from '@/lib/utils';

interface TechIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TechIcon: React.FC<TechIconProps> = ({
  name,
  size = 'md',
  showLabel = true
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  const getTechIcon = (tech: string): { icon: string; color: string } => {
    const tech = tech.toLowerCase();

    if (tech.includes('react')) return { icon: '⚛️', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('vue')) return { icon: '💚', color: 'bg-green-100 text-green-600' };
    if (tech.includes('angular')) return { icon: '🅰️', color: 'bg-red-100 text-red-600' };
    if (tech.includes('node')) return { icon: '🟢', color: 'bg-green-100 text-green-600' };
    if (tech.includes('python')) return { icon: '🐍', color: 'bg-yellow-100 text-yellow-600' };
    if (tech.includes('java')) return { icon: '☕', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('typescript')) return { icon: '🔷', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('javascript')) return { icon: '📜', color: 'bg-yellow-100 text-yellow-600' };
    if (tech.includes('go')) return { icon: '🐹', color: 'bg-cyan-100 text-cyan-600' };
    if (tech.includes('rust')) return { icon: '🦀', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('php')) return { icon: '🐘', color: 'bg-indigo-100 text-indigo-600' };
    if (tech.includes('ruby')) return { icon: '💎', color: 'bg-red-100 text-red-600' };
    if (tech.includes('swift')) return { icon: '🍎', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('kotlin')) return { icon: '🤖', color: 'bg-purple-100 text-purple-600' };
    if (tech.includes('docker')) return { icon: '🐳', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('kubernetes')) return { icon: '☸️', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('aws')) return { icon: '☁️', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('gcp')) return { icon: '🌐', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('azure')) return { icon: '🔷', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('mongodb')) return { icon: '🍃', color: 'bg-green-100 text-green-600' };
    if (tech.includes('mysql')) return { icon: '🐬', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('postgres')) return { icon: '🐘', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('redis')) return { icon: '🔴', color: 'bg-red-100 text-red-600' };
    if (tech.includes('elasticsearch')) return { icon: '🔍', color: 'bg-yellow-100 text-yellow-600' };
    if (tech.includes('graphql')) return { icon: '◈', color: 'bg-pink-100 text-pink-600' };
    if (tech.includes('rest')) return { icon: '🌐', color: 'bg-green-100 text-green-600' };
    if (tech.includes('next')) return { icon: '▲', color: 'bg-gray-100 text-gray-600' };
    if (tech.includes('nuxt')) return { icon: '🟢', color: 'bg-green-100 text-green-600' };
    if (tech.includes('tailwind')) return { icon: '🌊', color: 'bg-cyan-100 text-cyan-600' };
    if (tech.includes('bootstrap')) return { icon: '🅱️', color: 'bg-purple-100 text-purple-600' };
    if (tech.includes('material')) return { icon: '🎨', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('chakra')) return { icon: '🎯', color: 'bg-teal-100 text-teal-600' };
    if (tech.includes('ant')) return { icon: '🐜', color: 'bg-red-100 text-red-600' };
    if (tech.includes('firebase')) return { icon: '🔥', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('supabase')) return { icon: '⚡', color: 'bg-green-100 text-green-600' };
    if (tech.includes('prisma')) return { icon: '🔷', color: 'bg-gray-100 text-gray-600' };
    if (tech.includes('sequelize')) return { icon: '🔷', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('typeorm')) return { icon: '🔷', color: 'bg-pink-100 text-pink-600' };
    if (tech.includes('mongoose')) return { icon: '🔷', color: 'bg-green-100 text-green-600' };
    if (tech.includes('redux')) return { icon: '🔮', color: 'bg-purple-100 text-purple-600' };
    if (tech.includes('mobx')) return { icon: '🔮', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('zustand')) return { icon: '🐻', color: 'bg-yellow-100 text-yellow-600' };
    if (tech.includes('recoil')) return { icon: '⚛️', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('jest')) return { icon: '🃏', color: 'bg-red-100 text-red-600' };
    if (tech.includes('vitest')) return { icon: '⚡', color: 'bg-yellow-100 text-yellow-600' };
    if (tech.includes('cypress')) return { icon: '🌲', color: 'bg-green-100 text-green-600' };
    if (tech.includes('playwright')) return { icon: '🎭', color: 'bg-green-100 text-green-600' };
    if (tech.includes('selenium')) return { icon: '🧪', color: 'bg-green-100 text-green-600' };
    if (tech.includes('webpack')) return { icon: '📦', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('vite')) return { icon: '⚡', color: 'bg-purple-100 text-purple-600' };
    if (tech.includes('parcel')) return { icon: '📦', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('rollup')) return { icon: '🍣', color: 'bg-red-100 text-red-600' };
    if (tech.includes('esbuild')) return { icon: '🏗️', color: 'bg-yellow-100 text-yellow-600' };
    if (tech.includes('babel')) return { icon: '🅱️', color: 'bg-yellow-100 text-yellow-600' };
    if (tech.includes('swc')) return { icon: '⚡', color: 'bg-orange-100 text-orange-600' };
    if (tech.includes('turbopack')) return { icon: '🌀', color: 'bg-gray-100 text-gray-600' };
    if (tech.includes('nx')) return { icon: '🔷', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('turborepo')) return { icon: '🌀', color: 'bg-red-100 text-red-600' };
    if (tech.includes('lerna')) return { icon: '🔷', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('rush')) return { icon: '🏃', color: 'bg-green-100 text-green-600' };
    if (tech.includes('vercel')) return { icon: '▲', color: 'bg-gray-100 text-gray-600' };
    if (tech.includes('netlify')) return { icon: '🌊', color: 'bg-teal-100 text-teal-600' };
    if (tech.includes('heroku')) return { icon: '🟣', color: 'bg-purple-100 text-purple-600' };
    if (tech.includes('railway')) return { icon: '🚂', color: 'bg-purple-100 text-purple-600' };
    if (tech.includes('render')) return { icon: '🎬', color: 'bg-blue-100 text-blue-600' };
    if (tech.includes('fly.io')) return { icon: '🪰', color: 'bg-orange-100 text-orange-600' };

    return { icon: '📦', color: 'bg-gray-100 text-gray-600' };
  };

  const { icon, color } = getTechIcon(name);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg', sizes[size], color)}>
        {icon}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 text-center">{name}</span>
      )}
    </div>
  );
};

export default TechIcon;