'use client';

import { cn } from '@/lib/utils';

interface PermissionGroupHeaderProps {
  label: string;
  resourceCount: number;
  onActivateAll: () => void;
  allActive: boolean;
  disabled?: boolean;
}

export function PermissionGroupHeader({
  label,
  resourceCount,
  onActivateAll,
  allActive,
  disabled,
}: PermissionGroupHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border/30 first:mt-0 mt-5">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {resourceCount} {resourceCount === 1 ? 'recurso' : 'recursos'}
        </span>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onActivateAll}
        className={cn(
          'text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors',
          'disabled:pointer-events-none disabled:opacity-40',
          allActive
            ? 'text-rose-500 hover:bg-rose-500/10 dark:text-rose-400'
            : 'text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400'
        )}
      >
        {allActive ? 'Limpar grupo' : 'Ativar grupo'}
      </button>
    </div>
  );
}
