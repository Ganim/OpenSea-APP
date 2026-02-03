'use client';

import { cn } from '@/lib/utils';
import type { CareOption } from '@/types/stock';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import { CareIcon } from './care-icon';

interface SelectedCareListProps {
  allOptions: CareOption[];
  selectedIds: string[];
  onRemove?: (code: string) => void;
  className?: string;
}

/**
 * Lista (preview) dos itens selecionados agrupados por categoria
 */
export function SelectedCareList({
  allOptions,
  selectedIds,
  onRemove,
  className,
}: SelectedCareListProps) {
  const selectedOptions = useMemo(() => {
    return selectedIds
      .map(id => allOptions.find(o => o.code === id))
      .filter(o => o !== undefined) as CareOption[];
  }, [selectedIds, allOptions]);

  if (selectedOptions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'p-4 bg-linear-to-r from-blue-500/5 to-blue-500/10 rounded-lg border border-blue-500/20',
        'dark:from-blue-500/10 dark:to-blue-500/15 dark:border-blue-500/30',
        className
      )}
    >
      <h4 className="text-sm font-semibold text-gray-900 mb-4 dark:text-white">
        Instruções Selecionadas ({selectedOptions.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedOptions.map(option => (
          <div
            key={option.code}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full',
              'bg-white border shadow-sm transition-all',
              'hover:shadow-md hover:border-blue-500/50',
              'dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-500/50 dark:hover:shadow-lg dark:hover:shadow-blue-500/20',
              'group'
            )}
          >
            <CareIcon
              assetPath={option.assetPath}
              size={20}
              className="dark:brightness-0 dark:invert"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {option.label}
            </span>
            {onRemove && (
              <button
                onClick={() => onRemove(option.code)}
                className={cn(
                  'ml-1 flex items-center justify-center w-5 h-5 rounded-full',
                  'text-gray-400 hover:text-red-500 hover:bg-red-50',
                  'dark:hover:bg-red-500/20 dark:hover:text-red-400',
                  'transition-colors'
                )}
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
