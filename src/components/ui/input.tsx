import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full rounded-(--input-radius) px-4 py-3 text-base',
        'backdrop-blur-(--glass-blur) bg-(--input-bg)',
        'border border-[rgb(var(--color-border))]',
        'text-[rgb(var(--color-foreground))]',
        'placeholder:text-[rgb(var(--color-foreground-subtle))]',
        'transition-all duration-(--transition-normal)',
        'focus:outline-none focus:border-[rgb(var(--color-border-focus))]',
        'focus:ring-[3px] focus:ring-[rgb(var(--color-ring)/0.5)]',
        'disabled:pointer-events-none disabled:opacity-(--state-disabled-opacity) disabled:bg-[rgb(var(--color-background-muted))]',
        'aria-invalid:border-[rgb(var(--color-border-error))] aria-invalid:ring-[rgb(var(--color-destructive)/0.2)]',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  );
}

export { Input };
