import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const variants = {
  success: 'bg-green-500/20 text-green-300 border-green-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  error: 'bg-red-500/20 text-red-300 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  default: 'bg-white/10 text-white/80 border-white/20',
};

/**
 * Badge com efeito glassmorphism
 */
export const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
          'border backdrop-blur-sm',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GlassBadge.displayName = 'GlassBadge';
