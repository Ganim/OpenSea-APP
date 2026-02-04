import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

/**
 * Input com efeito glassmorphism
 * Usa design tokens CSS para adaptar automaticamente ao tema (light/dark-blue)
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 central-text-subtle">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl',
            'central-glass central-text',
            'placeholder:text-[rgb(var(--color-foreground-subtle))]',
            'backdrop-blur-md backdrop-saturate-150',
            'px-4 py-2.5',
            'central-transition',
            'focus:outline-none focus:ring-2',
            'focus:ring-[rgb(var(--color-ring)/0.3)]',
            'focus:border-[rgb(var(--color-border-focus))]',
            'hover:bg-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*1.5))]',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
