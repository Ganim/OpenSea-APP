/**
 * OpenSea OS - Product Detail Modal
 * Shows product information with its variants in a hierarchical view
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { variantsConfig } from '@/config/entities/variants.config';
import { EntityCard, EntityGrid } from '@/core';
import { variantsService } from '@/services/stock';
import type { Product, Variant } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { Package, Palette, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVariantClick?: (variant: Variant) => void;
  variantsOnly?: boolean;
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onVariantClick,
  variantsOnly = false,
}: ProductDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch variants for this product
  const {
    data: variantsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['variants', 'by-product', product?.id],
    queryFn: async () => {
      if (!product?.id) return { variants: [] };
      const response = await variantsService.listVariants(product.id);
      return response;
    },
    enabled: !!product?.id && open,
  });

  const variants = useMemo(() => variantsData?.variants || [], [variantsData]);

  // Filter variants by search query
  const filteredVariants = useMemo(
    () =>
      variants.filter(variant => {
        const q = searchQuery.toLowerCase();
        return (
          variant.name.toLowerCase().includes(q) ||
          (variant.sku?.toLowerCase().includes(q) ?? false) ||
          (variant.barcode?.toLowerCase().includes(q) ?? false)
        );
      }),
    [variants, searchQuery]
  );

  const renderVariantCard = (variant: Variant) => {
    return (
      <EntityCard
        id={variant.id}
        variant="grid"
        title={variant.name}
        subtitle={variant.sku}
        icon={Palette}
        iconBgColor="bg-gradient-to-br from-violet-500 to-purple-600"
        badges={[
          {
            label: `R$ ${Number(variant.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            variant: 'default',
          },
        ]}
        metadata={
          <div className="flex items-center gap-4 text-xs">
            {variant.barcode && <span>Código: {variant.barcode}</span>}
          </div>
        }
        isSelected={false}
        showSelection={false}
        onClick={() => onVariantClick?.(variant)}
        createdAt={variant.createdAt}
        updatedAt={variant.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  const renderVariantListCard = (variant: Variant) => {
    return (
      <EntityCard
        id={variant.id}
        variant="list"
        title={variant.name}
        subtitle={variant.sku}
        icon={Palette}
        iconBgColor="bg-gradient-to-br from-violet-500 to-purple-600"
        badges={[
          {
            label: `R$ ${Number(variant.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            variant: 'default',
          },
        ]}
        metadata={
          <>
            {variant.barcode && (
              <span className="text-xs">Código: {variant.barcode}</span>
            )}
          </>
        }
        isSelected={false}
        showSelection={false}
        onClick={() => onVariantClick?.(variant)}
        createdAt={variant.createdAt}
        updatedAt={variant.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  if (!product) return null;

  const statusLabels = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    ARCHIVED: 'Arquivado',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {product.fullCode}
              </p>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar variantes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Variants List */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-destructive">Erro ao carregar variantes</p>
              </div>
            ) : filteredVariants.length === 0 ? (
              <div className="p-12 text-center">
                <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Nenhuma variante encontrada'
                    : 'Nenhuma variante cadastrada para este produto'}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie a primeira variante para começar
                  </p>
                )}
              </div>
            ) : (
              <EntityGrid
                config={variantsConfig}
                items={filteredVariants}
                renderGridItem={renderVariantCard}
                renderListItem={renderVariantListCard}
                isLoading={isLoading}
                isSearching={!!searchQuery}
                onItemClick={(variant: Variant) => onVariantClick?.(variant)}
                onItemDoubleClick={(variant: Variant) =>
                  onVariantClick?.(variant)
                }
                defaultView={'list'}
                showViewToggle={false}
                showItemCount={false}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {filteredVariants.length === 1
                ? '1 variante'
                : `${filteredVariants.length} variantes`}
              {searchQuery && variants.length !== filteredVariants.length && (
                <span className="ml-1">(filtrado de {variants.length})</span>
              )}
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
