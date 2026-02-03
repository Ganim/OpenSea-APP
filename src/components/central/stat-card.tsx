import { GlassCard } from './glass-card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'purple' | 'pink' | 'amber' | 'green' | 'cyan';
  isLoading?: boolean;
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
  purple: 'from-purple-500/20 to-purple-600/20 text-purple-400',
  pink: 'from-pink-500/20 to-pink-600/20 text-pink-400',
  amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  green: 'from-green-500/20 to-green-600/20 text-green-400',
  cyan: 'from-cyan-500/20 to-cyan-600/20 text-cyan-400',
};

/**
 * Card de estatística com glassmorphism
 * Usado no dashboard para exibir métricas importantes
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  isLoading,
}: StatCardProps) {
  return (
    <GlassCard
      variant="gradient"
      hover
      className="p-6 relative overflow-hidden group"
    >
      {/* Background gradient animado no hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          colorClasses[color]
        )}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 mb-1">{label}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{value}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs mt-2 font-medium',
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>

        <div
          className={cn(
            'p-3 rounded-xl bg-gradient-to-br shadow-lg',
            colorClasses[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </GlassCard>
  );
}
