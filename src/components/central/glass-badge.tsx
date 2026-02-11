import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

/**
 * Badge com efeito glassmorphism
 * Usa design tokens CSS para adaptar automaticamente ao tema (light/dark-blue)
 */
export const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      success: 'central-bg-success text-[rgb(var(--color-success))]',
      warning: 'central-bg-warning text-[rgb(var(--color-warning))]',
      error: 'central-bg-destructive text-[rgb(var(--color-destructive))]',
      info: 'central-bg-primary text-[rgb(var(--color-primary))]',
      default: 'central-glass-subtle central-text-muted',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
          'central-transition',
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
