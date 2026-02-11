'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  className?: string;
}

export const StatsCard = React.memo(function StatsCard({
  label,
  value,
  icon,
  trend,
  gradient,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white/95 dark:bg-white/5',
        'border border-gray-200 dark:border-white/10',
        'rounded-2xl p-4',
        'shadow-xl hover:shadow-2xl',
        'transition-shadow duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-white/60 mb-1">
            {label}
          </p>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </h3>
          {trend && (
            <p
              className={cn(
                'text-xs mt-1',
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-2xl',
            `bg-linear-to-br ${gradient}`,
            'flex items-center justify-center shadow-lg'
          )}
        >
          <div className="w-6 h-6 text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
});
