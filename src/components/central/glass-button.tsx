import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * Botão com efeito glassmorphism
 * Usa design tokens CSS para adaptar automaticamente ao tema (light/dark-blue)
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: [
        'bg-[rgb(var(--color-primary))]',
        'hover:bg-[rgb(var(--color-primary-hover))]',
        'text-[rgb(var(--color-primary-foreground))]',
        'border-[rgb(var(--color-primary)/0.5)]',
        'shadow-lg',
      ].join(' '),
      secondary: [
        'central-glass',
        'hover:bg-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*1.5))]',
        'central-text',
        'shadow-md',
      ].join(' '),
      ghost: [
        'bg-transparent',
        'hover:bg-[rgb(var(--glass-bg)/var(--glass-bg-opacity))]',
        'central-text-muted',
        'border-transparent',
      ].join(' '),
      danger: [
        'bg-[rgb(var(--color-destructive)/0.2)]',
        'hover:bg-[rgb(var(--color-destructive)/0.3)]',
        'text-[rgb(var(--color-destructive))]',
        'border-[rgb(var(--color-destructive)/0.3)]',
      ].join(' '),
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
          'border',
          'central-transition',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-ring)/0.5)]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
