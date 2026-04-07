'use client';

import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  getActionChipDescription,
  getActionChipLabel,
  isSpecialAction,
} from '../config/permission-matrix-config';
import { PermissionChip } from './permission-chip';

interface PermissionResourceCardProps {
  label: string;
  actions: string[];
  /** Map of action → Set of permission codes for that action */
  actionCodeMap: Map<string, Set<string>>;
  selectedCodes: Set<string>;
  onToggleCode: (code: string) => void;
  onActivateAll: () => void;
  onClearAll: () => void;
  disabled?: boolean;
  defaultExpanded?: boolean;
  searchQuery?: string;
}

export function PermissionResourceCard({
  label,
  actions,
  actionCodeMap,
  selectedCodes,
  onToggleCode,
  onActivateAll,
  onClearAll,
  disabled,
  defaultExpanded = false,
  searchQuery,
}: PermissionResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Sync with external expand/collapse toggle
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  // Count active/total
  let activeCount = 0;
  let totalCount = 0;
  for (const action of actions) {
    const codes = actionCodeMap.get(action);
    if (!codes) continue;
    for (const code of codes) {
      totalCount++;
      if (selectedCodes.has(code)) activeCount++;
    }
  }

  const allActive = totalCount > 0 && activeCount === totalCount;
  const hasActive = activeCount > 0;

  // Auto-expand when searching
  const effectiveExpanded = searchQuery ? true : isExpanded;

  // Split actions into regular and special
  const regularActions = actions.filter(a => !isSpecialAction(a));
  const specialActions = actions.filter(a => isSpecialAction(a));

  return (
    <div
      className={cn(
        'rounded-xl border transition-colors mb-2',
        'bg-white dark:bg-white/[0.03]',
        allActive
          ? 'border-emerald-500/20 dark:border-emerald-500/15'
          : hasActive
            ? 'border-blue-500/25 dark:border-blue-500/20'
            : 'border-border/50'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between w-full px-4 py-3 cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={cn(
              'w-3.5 h-3.5 transition-transform duration-200 text-muted-foreground',
              effectiveExpanded && 'rotate-90',
              hasActive && 'text-blue-500 dark:text-blue-400'
            )}
          />
          <span
            className={cn(
              'text-sm font-semibold',
              hasActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium px-2 py-0.5 rounded-full',
              allActive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : hasActive
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {activeCount}/{totalCount}
          </span>
        </div>
        <span
          onClick={e => {
            e.stopPropagation();
            allActive ? onClearAll() : onActivateAll();
          }}
          className={cn(
            'text-[10px] font-medium cursor-pointer transition-colors',
            allActive
              ? 'text-rose-500 hover:text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
          )}
        >
          {allActive ? 'Limpar' : 'Tudo'}
        </span>
      </button>

      {/* Chips area */}
      {effectiveExpanded && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {regularActions.map(action => {
            const codes = actionCodeMap.get(action);
            if (!codes || codes.size === 0) return null;
            const codesArr = [...codes];
            const isActive = codesArr.every(c => selectedCodes.has(c));

            return (
              <PermissionChip
                key={action}
                label={getActionChipLabel(action)}
                description={`${getActionChipDescription(action)} (${label.toLowerCase()})`}
                isActive={isActive}
                onToggle={() => {
                  for (const code of codesArr) {
                    onToggleCode(code);
                  }
                }}
                disabled={disabled}
              />
            );
          })}

          {specialActions.map(action => {
            const codes = actionCodeMap.get(action);
            if (!codes || codes.size === 0) return null;
            const codesArr = [...codes];
            const isActive = codesArr.every(c => selectedCodes.has(c));

            return (
              <PermissionChip
                key={action}
                label={getActionChipLabel(action)}
                description={`${getActionChipDescription(action)} (${label.toLowerCase()})`}
                isActive={isActive}
                onToggle={() => {
                  for (const code of codesArr) {
                    onToggleCode(code);
                  }
                }}
                disabled={disabled}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
