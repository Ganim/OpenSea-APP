import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

/**
 * Input com efeito glassmorphism
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-white/20 bg-white/10',
            'backdrop-blur-md backdrop-saturate-150',
            'px-4 py-2.5 text-white placeholder:text-white/40',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30',
            'hover:bg-white/15',
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
