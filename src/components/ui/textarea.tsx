import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-[120px] w-full rounded-xl px-4 py-3 resize-y',
        'backdrop-blur-xl bg-white dark:bg-white/10',
        'border border-gray-300 dark:border-white/20',
        'text-gray-900 dark:text-white',
        'placeholder:text-gray-500 dark:placeholder:text-white/40',
        'transition-all duration-300',
        'focus:outline-none focus:border-blue-500 dark:focus:border-blue-400',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
