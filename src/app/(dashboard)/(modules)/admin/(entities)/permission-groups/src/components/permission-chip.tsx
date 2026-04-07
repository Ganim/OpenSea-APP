'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PermissionChipProps {
  label: string;
  description: string;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function PermissionChip({
  label,
  description,
  isActive,
  onToggle,
  disabled,
}: PermissionChipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border',
            'transition-all duration-150 cursor-pointer select-none',
            'disabled:pointer-events-none disabled:opacity-40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            isActive
              ? [
                  'bg-emerald-600 text-white border-emerald-600',
                  'shadow-sm shadow-emerald-600/25',
                  'dark:bg-emerald-600 dark:text-white dark:border-emerald-600',
                  'hover:bg-emerald-700 hover:border-emerald-700 dark:hover:bg-emerald-500 dark:hover:border-emerald-500',
                ]
              : [
                  'bg-white text-muted-foreground border-border',
                  'dark:bg-white/5 dark:border-white/10 dark:text-muted-foreground',
                  'hover:bg-slate-50 hover:border-slate-300',
                  'dark:hover:bg-white/8 dark:hover:border-white/20',
                ]
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center w-4 h-4 rounded shrink-0 transition-colors',
              isActive
                ? 'bg-white/25 border border-white/40'
                : 'bg-slate-100 border border-slate-300 dark:bg-white/10 dark:border-white/20'
            )}
          >
            {isActive && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </span>
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
