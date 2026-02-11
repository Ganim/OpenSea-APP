/**
 * ItemsViewModal - Modal for viewing variant items
 * Features:
 * - Header with product and variant info
 * - Items search
 * - Items list with ID, location, quantity, and "move item" button
 * - Quick-add item form at the bottom
 */

'use client';

import { useAllBins } from '@/app/(dashboard)/stock/locations/src/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useTemplate } from '@/hooks/stock/use-stock-other';
import { formatCurrency } from '@/lib/utils';
import { itemsService } from '@/services/stock';
import type {
  Item,
  Product,
  RegisterItemEntryRequest,
  Variant,
} from '@/types/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Box,
  ChevronRight,
  Loader2,
  Package,
  Palette,
  Plus,
  Search,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BinSelector } from '../components/bin-selector';
import { ItemListItem } from '../components/item-list-item';

interface ItemsViewModalProps {
  product: Product | null;
  variant: Variant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onMoveItem?: (item: Item) => void;
}

interface QuickAddFormData {
  binId: string;
  quantity: string;
  attributes: Record<string, string>;
}

export function ItemsViewModal({
  product,
  variant,
  open,
  onOpenChange,
  onBack,
  onMoveItem,
}: ItemsViewModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [formData, setFormData] = useState<QuickAddFormData>({
    binId: '',
    quantity: '1',
    attributes: {},
  });

  // Fetch template for required item attributes
  const { data: template } = useTemplate(product?.templateId || '');

  // Fetch available bins for the dropdown (for mapping locationId to address)
  const { data: availableBins } = useAllBins({
    enabled: open,
  });

  // Fetch items for this variant
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: ['items', 'by-variant', variant?.id],
    queryFn: async () => {
      if (!variant?.id) return { items: [] };
      return itemsService.listItems(variant.id);
    },
    enabled: !!variant?.id && open,
  });

  // Create item entry mutation
  const createItemMutation = useMutation({
    mutationFn: (data: RegisterItemEntryRequest) =>
      itemsService.registerEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['items', 'by-variant', variant?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['bins'] });
      toast.success('Item adicionado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar item: ${error.message}`);
    },
  });

  const items = useMemo(() => itemsData?.items || [], [itemsData]);

  // Create bins map for display (binId -> address)
  const binsMap = useMemo(() => {
    const map: Record<string, string> = {};
    (availableBins || []).forEach(bin => {
      map[bin.id] = bin.address;
    });
    return map;
  }, [availableBins]);

  // Filter items by search query
  const filteredItems = useMemo(
    () =>
      items.filter(item => {
        const q = searchQuery.toLowerCase();
        const binAddress = item.binId ? binsMap[item.binId] || '' : '';
        const fullCode = item.fullCode || '';
        const uniqueCode = item.uniqueCode || '';
        const quantity = String(item.currentQuantity ?? '');
        return (
          fullCode.toLowerCase().includes(q) ||
          uniqueCode.toLowerCase().includes(q) ||
          binAddress.toLowerCase().includes(q) ||
          quantity.includes(q)
        );
      }),
    [items, searchQuery, binsMap]
  );

  // Calculate totals
  const totalQuantity = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.currentQuantity, 0),
    [filteredItems]
  );

  // Get required item attributes from template
  const requiredItemAttributes = useMemo(() => {
    if (!template?.itemAttributes) return [];

    const attrs = template.itemAttributes as Record<
      string,
      { required?: boolean; type?: string; label?: string }
    >;
    return Object.entries(attrs)
      .filter(([, config]) => config?.required)
      .map(([key, config]) => ({
        key,
        label: config?.label || key,
        type: config?.type || 'text',
      }));
  }, [template]);

  const resetForm = useCallback(() => {
    setFormData({
      binId: '',
      quantity: '1',
      attributes: {},
    });
    setIsFormExpanded(false);
  }, []);

  // Generate unique code
  const generateUniqueCode = useCallback(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ITEM-${timestamp}-${random}`;
  }, []);

  const handleSubmitQuickAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!variant?.id || !formData.binId || !formData.quantity) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const quantity = parseFloat(formData.quantity.replace(',', '.'));
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Quantidade inválida');
        return;
      }

      const uniqueCode = generateUniqueCode();

      const createData: RegisterItemEntryRequest = {
        variantId: variant.id,
        binId: formData.binId,
        quantity,
        uniqueCode,
        attributes: formData.attributes,
      };

      createItemMutation.mutate(createData);
    },
    [variant, formData, createItemMutation, generateUniqueCode]
  );

  const handleAttributeChange = useCallback((key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setSearchQuery('');
    resetForm();
  }, [onOpenChange, resetForm]);

  if (!product || !variant) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Product and Variant Info */}
        <DialogHeader className="pb-4">
          {/* Back Button */}
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-2"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para variantes
            </Button>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Package className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{product.name}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Palette className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{variant.name}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Box className="w-4 h-4" />
            <span className="font-medium text-foreground">Itens</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{variant.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {variant.sku && <span>SKU: {variant.sku}</span>}
                {variant.sku && <span>•</span>}
                <span className="font-mono text-xs">
                  {variant.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="default">{formatCurrency(variant.price)}</Badge>
                {variant.barcode && (
                  <Badge variant="outline">{variant.barcode}</Badge>
                )}
                {variant.costPrice && (
                  <Badge variant="secondary">
                    Custo: {formatCurrency(variant.costPrice)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Search */}
        <div className="py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar itens por código ou localização..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-auto min-h-0 space-y-2">
          {isLoadingItems ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : itemsError ? (
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
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsFormExpanded(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar primeiro item
                </Button>
              )}
            </div>
          ) : (
            filteredItems.map(item => (
              <ItemListItem
                key={item.id}
                item={item}
                locationName={item.binId ? binsMap[item.binId] : undefined}
                onMoveItem={onMoveItem}
              />
            ))
          )}
        </div>

        {/* Footer with count and totals */}
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground border-t">
          <span>
            {filteredItems.length === 1
              ? '1 item'
              : `${filteredItems.length} itens`}
            {searchQuery && items.length !== filteredItems.length && (
              <span className="ml-1">(filtrado de {items.length})</span>
            )}
          </span>
          <span className="font-medium">
            Total: {totalQuantity}{' '}
            {totalQuantity === 1 ? 'unidade' : 'unidades'}
          </span>
        </div>

        <Separator />

        {/* Quick Add Form */}
        <div className="pt-2">
          {!isFormExpanded ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsFormExpanded(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item Rápido
            </Button>
          ) : (
            <form onSubmit={handleSubmitQuickAdd} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Novo Item</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Localização (Bin) *</Label>
                <BinSelector
                  value={formData.binId}
                  onChange={binId => setFormData(prev => ({ ...prev, binId }))}
                  placeholder="Buscar localização..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="item-quantity" className="text-xs">
                  Quantidade *
                </Label>
                <Input
                  id="item-quantity"
                  type="text"
                  inputMode="decimal"
                  placeholder="1,00"
                  value={formData.quantity}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Required Template Attributes */}
              {requiredItemAttributes.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {requiredItemAttributes.map(attr => (
                    <div key={attr.key} className="space-y-1.5">
                      <Label htmlFor={`attr-${attr.key}`} className="text-xs">
                        {attr.label} *
                      </Label>
                      <Input
                        id={`attr-${attr.key}`}
                        placeholder={attr.label}
                        value={formData.attributes[attr.key] || ''}
                        onChange={e =>
                          handleAttributeChange(attr.key, e.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={createItemMutation.isPending || !formData.binId}
              >
                {createItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Entrada
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
