/**
 * ItemListItem - Component for displaying an item in a list
 * Shows item ID, location, quantity, and action button
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Item, ItemExtended } from '@/types/stock';
import { ArrowRightLeft, Box, MapPin } from 'lucide-react';

interface ItemListItemProps {
  item: Item | ItemExtended;
  locationName?: string;
  onMoveItem?: (item: Item | ItemExtended) => void;
}

const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Disponível',
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  RESERVED: {
    label: 'Reservado',
    variant: 'secondary' as const,
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  SOLD: {
    label: 'Vendido',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  DAMAGED: {
    label: 'Danificado',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

export function ItemListItem({
  item,
  locationName,
  onMoveItem,
}: ItemListItemProps) {
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.AVAILABLE;
  const extendedItem = item as ItemExtended;
  const displayLocation =
    locationName ||
    extendedItem.location?.code ||
    extendedItem.location?.name ||
    'Sem localização';

  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors group">
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
        <Box className="w-5 h-5 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm font-mono">{item.uniqueCode}</h4>
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{displayLocation}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {item.currentQuantity}{' '}
            {item.currentQuantity === 1 ? 'unidade' : 'unidades'}
          </Badge>
          {item.batchNumber && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Lote: {item.batchNumber}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onMoveItem?.(item)}
      >
        <ArrowRightLeft className="w-4 h-4 mr-2" />
        Movimentar
      </Button>
    </div>
  );
}
