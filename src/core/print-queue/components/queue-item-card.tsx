/**
 * Queue Item Card
 * Card individual para um item na fila de impressão
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { GripVertical, Minus, Package, Plus, Trash2 } from 'lucide-react';
import type { PrintQueueItem } from '../types';

interface QueueItemCardProps {
  item: PrintQueueItem;
  onUpdateCopies: (copies: number) => void;
  onRemove: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

export function QueueItemCard({
  item,
  onUpdateCopies,
  onRemove,
  dragHandleProps,
  isDragging = false,
}: QueueItemCardProps) {
  const productName = item.product?.name || item.item.productName || 'Produto';
  const variantName = item.variant?.name || item.item.variantName || '';
  const itemCode = item.item.uniqueCode || item.item.fullCode || item.item.id;
  const location = item.item.resolvedAddress || '';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-white/5',
        'border-gray-200 dark:border-white/10',
        'transition-shadow duration-200',
        isDragging && 'shadow-lg ring-2 ring-blue-500/50'
      )}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-white/60"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Item Icon */}
      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
        <Package className="w-6 h-6 text-white" />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
          {productName}
        </h4>
        {variantName && (
          <p className="text-xs text-gray-600 dark:text-white/60 truncate">
            {variantName}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-white/40">
          <span className="font-mono">{itemCode}</span>
          {location && (
            <>
              <span>•</span>
              <span>{location}</span>
            </>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdateCopies(item.copies - 1)}
          disabled={item.copies <= 1}
        >
          <Minus className="w-4 h-4" />
        </Button>

        <Input
          type="number"
          min={1}
          max={999}
          value={item.copies}
          onChange={e => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 1) {
              onUpdateCopies(value);
            }
          }}
          className="w-16 h-8 text-center text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdateCopies(item.copies + 1)}
          disabled={item.copies >= 999}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
