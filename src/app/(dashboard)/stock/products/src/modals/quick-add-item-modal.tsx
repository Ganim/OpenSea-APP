/**
 * QuickAddItemModal - Overlay modal for quickly adding an item entry
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
import { sanitizeQuantityInput } from '@/helpers/formatters';
import { itemsService } from '@/services/stock';
import { useTemplate } from '@/hooks/stock/use-stock-other';
import { BinSelector } from '../components/bin-selector';
import type { Product, Variant, RegisterItemEntryRequest } from '@/types/stock';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface QuickAddItemModalProps {
  product: Product | null;
  variant: Variant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  binId: string;
  quantity: string;
  unitCost: string;
  attributes: Record<string, string>;
}

export function QuickAddItemModal({
  product,
  variant,
  open,
  onOpenChange,
}: QuickAddItemModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    binId: '',
    quantity: '1',
    unitCost: '',
    attributes: {},
  });

  // Fetch template for required item attributes
  const { data: template } = useTemplate(product?.templateId || '');

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
      queryClient.invalidateQueries({
        queryKey: ['items', 'stats-by-variants', product?.id],
      });
      toast.success('Item adicionado com sucesso!');
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar item: ${error.message}`);
    },
  });

  // Get ALL item attributes from template (required + optional)
  const itemAttributes = useMemo(() => {
    if (!template?.itemAttributes) return [];

    const attrs = template.itemAttributes as Record<
      string,
      { required?: boolean; type?: string; label?: string }
    >;
    return Object.entries(attrs).map(([key, config]) => ({
      key,
      label: config?.label || key,
      type: config?.type || 'text',
      required: config?.required || false,
    }));
  }, [template]);

  const resetForm = useCallback(() => {
    setFormData({
      binId: '',
      quantity: '1',
      unitCost: '',
      attributes: {},
    });
  }, []);

  // Generate unique code
  const generateUniqueCode = useCallback(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ITEM-${timestamp}-${random}`;
  }, []);

  const handleSubmit = useCallback(
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

      // Arredondar para 3 casas decimais
      const roundedQuantity = Math.round(quantity * 1000) / 1000;

      const uniqueCode = generateUniqueCode();

      // Parse optional unit cost
      const parsedCost = formData.unitCost
        ? parseFloat(formData.unitCost.replace(',', '.'))
        : undefined;

      const createData: RegisterItemEntryRequest = {
        variantId: variant.id,
        binId: formData.binId,
        quantity: roundedQuantity,
        uniqueCode,
        attributes: formData.attributes,
        ...(parsedCost && !isNaN(parsedCost) && parsedCost > 0
          ? { unitCost: parsedCost }
          : {}),
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
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  if (!product || !variant) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Entrada</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adicionar item para {variant.name}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Localização (Bin) *</Label>
            <BinSelector
              value={formData.binId}
              onChange={binId => setFormData(prev => ({ ...prev, binId }))}
              placeholder="Buscar localização..."
              className="h-9 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-quantity">Quantidade *</Label>
              <Input
                id="item-quantity"
                type="text"
                inputMode="decimal"
                placeholder="1,000"
                value={formData.quantity}
                onChange={e => {
                  const sanitized = sanitizeQuantityInput(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    quantity: sanitized,
                  }));
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                Máximo 3 casas decimais
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-unit-cost">Preço de Custo</Label>
              <Input
                id="item-unit-cost"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={formData.unitCost}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    unitCost: e.target.value,
                  }));
                }}
              />
              <p className="text-xs text-muted-foreground">Opcional (R$)</p>
            </div>
          </div>

          {/* Template Item Attributes (required + optional) */}
          {itemAttributes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Atributos do Template
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {itemAttributes.map(attr => (
                  <div key={attr.key} className="space-y-1.5">
                    <Label htmlFor={`attr-${attr.key}`} className="text-xs">
                      {attr.label}
                      {attr.required ? ' *' : ''}
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
