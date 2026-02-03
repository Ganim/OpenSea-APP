/**
 * VariantListItem - Component for displaying a variant in a list
 * Shows variant name, quantity, price, and action button
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Variant } from '@/types/stock';
import { Box, ChevronRight, Palette } from 'lucide-react';

interface VariantListItemProps {
  variant: Variant;
  totalQuantity?: number;
  onViewItems?: (variant: Variant) => void;
}

export function VariantListItem({
  variant,
  totalQuantity = 0,
  onViewItems,
}: VariantListItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors group">
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
        <Palette className="w-5 h-5 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{variant.name}</h4>
          {variant.sku && (
            <span className="text-xs text-muted-foreground">
              SKU: {variant.sku}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="outline" className="text-xs">
            {totalQuantity} {totalQuantity === 1 ? 'unidade' : 'unidades'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatCurrency(variant.price)}
          </Badge>
          {variant.barcode && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {variant.barcode}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onViewItems?.(variant)}
      >
        <Box className="w-4 h-4 mr-2" />
        Ver Itens
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
