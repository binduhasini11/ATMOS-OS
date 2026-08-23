import React from 'react';
import { ThemeMode } from '../types';

interface LoadingSkeletonProps {
  theme: ThemeMode;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const shimmer = isDark
    ? 'bg-slate-800/70 animate-pulse rounded-lg'
    : 'bg-stone-300/50 animate-pulse rounded-lg';

  const cardCls = isDark
    ? 'atmos-card-dark border-slate-800/70 rounded-2xl border'
    : 'atmos-card-light border-stone-300/50 rounded-2xl border';

  return (
    <div id="loading-weather-skeleton" className="space-y-6">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <div className={`h-3 w-36 ${shimmer}`} />
        <div className={`h-10 w-72 ${shimmer}`} />
        <div className={`h-3 w-52 ${shimmer}`} />
      </div>

      {/* Current weather card skeleton */}
      <div className={`${cardCls} p-6`}>
        <div className="flex justify-between items-start mb-6">
          <div className={`h-3 w-28 ${shimmer}`} />
        </div>
        <div className="flex justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-14 h-14 ${shimmer} rounded-xl`} />
            <div className={`h-24 w-36 ${shimmer}`} />
          </div>
          <div className="text-right space-y-2">
            <div className={`h-4 w-20 ml-auto ${shimmer}`} />
            <div className={`h-6 w-28 ml-auto ${shimmer}`} />
            <div className={`h-3 w-20 ml-auto ${shimmer}`} />
          </div>
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${cardCls} p-4`}>
            <div className={`h-3 w-16 mb-3 ${shimmer}`} />
            <div className={`h-8 w-20 mb-1 ${shimmer}`} />
            <div className={`h-3 w-24 ${shimmer}`} />
          </div>
        ))}
      </div>

      {/* Hourly chart skeleton */}
      <div className={`${cardCls} p-6`}>
        <div className="mb-6 space-y-2">
          <div className={`h-2 w-24 ${shimmer}`} />
          <div className={`h-7 w-44 ${shimmer}`} />
        </div>
        <div className={`h-56 w-full ${shimmer}`} />
      </div>

      {/* Bottom grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-7 ${cardCls} p-6`}>
          <div className="mb-5 space-y-2">
            <div className={`h-2 w-24 ${shimmer}`} />
            <div className={`h-7 w-40 ${shimmer}`} />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-10 w-full ${shimmer}`} />
            ))}
          </div>
        </div>
        <div className={`lg:col-span-5 space-y-3`}>
          <div className={`${cardCls} p-5 h-40`}>
            <div className={`h-2 w-20 mb-4 ${shimmer}`} />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-16 ${shimmer} rounded-xl`} />
              ))}
            </div>
          </div>
          <div className={`${cardCls} p-5 h-40`}>
            <div className={`h-2 w-24 mb-4 ${shimmer}`} />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-16 ${shimmer} rounded-xl`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
