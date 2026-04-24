'use client';

/**
 * EmployeeDayHeatmap — Generic D×E heatmap widget (Phase 7 / Plan 07-06).
 *
 * Renders rows × columns × cells (each cell may carry up to 2 stacked
 * statuses: primary as background color, secondary as a small badge dot).
 *
 * Designed for the Punch dashboard heatmap (employee × day × punch status)
 * but is fully generic — `Row`, `Column`, and `HeatmapCell` are id-based.
 *
 * Mobile: parent wrapper triggers horizontal scroll; the first column
 * (employee label) is `sticky left-0` so it stays visible while scrolling.
 *
 * Color palette (dual-theme — light + dark) per CLAUDE.md APP §9.1.
 * Destructive uses `rose`, not `red` (CLAUDE.md APP §UI Quality Bar).
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export type HeatmapStatus =
  | 'NORMAL'
  | 'ATRASO'
  | 'FALTA'
  | 'EXCEÇÃO'
  | 'JUSTIFICADO'
  | 'HORA_EXTRA';

export interface HeatmapCell {
  rowId: string;
  colId: string;
  statuses: HeatmapStatus[];
  tooltip?: string;
  payload?: unknown;
}

export interface HeatmapRow {
  id: string;
  label: string;
  subLabel?: string;
}

export interface HeatmapColumn {
  id: string;
  label: string;
  isWeekend?: boolean;
  isHoliday?: boolean;
}

const STATUS_CLS: Record<HeatmapStatus, string> = {
  NORMAL:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300',
  ATRASO: 'bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300',
  FALTA: 'bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300',
  EXCEÇÃO:
    'bg-orange-50 text-orange-700 dark:bg-orange-500/8 dark:text-orange-300',
  JUSTIFICADO: 'bg-sky-50 text-sky-700 dark:bg-sky-500/8 dark:text-sky-300',
  HORA_EXTRA:
    'bg-violet-50 text-violet-700 dark:bg-violet-500/8 dark:text-violet-300',
};

interface EmployeeDayHeatmapProps {
  rows: HeatmapRow[];
  columns: HeatmapColumn[];
  cells: HeatmapCell[];
  onCellClick?: (cell: HeatmapCell) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  todayColId?: string;
  className?: string;
}

export function EmployeeDayHeatmap({
  rows,
  columns,
  cells,
  onCellClick,
  isLoading,
  emptyMessage,
  todayColId,
  className,
}: EmployeeDayHeatmapProps) {
  if (isLoading) {
    return (
      <div data-testid="heatmap-loading" className={cn('space-y-2', className)}>
        {[0, 1, 2, 3].map(i => (
          <Skeleton
            key={i}
            data-testid="heatmap-skeleton"
            className="h-8 w-full"
          />
        ))}
      </div>
    );
  }

  if (rows.length === 0 && cells.length === 0) {
    return (
      <p
        data-testid="heatmap-empty"
        className="text-center text-muted-foreground py-8"
      >
        {emptyMessage ?? 'Sem dados para o período'}
      </p>
    );
  }

  const cellByKey = new Map(
    cells.map(c => [`${c.rowId}|${c.colId}`, c] as const)
  );

  return (
    <div
      data-testid="heatmap-grid"
      className={cn('overflow-x-auto', className)}
    >
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-2 py-1 text-left min-w-[140px]">
              Funcionário
            </th>
            {columns.map(col => (
              <th
                key={col.id}
                className={cn(
                  'px-1 py-1 min-w-[28px] text-center font-medium',
                  col.isWeekend && 'text-muted-foreground',
                  col.isHoliday && 'bg-amber-50/50 dark:bg-amber-500/5'
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-accent/30">
              <td className="sticky left-0 z-10 bg-card px-2 py-1 whitespace-nowrap">
                <div className="font-medium">{row.label}</div>
                {row.subLabel && (
                  <div className="text-[10px] text-muted-foreground">
                    {row.subLabel}
                  </div>
                )}
              </td>
              {columns.map(col => {
                const cell = cellByKey.get(`${row.id}|${col.id}`);
                if (!cell) {
                  return (
                    <td
                      key={col.id}
                      data-testid={`heatmap-cell-${row.id}-${col.id}-empty`}
                      className="px-1 py-1"
                    />
                  );
                }
                const primary = cell.statuses[0];
                const secondary = cell.statuses[1];
                const isToday = todayColId === col.id;

                return (
                  <td
                    key={col.id}
                    data-testid={`heatmap-cell-${row.id}-${col.id}`}
                    title={cell.tooltip}
                    onClick={() => onCellClick?.(cell)}
                    className={cn(
                      'relative px-1 py-1 cursor-pointer rounded-sm',
                      primary && STATUS_CLS[primary],
                      isToday && 'ring-1 ring-primary'
                    )}
                  >
                    <div className="w-full h-full min-h-[20px]" />
                    {secondary && (
                      <span
                        data-testid={`heatmap-cell-secondary-${row.id}-${col.id}`}
                        className={cn(
                          'absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full',
                          STATUS_CLS[secondary]
                        )}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
