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
import { Switch } from '@/components/ui/switch';
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
  reference: string;
  outOfLine: boolean;
  colorHex: string;
  price: string;
  attributes: Record<string, string>;
}

const INITIAL_FORM: FormData = {
  name: '',
  reference: '',
  outOfLine: false,
  colorHex: '',
  price: '',
  attributes: {},
};

export function QuickAddVariantModal({
  product,
  open,
  onOpenChange,
}: QuickAddVariantModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

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
        queryKey: ['items', 'stats-by-variants', product?.id],
      });
      toast.success('Variante criada com sucesso!');
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar variante: ${error.message}`);
    },
  });

  // Get all variant attributes from template
  const variantAttributes = useMemo(() => {
    if (!template?.variantAttributes) return [];

    const attrs = template.variantAttributes as Record<
      string,
      { required?: boolean; type?: string; label?: string }
    >;
    return Object.entries(attrs).map(([key, config]) => ({
      key,
      label: config?.label || key,
      type: config?.type || 'text',
      required: config?.required ?? false,
    }));
  }, [template]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!product?.id || !formData.name.trim()) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const price = formData.price
        ? parseFloat(formData.price.replace(',', '.'))
        : undefined;
      if (price !== undefined && (isNaN(price) || price < 0)) {
        toast.error('Preço inválido');
        return;
      }

      const createData: CreateVariantRequest = {
        productId: product.id,
        name: formData.name.trim(),
        reference: formData.reference.trim() || undefined,
        outOfLine: formData.outOfLine,
        colorHex: formData.colorHex || undefined,
        price: price ?? 0,
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
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="variant-name">
              Nome da Variante <span className="text-red-500">*</span>
            </Label>
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

          {/* Referência e Preço */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="variant-reference">Referência</Label>
              <Input
                id="variant-reference"
                placeholder="Opcional"
                value={formData.reference}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    reference: e.target.value,
                  }))
                }
                maxLength={128}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="variant-price">Preço de Venda (R$)</Label>
              <Input
                id="variant-price"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={formData.price}
                onChange={e =>
                  setFormData(prev => ({ ...prev, price: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Cor de Exibição */}
          <div className="space-y-1.5">
            <Label htmlFor="variant-color">Cor de Exibição</Label>
            <div className="flex items-center gap-3">
              <input
                id="variant-color"
                type="color"
                value={formData.colorHex || '#000000'}
                onChange={e =>
                  setFormData(prev => ({ ...prev, colorHex: e.target.value }))
                }
                className="h-9 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
              />
              <Input
                value={formData.colorHex}
                onChange={e =>
                  setFormData(prev => ({ ...prev, colorHex: e.target.value }))
                }
                placeholder="Nenhuma cor selecionada"
                maxLength={7}
                className="flex-1"
              />
              {formData.colorHex && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() =>
                    setFormData(prev => ({ ...prev, colorHex: '' }))
                  }
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Fora de Linha */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label
                htmlFor="variant-outOfLine"
                className="text-sm font-medium"
              >
                Fora de Linha
              </Label>
              <p className="text-xs text-muted-foreground">
                Variante não disponível para novos pedidos
              </p>
            </div>
            <Switch
              id="variant-outOfLine"
              checked={formData.outOfLine}
              onCheckedChange={checked =>
                setFormData(prev => ({ ...prev, outOfLine: checked }))
              }
            />
          </div>

          {/* Template Attributes */}
          {variantAttributes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Atributos do Template
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {variantAttributes.map(attr => (
                  <div key={attr.key} className="space-y-1.5">
                    <Label htmlFor={`attr-${attr.key}`} className="text-xs">
                      {attr.label}
                      {attr.required && (
                        <span className="text-red-500"> *</span>
                      )}
                    </Label>
                    <Input
                      id={`attr-${attr.key}`}
                      placeholder={attr.label}
                      value={formData.attributes[attr.key] || ''}
                      onChange={e =>
                        handleAttributeChange(attr.key, e.target.value)
                      }
                      required={attr.required}
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
