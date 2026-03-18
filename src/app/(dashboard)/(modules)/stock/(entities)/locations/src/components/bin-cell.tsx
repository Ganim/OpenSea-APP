'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BinOccupancy, OccupancyLevel } from '@/types/stock';
import { getOccupancyLevel } from '@/types/stock';

interface BinCellProps {
  bin: BinOccupancy;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const OCCUPANCY_BG: Record<OccupancyLevel, string> = {
  empty: 'bg-gray-100 dark:bg-gray-800',
  low: 'bg-emerald-200 dark:bg-emerald-900',
  medium: 'bg-amber-200 dark:bg-amber-900',
  high: 'bg-orange-200 dark:bg-orange-900',
  full: 'bg-rose-200 dark:bg-rose-900',
  blocked: 'bg-gray-200 dark:bg-gray-700',
};

const OCCUPANCY_LABEL: Record<OccupancyLevel, string> = {
  empty: 'Vazio',
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  full: 'Cheio',
  blocked: 'Bloqueado',
};

export const BinCellNew = memo(function BinCellNew({
  bin,
  isHighlighted,
  onClick,
}: BinCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pulseActive, setPulseActive] = useState(!!isHighlighted);

  useEffect(() => {
    if (isHighlighted) {
      setPulseActive(true);
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      const timer = setTimeout(() => setPulseActive(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setPulseActive(false);
    }
  }, [isHighlighted]);

  const level = getOccupancyLevel(bin);

  const cell = (
    <div
      ref={ref}
      data-bin-id={bin.id}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Nicho ${bin.address}`}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'w-10 h-10 flex items-center justify-center border border-border rounded-sm transition-colors',
        onClick && 'cursor-pointer',
        OCCUPANCY_BG[level],
        isHighlighted && 'ring-2 ring-blue-500',
        isHighlighted && pulseActive && 'animate-pulse',
      )}
    >
      {level === 'blocked' && <Lock className="h-3 w-3 text-muted-foreground" />}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{cell}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-mono font-bold text-sm">{bin.address}</p>
            <div className="text-xs space-y-0.5">
              <p>
                <span className="text-muted-foreground">Itens:</span>{' '}
                <span className="font-medium">{bin.itemCount}</span>
                {bin.capacity != null && (
                  <span className="text-muted-foreground">/{bin.capacity}</span>
                )}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span>{' '}
                <span className="font-medium">{OCCUPANCY_LABEL[level]}</span>
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
