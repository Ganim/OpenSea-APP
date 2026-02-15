'use client';

/**
 * DetailPanel Component
 * Shows product details with variants grid and quick actions
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Edit, Layers, Loader2, Package, Palette, Plus } from 'lucide-react';
import { useState } from 'react';

import type { Variant } from '@/types/stock';
import {
  AddVariantButton,
  InlineVariantCreator,
} from './inline-variant-creator';
import { QuickStockButton } from './quick-stock-entry';
import type { DetailPanelProps, VariantCardProps } from './types';

// ============================================
// VARIANT CARD
// ============================================

function VariantCard({
  variant,
  isSelected,
  onClick,
  onQuickStock,
  stockCount,
}: VariantCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{variant.name}</div>
            {variant.sku && (
              <div className="text-xs text-muted-foreground truncate">
                {variant.sku}
              </div>
            )}
          </div>

          {/* Quick stock button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={e => e.stopPropagation()}>
                  <QuickStockButton
                    variantId={variant.id}
                    variantName={variant.name}
                    onSuccess={onQuickStock}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>Adicionar estoque</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-green-600">
            R${' '}
            {Number(variant.price).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </span>
          {stockCount !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {stockCount} un
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ onCreateProduct }: { onCreateProduct: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">Selecione um Produto</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Escolha um produto na árvore ao lado para ver os detalhes
      </p>
      <Button variant="outline" onClick={onCreateProduct}>
        <Plus className="w-4 h-4 mr-2" />
        Criar Novo Produto
      </Button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DetailPanel({
  product,
  variants = [],
  template,
  isLoading,
  onCreateVariant,
  onBatchCreate,
  onEditProduct,
  onVariantClick,
  onQuickStock,
}: DetailPanelProps) {
  const [showInlineCreator, setShowInlineCreator] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (!product) {
    return <EmptyState onCreateProduct={onCreateVariant} />;
  }

  const handleVariantCreated = (variant: Variant) => {
    setShowInlineCreator(false);
    // Parent should refetch variants
  };

  return (
    <div className="h-full flex flex-col">
      {/* Product Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {product.fullCode && (
                  <Badge variant="outline" className="text-xs">
                    {product.fullCode}
                  </Badge>
                )}
                <Badge
                  variant={
                    product.status === 'ACTIVE' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {product.status === 'ACTIVE' ? 'Ativo' : product.status}
                </Badge>
                {template && (
                  <Badge variant="secondary" className="text-xs">
                    {template.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onEditProduct}>
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground mt-3">
            {product.description}
          </p>
        )}
      </div>

      {/* Variants Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <span className="font-medium">Variantes</span>
            <Badge variant="secondary" className="text-xs">
              {variants.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onBatchCreate}>
                    <Layers className="w-4 h-4 mr-1" />
                    Lote
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Criar variantes em lote</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button size="sm" onClick={() => setShowInlineCreator(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Inline Creator */}
            {showInlineCreator && (
              <div className="mb-4">
                <InlineVariantCreator
                  productId={product.id}
                  productName={product.name}
                  template={template}
                  onCreated={handleVariantCreated}
                  onCancel={() => setShowInlineCreator(false)}
                />
              </div>
            )}

            {/* Variants Grid */}
            {variants.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {variants.map(variant => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    isSelected={selectedVariantId === variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      onVariantClick(variant);
                    }}
                    onQuickStock={() => onQuickStock(variant.id)}
                  />
                ))}

                {/* Add variant card */}
                {!showInlineCreator && (
                  <AddVariantButton
                    onClick={() => setShowInlineCreator(true)}
                    className="min-h-[100px]"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Palette className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhuma variante cadastrada
                </p>
                {!showInlineCreator && (
                  <Button
                    variant="outline"
                    onClick={() => setShowInlineCreator(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Criar Primeira Variante
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Stats Footer */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center justify-around text-center">
          <div>
            <div className="text-lg font-semibold">{variants.length}</div>
            <div className="text-xs text-muted-foreground">Variantes</div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <div className="text-lg font-semibold">
              {/* TODO: Get actual stock count */}
              --
            </div>
            <div className="text-xs text-muted-foreground">Em Estoque</div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <div className="text-lg font-semibold text-green-600">
              R${' '}
              {variants.length > 0
                ? Math.min(
                    ...variants.map(v => Number(v.price))
                  ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                : '0,00'}
            </div>
            <div className="text-xs text-muted-foreground">Menor Preço</div>
          </div>
        </div>
      </div>
    </div>
  );
}
