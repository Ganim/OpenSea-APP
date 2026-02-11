/**
 * ProductVariantsItemsModal - Two-column modal for variants and items
 * Desktop: Side-by-side columns
 * Left: Product header, variants search, variants list, add variant button
 * Right: Selected variant info, items search, items list, add item button
 * Supports: hide exited items, double-click history, exit reason badges
 */

'use client';

import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { usePrintQueue } from '@/core/print-queue';
import { formatQuantity, formatUnitOfMeasure } from '@/helpers/formatters';
import { cn } from '@/lib/utils';
import {
  itemMovementsService,
  itemsService,
  variantsService,
} from '@/services/stock';
import type { ExitMovementType, Item, Product, Variant } from '@/types/stock';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Copy,
  Package,
  Palette,
  Plus,
  Printer,
  Search,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ItemRow } from '../components/item-row';
import { VariantRow } from '../components/variant-row';
import type { ExitType } from '../types/products.types';
import { EditVariantModal } from './edit-variant-modal';
import { ExitItemsModal } from './exit-items-modal';
import { ItemHistoryModal } from './item-history-modal';
import { QuickAddItemModal } from './quick-add-item-modal';
import { QuickAddVariantModal } from './quick-add-variant-modal';

interface ProductVariantsItemsModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoveItem?: (item: Item) => void;
}

export function ProductVariantsItemsModal({
  product,
  open,
  onOpenChange,
}: ProductVariantsItemsModalProps) {
  const { actions: printActions } = usePrintQueue();
  const queryClient = useQueryClient();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [variantsSearch, setVariantsSearch] = useState('');
  const [itemsSearch, setItemsSearch] = useState('');
  const [hideExitedItems, setHideExitedItems] = useState(true);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<Item | null>(null);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitItem, setExitItem] = useState<Item | null>(null);
  const [sessionExitReasonMap, setSessionExitReasonMap] = useState<
    Record<string, string>
  >({});

  // Track previous product to reset state when it changes
  const previousProductIdRef = useRef<string | null>(null);
  if (product?.id !== previousProductIdRef.current) {
    previousProductIdRef.current = product?.id ?? null;
    if (selectedVariant !== null) setSelectedVariant(null);
    if (variantsSearch !== '') setVariantsSearch('');
    if (itemsSearch !== '') setItemsSearch('');
  }

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: variantsData,
    isLoading: isLoadingVariants,
    error: variantsError,
  } = useQuery({
    queryKey: ['variants', 'by-product', product?.id],
    queryFn: async () => {
      if (!product?.id) return { variants: [] };
      return variantsService.listVariants(product.id);
    },
    enabled: !!product?.id && open,
  });

  const { data: variantStatsMap } = useQuery({
    queryKey: ['items', 'stats-by-variants', product?.id],
    queryFn: async () => {
      if (!variantsData?.variants?.length) return {};
      const stats: Record<string, { count: number; totalQty: number }> = {};
      for (const variant of variantsData.variants) {
        const itemsResponse = await itemsService.listItems(variant.id);
        const inStockItems = itemsResponse.items.filter(
          item => item.currentQuantity > 0
        );
        stats[variant.id] = {
          count: inStockItems.length,
          totalQty: inStockItems.reduce(
            (sum, item) => sum + item.currentQuantity,
            0
          ),
        };
      }
      return stats;
    },
    enabled: !!variantsData?.variants?.length && open,
  });

  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: ['items', 'by-variant', selectedVariant?.id],
    queryFn: async () => {
      if (!selectedVariant?.id) return { items: [] };
      return itemsService.listItems(selectedVariant.id);
    },
    enabled: !!selectedVariant?.id && open,
  });

  // ============================================================================
  // EXIT REASONS (for exited items badges)
  // ============================================================================

  const items = useMemo(() => itemsData?.items || [], [itemsData]);

  const exitedItemIds = useMemo(
    () =>
      items
        .filter((item: Item) => item.currentQuantity === 0)
        .map((item: Item) => item.id),
    [items]
  );

  const { data: fetchedExitReasons } = useQuery({
    queryKey: ['exit-reasons', selectedVariant?.id, exitedItemIds],
    queryFn: async () => {
      if (exitedItemIds.length === 0) return {};
      const results = await Promise.all(
        exitedItemIds.map(itemId =>
          itemMovementsService.listMovements({ itemId })
        )
      );
      const reasonMap: Record<string, string> = {};
      for (let i = 0; i < exitedItemIds.length; i++) {
        const movements = results[i].movements;
        const exitMovement = movements.find(
          m => m.reasonCode !== 'ENTRY' && m.movementType !== 'TRANSFER'
        );
        if (exitMovement) {
          reasonMap[exitedItemIds[i]] =
            exitMovement.reasonCode || exitMovement.movementType;
        }
      }
      return reasonMap;
    },
    enabled: exitedItemIds.length > 0 && open,
  });

  const exitReasonMap = useMemo(
    () => ({ ...(fetchedExitReasons || {}), ...sessionExitReasonMap }),
    [fetchedExitReasons, sessionExitReasonMap]
  );

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const variants = useMemo(() => variantsData?.variants || [], [variantsData]);

  const filteredVariants = useMemo(
    () =>
      variants.filter(variant => {
        const q = variantsSearch.toLowerCase();
        return (
          variant.name.toLowerCase().includes(q) ||
          (variant.sku?.toLowerCase().includes(q) ?? false) ||
          (variant.barcode?.toLowerCase().includes(q) ?? false)
        );
      }),
    [variants, variantsSearch]
  );

  const filteredItems = useMemo(() => {
    let result = items;
    if (hideExitedItems) {
      result = result.filter((item: Item) => item.currentQuantity > 0);
    }
    if (!itemsSearch.trim()) return result;
    const q = itemsSearch.toLowerCase();
    return result.filter(item => {
      const locationAddress =
        item.bin?.address ||
        item.resolvedAddress ||
        item.binId ||
        item.locationId ||
        '';
      const fullCode = item.fullCode || '';
      const uniqueCode = item.uniqueCode || '';
      const quantity = String(item.currentQuantity ?? '');
      return (
        fullCode.toLowerCase().includes(q) ||
        uniqueCode.toLowerCase().includes(q) ||
        locationAddress.toLowerCase().includes(q) ||
        quantity.includes(q)
      );
    });
  }, [items, itemsSearch, hideExitedItems]);

  const totalItemsQuantity = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.currentQuantity, 0),
    [filteredItems]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleVariantSelect = useCallback((variant: Variant) => {
    setSelectedVariant(variant);
    setItemsSearch('');
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setSelectedVariant(null);
    setVariantsSearch('');
    setItemsSearch('');
  }, [onOpenChange]);

  const handleItemDoubleClick = useCallback((item: Item) => {
    setHistoryItem(item);
    setHistoryModalOpen(true);
  }, []);

  const handlePrintItem = useCallback(
    (item: Item) => {
      printActions.addToQueue({
        item,
        variant: selectedVariant || undefined,
        product: product || undefined,
      });
      toast.success('Item adicionado à fila de impressão');
    },
    [printActions, selectedVariant, product]
  );

  const handlePrintAllItems = useCallback(() => {
    if (filteredItems.length === 0) {
      toast.warning('Nenhum item para imprimir');
      return;
    }
    printActions.addToQueue(
      filteredItems.map(item => ({
        item,
        variant: selectedVariant || undefined,
        product: product || undefined,
      }))
    );
    toast.success(
      `${filteredItems.length} item(s) adicionado(s) à fila de impressão`
    );
  }, [printActions, filteredItems, selectedVariant, product]);

  const handleItemExit = useCallback((item: Item) => {
    setExitItem(item);
    setExitModalOpen(true);
  }, []);

  const mapExitType = (exitType: ExitType): ExitMovementType => {
    const mapping: Record<ExitType, ExitMovementType> = {
      SALE: 'SALE',
      DAMAGE: 'LOSS',
      EXPIRATION: 'LOSS',
      LOSS: 'LOSS',
      INTERNAL_USE: 'PRODUCTION',
      SUPPLIER_RETURN: 'LOSS',
      TRANSFER: 'SAMPLE',
    };
    return mapping[exitType] || 'LOSS';
  };

  const handleExitConfirm = useCallback(
    async (exitType: ExitType, reason: string) => {
      if (!exitItem) return;
      try {
        await itemsService.registerExit({
          itemId: exitItem.id,
          quantity: exitItem.currentQuantity,
          movementType: mapExitType(exitType),
          reasonCode: exitType,
          notes: reason || undefined,
        });

        setSessionExitReasonMap(prev => ({
          ...prev,
          [exitItem.id]: exitType,
        }));

        toast.success('Saída registrada com sucesso!');
        setExitItem(null);

        await queryClient.invalidateQueries({
          queryKey: ['items', 'by-variant', selectedVariant?.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ['items', 'stats-by-variants', product?.id],
        });
        await queryClient.invalidateQueries({ queryKey: ['item-history'] });
      } catch (error) {
        logger.error(
          'Error processing exit',
          error instanceof Error ? error : undefined
        );
        toast.error('Erro ao processar saída');
        throw error;
      }
    },
    [exitItem, queryClient, selectedVariant, product]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!product) return null;

  const templateName = product.template?.name || 'Template';
  const unitOfMeasure = formatUnitOfMeasure(
    product.template?.unitOfMeasure || 'UNITS'
  );
  const manufacturerName = product.manufacturer?.name;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[1100px] h-[600px] overflow-hidden flex flex-col p-0">
          {/* Product Header */}
          <DialogHeader className="p-6 pb-2 shrink-0">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-center">
                  <DialogTitle className="text-xl">
                    {templateName} {product.name}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-7 w-7 opacity-50 hover:opacity-100"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(product.id);
                        toast.success('ID copiado!');
                      } catch {
                        toast.error('Erro ao copiar ID');
                      }
                    }}
                    title="Copiar ID do produto"
                    aria-label="Copiar ID do produto"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {manufacturerName || 'Fabricante não informado'}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Two-column layout */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 overflow-hidden">
            {/* LEFT COLUMN - Variants */}
            <div className="flex flex-col border-r border-border overflow-hidden">
              {/* Variants Header */}
              <div className="p-4 pb-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-muted/30 dark:to-muted/30">
                <div className="flex items-center justify-between mb-3 min-h-[28px]">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">Variantes</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {filteredVariants.length} de {variants.length}
                  </span>
                </div>

                {/* Variants Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar variantes..."
                    value={variantsSearch}
                    onChange={e => setVariantsSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              {/* Variants List */}
              <div className="flex-1 overflow-auto p-4 pt-2 space-y-2">
                {isLoadingVariants ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : variantsError ? (
                  <div className="p-8 text-center">
                    <p className="text-destructive text-sm">
                      Erro ao carregar variantes
                    </p>
                  </div>
                ) : filteredVariants.length === 0 ? (
                  <div className="p-8 text-center">
                    <Palette className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {variantsSearch
                        ? 'Nenhuma variante encontrada'
                        : 'Nenhuma variante cadastrada'}
                    </p>
                  </div>
                ) : (
                  filteredVariants.map(variant => (
                    <VariantRow
                      key={variant.id}
                      variant={variant}
                      itemsCount={variantStatsMap?.[variant.id]?.count || 0}
                      totalQuantity={
                        variantStatsMap?.[variant.id]?.totalQty || 0
                      }
                      unitLabel={unitOfMeasure}
                      isSelected={selectedVariant?.id === variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      onEdit={v => {
                        setEditingVariant(v);
                        setShowEditVariantModal(true);
                      }}
                    />
                  ))
                )}
              </div>

              {/* Add Variant Button */}
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => setShowAddVariantModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Variante
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN - Items */}
            <div className="flex flex-col overflow-hidden">
              {selectedVariant ? (
                <>
                  {/* Items Header */}
                  <div className="p-4 pb-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-muted/30 dark:to-muted/30">
                    <div className="flex items-center justify-between mb-3 min-h-[28px]">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-medium">{selectedVariant.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {filteredItems.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrintAllItems}
                            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Imprimir Todos
                          </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {filteredItems.length} itens •{' '}
                          {formatQuantity(totalItemsQuantity)} {unitOfMeasure}
                        </span>
                      </div>
                    </div>

                    {/* Hide exited items switch + Search */}
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Buscar itens..."
                          value={itemsSearch}
                          onChange={e => setItemsSearch(e.target.value)}
                          className="pl-9 h-9"
                        />
                      </div>
                      {items.some((i: Item) => i.currentQuantity === 0) && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Switch
                            id="hide-exited-modal"
                            checked={hideExitedItems}
                            onCheckedChange={setHideExitedItems}
                            className="scale-75"
                          />
                          <Label
                            htmlFor="hide-exited-modal"
                            className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap"
                          >
                            Ocultar saídas
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-auto p-4 pt-2 space-y-2">
                    {isLoadingItems ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : itemsError ? (
                      <div className="p-8 text-center">
                        <p className="text-destructive text-sm">
                          Erro ao carregar itens
                        </p>
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="p-8 text-center">
                        <Box className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {itemsSearch
                            ? 'Nenhum item encontrado'
                            : 'Nenhum item cadastrado'}
                        </p>
                      </div>
                    ) : (
                      filteredItems.map((item: Item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          unitLabel={unitOfMeasure}
                          onDoubleClick={() => handleItemDoubleClick(item)}
                          onPrint={handlePrintItem}
                          onExit={handleItemExit}
                          lastExitReasonCode={exitReasonMap[item.id]}
                        />
                      ))
                    )}
                  </div>

                  {/* Add Item Button */}
                  <div className="p-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full bg-purple-600 hover:bg-purple-500"
                      onClick={() => setShowAddItemModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Entrada
                    </Button>
                  </div>
                </>
              ) : (
                /* Empty state when no variant selected */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                      'bg-muted'
                    )}
                  >
                    <Box className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Selecione uma variante</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Clique em uma variante à esquerda para ver seus itens
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item History Modal */}
      <ItemHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        item={historyItem}
      />

      {/* Exit Items Modal */}
      <ExitItemsModal
        open={exitModalOpen}
        onOpenChange={open => {
          setExitModalOpen(open);
          if (!open) setExitItem(null);
        }}
        selectedItems={exitItem ? [exitItem] : []}
        onConfirm={handleExitConfirm}
      />

      {/* Edit Variant Modal */}
      <EditVariantModal
        product={product}
        variant={editingVariant}
        open={showEditVariantModal}
        onOpenChange={setShowEditVariantModal}
      />

      {/* Quick Add Variant Modal */}
      <QuickAddVariantModal
        product={product}
        open={showAddVariantModal}
        onOpenChange={setShowAddVariantModal}
      />

      {/* Quick Add Item Modal */}
      <QuickAddItemModal
        product={product}
        variant={selectedVariant}
        open={showAddItemModal}
        onOpenChange={setShowAddItemModal}
      />
    </>
  );
}
