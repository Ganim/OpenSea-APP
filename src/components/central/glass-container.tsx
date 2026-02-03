import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface GlassContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'medium' | 'strong';
}

/**
 * Container com efeito glassmorphism para agrupar conteúdo
 */
export const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ className, variant = 'medium', children, ...props }, ref) => {
    const variants = {
      subtle: 'bg-white/5 backdrop-blur-sm border-white/10',
      medium: 'bg-white/10 backdrop-blur-md border-white/20',
      strong: 'bg-white/15 backdrop-blur-lg border-white/30',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border shadow-lg backdrop-saturate-150',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassContainer.displayName = 'GlassContainer';
