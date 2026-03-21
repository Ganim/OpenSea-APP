'use client';

import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentBin } from '@/hooks/mobile/use-receiving';

interface RecentBinChipsProps {
  bins: RecentBin[];
  selectedBinId?: string | null;
  onSelect: (bin: RecentBin) => void;
  onClear?: () => void;
  className?: string;
}

export function RecentBinChips({
  bins,
  selectedBinId,
  onSelect,
  onClear,
  className,
}: RecentBinChipsProps) {
  if (bins.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">Bins recentes</p>
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] text-slate-500 active:text-slate-300"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {bins.map(bin => {
          const isSelected = selectedBinId === bin.id;
          return (
            <button
              key={bin.id}
              onClick={() => onSelect(bin)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                isSelected
                  ? 'border-indigo-400 bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                  : 'border-slate-600 bg-slate-800/60 text-slate-300 active:bg-slate-700/80'
              )}
            >
              <MapPin className="h-3 w-3" />
              {bin.address}
            </button>
          );
        })}
      </div>
    </div>
  );
}
