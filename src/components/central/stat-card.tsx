import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './glass-card';

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

const accentClasses = {
  blue: 'central-accent-blue',
  purple: 'central-accent-purple',
  pink: 'central-accent-pink',
  amber: 'central-accent-amber',
  green: 'central-accent-green',
  cyan: 'central-accent-cyan',
};

/**
 * Card de estatística com glassmorphism
 * Usa design tokens CSS para adaptar automaticamente ao tema (light/dark-blue)
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
      className={cn('p-6 relative overflow-hidden group', accentClasses[color])}
    >
      {/* Background gradient animado no hover */}
      <div className="absolute inset-0 central-accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 central-text-muted">{label}</p>
          {isLoading ? (
            <div className="h-8 w-24 rounded animate-pulse central-glass-subtle" />
          ) : (
            <p className="text-3xl font-bold central-text">{value}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs mt-2 font-medium',
                trend.isPositive
                  ? 'text-[rgb(var(--color-success))]'
                  : 'text-[rgb(var(--color-destructive))]'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>

        <div className="p-3 rounded-xl shadow-lg central-accent-gradient central-accent-text">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </GlassCard>
  );
}
