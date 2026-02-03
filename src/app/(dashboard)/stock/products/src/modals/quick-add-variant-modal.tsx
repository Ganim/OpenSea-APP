/**
 * QuickAddVariantModal - Overlay modal for quickly adding a variant
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
import { Label } from '@/components/ui/label';
import { variantsService } from '@/services/stock';
import { useTemplate } from '@/hooks/stock/use-stock-other';
import type { Product, CreateVariantRequest } from '@/types/stock';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface QuickAddVariantModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  price: string;
  sku: string;
  barcode: string;
  attributes: Record<string, string>;
}

export function QuickAddVariantModal({
  product,
  open,
  onOpenChange,
}: QuickAddVariantModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    sku: '',
    barcode: '',
    attributes: {},
  });

  // Fetch template for required variant attributes
  const { data: template } = useTemplate(product?.templateId || '');

  // Create variant mutation
  const createVariantMutation = useMutation({
    mutationFn: (data: CreateVariantRequest) =>
      variantsService.createVariant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['variants', 'by-product', product?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({
        queryKey: ['items', 'count-by-variants', product?.id],
      });
      toast.success('Variante criada com sucesso!');
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar variante: ${error.message}`);
    },
  });

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
      sku: '',
      barcode: '',
      attributes: {},
    });
  }, []);

  const handleSubmit = useCallback(
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
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
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

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Variante</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adicionar variante para {product.name}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="variant-name">Nome da Variante *</Label>
            <Input
              id="variant-name"
              placeholder="Ex: Azul P, 100ml, etc."
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="variant-price">Preço (R$) *</Label>
              <Input
                id="variant-price"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={formData.price}
                onChange={e =>
                  setFormData(prev => ({ ...prev, price: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="variant-sku">SKU</Label>
              <Input
                id="variant-sku"
                placeholder="Opcional"
                value={formData.sku}
                onChange={e =>
                  setFormData(prev => ({ ...prev, sku: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="variant-barcode">Código de Barras</Label>
            <Input
              id="variant-barcode"
              placeholder="Opcional"
              value={formData.barcode}
              onChange={e =>
                setFormData(prev => ({ ...prev, barcode: e.target.value }))
              }
            />
          </div>

          {/* Required Template Attributes */}
          {requiredVariantAttributes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Atributos do Template
              </Label>
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
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
