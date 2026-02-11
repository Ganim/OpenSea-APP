import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface GlassContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'medium' | 'strong';
}

/**
 * Container com efeito glassmorphism para agrupar conteúdo
 * Usa design tokens CSS para adaptar automaticamente ao tema (light/dark-blue)
 */
export const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ className, variant = 'medium', children, ...props }, ref) => {
    const variants = {
      subtle: 'central-glass-subtle',
      medium: 'central-glass',
      strong: 'central-glass-strong',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl shadow-lg central-transition',
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
