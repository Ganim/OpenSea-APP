import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'darker' | 'lighter' | 'gradient';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

/**
 * Card com efeito glassmorphism
 * Variações de transparência e blur configuráveis
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = 'default',
      blur = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white/10 dark:bg-white/5 border-white/20',
      darker: 'bg-black/20 dark:bg-black/30 border-white/10',
      lighter: 'bg-white/20 dark:bg-white/10 border-white/30',
      gradient: 'bg-gradient-to-br from-white/15 to-white/5 border-white/20',
    };

    const blurs = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border shadow-xl',
          'backdrop-saturate-150',
          variants[variant],
          blurs[blur],
          hover &&
            'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/15',
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
