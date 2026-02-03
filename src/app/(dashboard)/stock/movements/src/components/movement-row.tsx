'use client';

import { cn } from '@/lib/utils';
import type { ItemMovement } from '@/types/stock';
import { MOVEMENT_CONFIG } from '../constants';
import { formatDateTime } from '../utils';

interface MovementRowProps {
  movement: ItemMovement;
}

export function MovementRow({ movement }: MovementRowProps) {
  const config = MOVEMENT_CONFIG[movement.movementType];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border',
        config.bgClass
      )}
    >
      <div
        className={cn(
          'p-2 rounded-lg bg-white/50 dark:bg-black/20',
          config.className
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{config.label}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {movement.itemId.slice(0, 8)}...
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {movement.batchNumber && `Lote: ${movement.batchNumber} \u2022 `}
          {formatDateTime(movement.createdAt)}
        </div>
        {movement.notes && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {movement.notes}
          </p>
        )}
      </div>

      <div className="text-right">
        <div
          className={cn(
            'font-bold',
            movement.movementType === 'EXIT' ? 'text-red-600' : 'text-green-600'
          )}
        >
          {movement.movementType === 'EXIT' ? '-' : '+'}
          {movement.quantity}
        </div>
        {movement.quantityBefore !== null &&
          movement.quantityAfter !== null && (
            <div className="text-xs text-muted-foreground">
              {movement.quantityBefore} &rarr; {movement.quantityAfter}
            </div>
          )}
      </div>
    </div>
  );
}
