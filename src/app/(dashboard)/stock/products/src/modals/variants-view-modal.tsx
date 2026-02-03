/**
 * VariantsViewModal - Modal for viewing product variants
 * Features:
 * - Product header with name, manufacturer, ID, category, badges
 * - Variants search
 * - Variants list with name, quantity, price, and "view items" button
 * - Quick-add variant form at the bottom
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUnitOfMeasure } from '@/helpers/formatters';
import { useTemplate } from '@/hooks/stock/use-stock-other';
import { itemsService, variantsService } from '@/services/stock';
import type { CreateVariantRequest, Product, Variant } from '@/types/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, Palette, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { VariantListItem } from '../components/variant-list-item';

interface VariantsViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVariantClick?: (variant: Variant) => void;
}

interface QuickAddFormData {
  name: string;
  price: string;
  attributes: Record<string, string>;
}

export function VariantsViewModal({
  product,
  open,
  onOpenChange,
  onVariantClick,
}: VariantsViewModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [formData, setFormData] = useState<QuickAddFormData>({
    name: '',
    price: '',
    attributes: {},
  });

  // Fetch template for required variant attributes
  const { data: template } = useTemplate(product?.templateId || '');

  // Fetch variants for this product
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

  // Fetch items count for each variant (for quantity display)
  const { data: itemsCountMap } = useQuery({
    queryKey: ['items', 'count-by-variants', product?.id],
    queryFn: async () => {
      if (!variantsData?.variants?.length) return {};

      const counts: Record<string, number> = {};
      for (const variant of variantsData.variants) {
        const itemsResponse = await itemsService.listItems(variant.id);
        counts[variant.id] = itemsResponse.items.reduce(
          (sum, item) => sum + item.currentQuantity,
          0
        );
      }
      return counts;
    },
    enabled: !!variantsData?.variants?.length && open,
  });

  // Create variant mutation
  const createVariantMutation = useMutation({
    mutationFn: (data: CreateVariantRequest) =>
      variantsService.createVariant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['variants', 'by-product', product?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Variante criada com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar variante: ${error.message}`);
    },
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

  // Get required variant attributes from template
  const requiredVariantAttributes = useMemo(() => {
    if (!template?.variantAttributes) return [];

    const attrs = template.variantAttributes as Record<
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
      name: '',
      price: '',
      attributes: {},
    });
    setIsFormExpanded(false);
  }, []);

  const handleSubmitQuickAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!product?.id || !formData.name || !formData.price) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const price = parseFloat(formData.price.replace(',', '.'));
      if (isNaN(price) || price < 0) {
        toast.error('Preço inválido');
        return;
      }

      const createData: CreateVariantRequest = {
        productId: product.id,
        name: formData.name,
        price,
        attributes: formData.attributes,
      };

      createVariantMutation.mutate(createData);
    },
    [product, formData, createVariantMutation]
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

  if (!product) return null;

  const templateName = product.template?.name || 'Template';
  const unitOfMeasure = formatUnitOfMeasure(
    product.template?.unitOfMeasure || 'UNITS'
  );
  const manufacturerName = product.manufacturer?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Product Info */}
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {manufacturerName && <span>{manufacturerName}</span>}
                {manufacturerName && <span>•</span>}
                <span className="font-mono text-xs">
                  {product.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="default">{templateName}</Badge>
                <Badge variant="outline">{unitOfMeasure}</Badge>
                {product.status !== 'ACTIVE' && (
                  <Badge variant="secondary">
                    {product.status === 'INACTIVE' ? 'Inativo' : 'Arquivado'}
                  </Badge>
                )}
                {product.productCategories?.map(cat => (
                  <Badge key={cat.id} variant="outline" className="text-xs">
                    {cat.name}
                  </Badge>
                ))}
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
              placeholder="Buscar variantes por nome, SKU ou código de barras..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Variants List */}
        <div className="flex-1 overflow-auto min-h-0 space-y-2">
          {isLoadingVariants ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : variantsError ? (
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
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsFormExpanded(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira variante
                </Button>
              )}
            </div>
          ) : (
            filteredVariants.map(variant => (
              <VariantListItem
                key={variant.id}
                variant={variant}
                totalQuantity={itemsCountMap?.[variant.id] || 0}
                onViewItems={onVariantClick}
              />
            ))
          )}
        </div>

        {/* Footer with count */}
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground border-t">
          <span>
            {filteredVariants.length === 1
              ? '1 variante'
              : `${filteredVariants.length} variantes`}
            {searchQuery && variants.length !== filteredVariants.length && (
              <span className="ml-1">(filtrado de {variants.length})</span>
            )}
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
              Adicionar Variante Rápida
            </Button>
          ) : (
            <form onSubmit={handleSubmitQuickAdd} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Nova Variante</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="variant-name" className="text-xs">
                    Nome da Variante *
                  </Label>
                  <Input
                    id="variant-name"
                    placeholder="Ex: Azul P, 100ml, etc."
                    value={formData.name}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="variant-price" className="text-xs">
                    Preço (R$) *
                  </Label>
                  <Input
                    id="variant-price"
                    placeholder="0,00"
                    value={formData.price}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, price: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Required Template Attributes */}
              {requiredVariantAttributes.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {requiredVariantAttributes.map(attr => (
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
                disabled={createVariantMutation.isPending}
              >
                {createVariantMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Variante
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
