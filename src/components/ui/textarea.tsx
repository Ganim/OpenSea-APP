import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-[120px] w-full rounded-(--input-radius) px-4 py-3 resize-y',
        'bg-(--input-bg)',
        'border border-[rgb(var(--color-border))]',
        'text-[rgb(var(--color-foreground))]',
        'placeholder:text-[rgb(var(--color-foreground-subtle))]',
        'transition-all duration-(--transition-normal)',
        'focus:outline-none focus:border-[rgb(var(--color-border-focus))]',
        'focus:ring-[3px] focus:ring-[rgb(var(--color-ring)/0.5)]',
        'disabled:cursor-not-allowed disabled:opacity-(--state-disabled-opacity)',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
