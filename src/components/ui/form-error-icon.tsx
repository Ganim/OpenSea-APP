'use client';

import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FormErrorIconProps {
  message: string;
  className?: string;
}

export function FormErrorIcon({ message, className }: FormErrorIconProps) {
  if (!message) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-destructive))] hover:text-[rgb(var(--color-destructive-hover))] transition-colors focus:outline-none',
            className
          )}
          aria-label={`Erro: ${message}`}
          tabIndex={-1}
        >
          <AlertCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs bg-[rgb(var(--color-destructive))] text-white border-none text-xs"
      >
        {message}
      </TooltipContent>
    </Tooltip>
  );
}
