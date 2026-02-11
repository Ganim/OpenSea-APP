'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ItemExtended, ItemStatus } from '@/types/stock';
import { Box, Calendar, Hash, MapPin, MapPinOff, Package } from 'lucide-react';

const STATUS_CONFIG: Record<ItemStatus, { label: string; className: string }> =
  {
    AVAILABLE: {
      label: 'Disponível',
      className: 'bg-green-500/20 text-green-700 dark:text-green-400',
    },
    RESERVED: {
      label: 'Reservado',
      className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    },
    IN_TRANSIT: {
      label: 'Em Trânsito',
      className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    },
    DAMAGED: {
      label: 'Danificado',
      className: 'bg-red-500/20 text-red-700 dark:text-red-400',
    },
    EXPIRED: {
      label: 'Expirado',
      className: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
    },
    DISPOSED: {
      label: 'Descartado',
      className: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
    },
  };

function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

interface ItemCardProps {
  item: ItemExtended;
  isSelected?: boolean;
}

export function ItemGridCard({ item, isSelected = false }: ItemCardProps) {
  const statusConfig = STATUS_CONFIG[item.status];
  const isLowQuantity = item.currentQuantity <= 5;
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
  const isExpiringSoon =
    item.expiryDate &&
    new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card
      className={cn(
        'p-4 transition-all duration-200 cursor-pointer',
        'hover:shadow-lg border-gray-200/50 dark:border-white/10',
        isSelected
          ? 'bg-primary/10 border-primary ring-2 ring-primary ring-offset-2'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-white',
            isSelected
              ? 'bg-primary'
              : 'bg-gradient-to-br from-teal-500 to-cyan-600'
          )}
        >
          <Box className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Vencido
            </Badge>
          )}
          {!isExpired && isExpiringSoon && (
            <Badge variant="outline" className="text-xs text-orange-600">
              Vence em breve
            </Badge>
          )}
        </div>
      </div>

      {/* Code */}
      <h3 className="font-mono font-semibold text-sm mb-2 truncate">
        {item.uniqueCode}
      </h3>

      {/* Quantity */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-muted-foreground">Quantidade:</span>
        <span
          className={cn(
            'font-bold text-lg',
            isLowQuantity && 'text-orange-600 dark:text-orange-400'
          )}
        >
          {item.currentQuantity}
        </span>
        {item.initialQuantity !== item.currentQuantity && (
          <span className="text-xs text-muted-foreground">
            / {item.initialQuantity}
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="space-y-1 text-xs text-muted-foreground">
        {item.batchNumber && (
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span>Lote: {item.batchNumber}</span>
          </div>
        )}

        {item.bin ? (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{item.bin.address}</span>
          </div>
        ) : item.lastKnownAddress ? (
          <div className="flex items-center gap-1 text-amber-500">
            <MapPinOff className="w-3 h-3" />
            <span className="truncate">
              {item.lastKnownAddress} (desassociado)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground/50">
            <MapPinOff className="w-3 h-3" />
            <span>Sem localização</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Entrada: {formatDate(item.entryDate)}</span>
        </div>

        {item.expiryDate && (
          <div
            className={cn(
              'flex items-center gap-1',
              isExpired && 'text-red-500',
              isExpiringSoon && !isExpired && 'text-orange-500'
            )}
          >
            <Calendar className="w-3 h-3" />
            <span>Validade: {formatDate(item.expiryDate)}</span>
          </div>
        )}
      </div>

      {/* Variant Info */}
      {item.variant && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {item.variant.name}
            </span>
          </div>
          {item.variant.sku && (
            <div className="text-xs font-mono text-muted-foreground mt-1">
              SKU: {item.variant.sku}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function ItemListCard({ item, isSelected = false }: ItemCardProps) {
  const statusConfig = STATUS_CONFIG[item.status];
  const isLowQuantity = item.currentQuantity <= 5;
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

  return (
    <Card
      className={cn(
        'p-4 transition-all duration-200 cursor-pointer',
        'border-gray-200/50 dark:border-white/10',
        isSelected
          ? 'bg-primary/10 border-primary ring-2 ring-primary ring-offset-2'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0',
            isSelected
              ? 'bg-primary'
              : 'bg-gradient-to-br from-teal-500 to-cyan-600'
          )}
        >
          <Box className="w-5 h-5" />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-mono font-semibold text-sm truncate">
              {item.uniqueCode}
            </h3>
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Vencido
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {item.variant && (
              <span className="truncate max-w-[200px]">
                {item.variant.name}
              </span>
            )}
            {item.batchNumber && <span>Lote: {item.batchNumber}</span>}
            {item.bin ? (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.bin.address}
              </span>
            ) : item.lastKnownAddress ? (
              <span className="flex items-center gap-1 text-amber-500">
                <MapPinOff className="w-3 h-3" />
                {item.lastKnownAddress}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground/50">
                <MapPinOff className="w-3 h-3" />
                Sem local
              </span>
            )}
            <span>Entrada: {formatDate(item.entryDate)}</span>
            {item.expiryDate && (
              <span className={cn(isExpired && 'text-red-500')}>
                Validade: {formatDate(item.expiryDate)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="text-right shrink-0">
          <div
            className={cn(
              'font-bold text-lg',
              isLowQuantity && 'text-orange-600 dark:text-orange-400'
            )}
          >
            {item.currentQuantity}
          </div>
          <div className="text-xs text-muted-foreground">un</div>
        </div>
      </div>
    </Card>
  );
}
