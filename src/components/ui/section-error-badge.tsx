'use client';

import { cn } from '@/lib/utils';

interface SectionErrorBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function SectionErrorBadge({ count, onClick, className }: SectionErrorBadgeProps) {
  if (count <= 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-5 h-5 px-1.5 rounded-full',
        'bg-[rgb(var(--color-destructive))] text-white',
        'text-xs font-medium',
        'animate-in zoom-in-50 duration-200',
        'hover:bg-[rgb(var(--color-destructive-hover))] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-destructive)/0.3)]',
        className
      )}
      aria-label={`${count} erro${count > 1 ? 's' : ''} nesta seção`}
    >
      {count}
    </button>
  );
}
