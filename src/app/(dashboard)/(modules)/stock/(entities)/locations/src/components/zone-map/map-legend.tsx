'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEGEND_ITEMS = [
  {
    label: 'Vazio',
    color: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-600 dark:text-gray-400',
  },
  {
    label: 'Baixo (1-25%)',
    color: 'bg-green-100 dark:bg-green-900/40',
    textColor: 'text-green-700 dark:text-green-400',
  },
  {
    label: 'Médio (26-50%)',
    color: 'bg-yellow-100 dark:bg-yellow-900/40',
    textColor: 'text-yellow-700 dark:text-yellow-400',
  },
  {
    label: 'Alto (51-75%)',
    color: 'bg-orange-100 dark:bg-orange-900/40',
    textColor: 'text-orange-700 dark:text-orange-400',
  },
  {
    label: 'Cheio (76-100%)',
    color: 'bg-red-100 dark:bg-red-900/40',
    textColor: 'text-red-700 dark:text-red-400',
  },
  {
    label: 'Bloqueado',
    color: 'bg-gray-300 dark:bg-gray-600',
    textColor: 'text-gray-500 dark:text-gray-400',
    icon: Lock,
  },
];

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/30 rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground">
        Legenda:
      </span>

      {LEGEND_ITEMS.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-4 h-4 rounded-sm flex items-center justify-center',
              item.color,
              item.textColor
            )}
          >
            {item.icon && <item.icon className="h-2.5 w-2.5" />}
          </div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
