/**
 * OpenSea OS - Variant Detail Modal
 * Shows variant information with its items in a hierarchical view
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { itemsConfig } from '@/config/entities/items.config';
import { EntityCard, EntityGrid } from '@/core';
import { itemsService } from '@/services/stock';
import type { Item, Variant } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { Box, ChevronRight, Palette, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface VariantDetailModalProps {
  variant: Variant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VariantDetailModal({
  variant,
  open,
  onOpenChange,
}: VariantDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch items for this variant
  const {
    data: itemsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items', 'by-variant', variant?.id],
    queryFn: async () => {
      if (!variant?.id) return { items: [] };
      const response = await itemsService.listItems(variant.id);
      return response;
    },
    enabled: !!variant?.id && open,
  });

  const items = useMemo(() => itemsData?.items || [], [itemsData]);

  // Filter items by search query
  const filteredItems = useMemo(
    () =>
      items.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          (item.uniqueCode?.toLowerCase().includes(q) ?? false) ||
          (item.batchNumber?.toLowerCase().includes(q) ?? false)
        );
      }),
    [items, searchQuery]
  );

  const renderItemCard = (item: Item) => {
    const statusLabels = {
      AVAILABLE: 'Disponível',
      RESERVED: 'Reservado',
      SOLD: 'Vendido',
      DAMAGED: 'Danificado',
    };

    return (
      <EntityCard
        id={item.id}
        variant="grid"
        title={item.uniqueCode || `Item ${item.id}`}
        subtitle={item.batchNumber || 'Sem lote'}
        icon={Box}
        iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600"
        badges={[
          {
            label: statusLabels[item.status] || item.status,
            variant: item.status === 'AVAILABLE' ? 'default' : 'secondary',
          },
          {
            label: `${item.currentQuantity} un`,
            variant: 'outline',
          },
        ]}
        metadata={
          <div className="flex items-center gap-4 text-xs">
            {item.entryDate && (
              <span>
                Entrada: {new Date(item.entryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        }
        isSelected={false}
        showSelection={false}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  const renderItemListCard = (item: Item) => {
    const statusLabels = {
      AVAILABLE: 'Disponível',
      RESERVED: 'Reservado',
      SOLD: 'Vendido',
      DAMAGED: 'Danificado',
    };

    return (
      <EntityCard
        id={item.id}
        variant="list"
        title={item.uniqueCode || `Item ${item.id}`}
        subtitle={item.batchNumber || 'Sem lote'}
        icon={Box}
        iconBgColor="bg-gradient-to-br from-teal-500 to-cyan-600"
        badges={[
          {
            label: statusLabels[item.status] || item.status,
            variant: item.status === 'AVAILABLE' ? 'default' : 'secondary',
          },
        ]}
        metadata={
          <>
            <span className="text-xs">{item.currentQuantity} unidades</span>
          </>
        }
        isSelected={false}
        showSelection={false}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl">{variant.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                SKU: {variant.sku}
              </p>
              {variant.barcode && (
                <p className="text-sm text-muted-foreground mt-1">
                  Código de Barras: {variant.barcode}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="default">
                  R${' '}
                  {Number(variant.price).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Badge>
                {variant.costPrice && (
                  <Badge variant="outline">
                    Custo: R${' '}
                    {Number(variant.costPrice).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="w-4 h-4" />
            <span>{variant.name}</span>
            <ChevronRight className="w-4 h-4" />
            <Box className="w-4 h-4" />
            <span className="font-medium text-foreground">
              Itens ({filteredItems.length})
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar itens..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-destructive">Erro ao carregar itens</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <Box className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Nenhum item encontrado'
                    : 'Nenhum item cadastrado para esta variante'}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Registre uma entrada de estoque para começar
                  </p>
                )}
              </div>
            ) : (
              <EntityGrid
                config={itemsConfig}
                items={filteredItems}
                renderGridItem={renderItemCard}
                renderListItem={renderItemListCard}
                isLoading={isLoading}
                isSearching={!!searchQuery}
                onItemClick={() => {}}
                onItemDoubleClick={() => {}}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <p>
                {filteredItems.length === 1
                  ? '1 item'
                  : `${filteredItems.length} itens`}
                {searchQuery && items.length !== filteredItems.length && (
                  <span className="ml-1">(filtrado de {items.length})</span>
                )}
              </p>
              {filteredItems.length > 0 && (
                <p className="mt-1">
                  Total:{' '}
                  {filteredItems.reduce(
                    (sum, item) => sum + item.currentQuantity,
                    0
                  )}{' '}
                  unidades
                </p>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
