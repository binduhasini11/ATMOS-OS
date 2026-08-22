import React from 'react';
import { ThemeMode } from '../types';

interface LoadingSkeletonProps {
  theme: ThemeMode;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ theme }) => {
  const shimmerBg =
    theme === 'dark'
      ? 'bg-slate-800/60 animate-pulse'
      : 'bg-slate-200/70 animate-pulse';

  const cardBg =
    theme === 'dark'
      ? 'bg-[#10192B]/85 border-slate-800/80'
      : 'bg-white/95 border-purple-100';

  return (
    <div id="loading-weather-skeleton" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Current Weather Card Skeleton */}
      <div className={`rounded-2xl border p-6 md:p-8 ${cardBg}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className={`h-8 w-48 rounded-lg ${shimmerBg}`} />
            <div className={`h-4 w-32 rounded-md ${shimmerBg}`} />
          </div>
          <div className="flex gap-2">
            <div className={`h-9 w-20 rounded-xl ${shimmerBg}`} />
            <div className={`h-9 w-9 rounded-xl ${shimmerBg}`} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex items-center gap-6">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${shimmerBg}`} />
            <div className="space-y-3">
              <div className={`h-12 w-32 rounded-xl ${shimmerBg}`} />
              <div className={`h-4 w-28 rounded-md ${shimmerBg}`} />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-4 rounded-xl border border-transparent ${shimmerBg} h-24`} />
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/30 flex justify-between">
          <div className={`h-4 w-40 rounded-md ${shimmerBg}`} />
          <div className={`h-4 w-28 rounded-md ${shimmerBg}`} />
        </div>
      </div>

      {/* Hourly Chart Skeleton */}
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <div className="flex justify-between items-center mb-6">
          <div className={`h-5 w-52 rounded-md ${shimmerBg}`} />
          <div className={`h-8 w-36 rounded-xl ${shimmerBg}`} />
        </div>
        <div className={`h-64 w-full rounded-xl ${shimmerBg}`} />
      </div>

      {/* 5-Day Forecast Skeleton */}
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <div className={`h-5 w-44 rounded-md mb-5 ${shimmerBg}`} />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-16 w-full rounded-xl ${shimmerBg}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
