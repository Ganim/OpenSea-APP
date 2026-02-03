'use client';

import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Box,
  History,
} from 'lucide-react';
import type { MovementStats } from '../types/movements.types';
import { StatCard } from './stat-card';

interface MovementStatsGridProps {
  stats: MovementStats;
}

export function MovementStatsGrid({ stats }: MovementStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total"
        value={stats.total}
        icon={History}
        className="bg-muted/50"
      />
      <StatCard
        label="Entradas"
        value={stats.entries}
        subValue={`+${stats.totalEntryQty} un`}
        icon={ArrowDownToLine}
        className="bg-green-50 dark:bg-green-900/20"
        iconClass="text-green-600"
      />
      <StatCard
        label="Saidas"
        value={stats.exits}
        subValue={`-${stats.totalExitQty} un`}
        icon={ArrowUpFromLine}
        className="bg-red-50 dark:bg-red-900/20"
        iconClass="text-red-600"
      />
      <StatCard
        label="Transferencias"
        value={stats.transfers}
        icon={ArrowRightLeft}
        className="bg-blue-50 dark:bg-blue-900/20"
        iconClass="text-blue-600"
      />
      <StatCard
        label="Ajustes"
        value={stats.adjustments}
        icon={Box}
        className="bg-orange-50 dark:bg-orange-900/20"
        iconClass="text-orange-600"
      />
    </div>
  );
}
