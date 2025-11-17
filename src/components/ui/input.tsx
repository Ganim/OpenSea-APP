import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full rounded-xl px-4 py-3 text-base',
        'backdrop-blur-xl bg-white dark:bg-white/10',
        'border border-gray-300 dark:border-white/20',
        'text-gray-900 dark:text-white',
        'placeholder:text-gray-500 dark:placeholder:text-white/40',
        'transition-all duration-300',
        'focus:outline-none focus:border-blue-500 dark:focus:border-blue-400',
        'disabled:pointer-events-none disabled:opacity-50',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  );
}

export { Input };
