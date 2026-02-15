import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'strong' | 'gradient';
  hover?: boolean;
}

/**
 * Card com efeito glassmorphism
 * Variações de transparência e blur configuráveis
 * Usa design tokens CSS para adaptar automaticamente ao tema (light/dark-blue)
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, variant = 'default', hover = false, children, ...props },
    ref
  ) => {
    const variants = {
      default: 'central-glass',
      subtle: 'central-glass-subtle',
      strong: 'central-glass-strong',
      gradient:
        'central-glass bg-linear-to-br from-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*1.5))] to-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*0.5))]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl shadow-xl central-transition',
          variants[variant],
          hover && 'central-glass-hover hover:scale-[1.02] hover:shadow-2xl',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
