import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

export type GlassTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Textarea com efeito glassmorphism para o Central.
 * Segue o mesmo padrão visual do GlassInput.
 */
export const GlassTextarea = forwardRef<
  HTMLTextAreaElement,
  GlassTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full min-h-[120px] rounded-xl resize-y',
        'central-glass central-text',
        'placeholder:text-[rgb(var(--color-foreground-subtle))]',
        'px-4 py-2.5',
        'central-transition',
        'focus:outline-none focus:ring-2',
        'focus:ring-[rgb(var(--color-ring)/0.3)]',
        'focus:border-[rgb(var(--color-border-focus))]',
        'hover:bg-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*1.5))]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});

GlassTextarea.displayName = 'GlassTextarea';
