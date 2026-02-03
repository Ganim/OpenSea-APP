'use client';

/**
 * BatchVariantCreator Component
 * Create multiple variants at once by selecting attribute combinations
 * Example: Colors (Red, Blue, Black) x Sizes (40, 41, 42) = 9 variants
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Loader2, Layers, Eye, Check, X } from 'lucide-react';

import { variantsService } from '@/services/stock';
import type {
  BatchVariantCreatorProps,
  AttributeGroup,
  AttributeOption,
  BatchVariantPreview,
} from './types';
import type { Variant } from '@/types/stock';

// ============================================
// CONSTANTS
// ============================================

// Default attribute groups (can be customized per template)
const DEFAULT_ATTRIBUTE_GROUPS: AttributeGroup[] = [
  {
    key: 'color',
    label: 'Cor',
    options: [
      { value: 'red', label: 'Vermelho', selected: false },
      { value: 'blue', label: 'Azul', selected: false },
      { value: 'black', label: 'Preto', selected: false },
      { value: 'white', label: 'Branco', selected: false },
      { value: 'green', label: 'Verde', selected: false },
      { value: 'yellow', label: 'Amarelo', selected: false },
    ],
  },
  {
    key: 'size',
    label: 'Tamanho',
    options: [
      { value: '36', label: '36', selected: false },
      { value: '37', label: '37', selected: false },
      { value: '38', label: '38', selected: false },
      { value: '39', label: '39', selected: false },
      { value: '40', label: '40', selected: false },
      { value: '41', label: '41', selected: false },
      { value: '42', label: '42', selected: false },
      { value: '43', label: '43', selected: false },
      { value: '44', label: '44', selected: false },
    ],
  },
];

// ============================================
// VALIDATION SCHEMA
// ============================================

const batchVariantSchema = z.object({
  basePrice: z.coerce.number().min(0.01, 'Preço base é obrigatório'),
  skuPrefix: z.string().optional(),
  autoNumberSku: z.boolean(),
});

type BatchVariantFormValues = {
  basePrice: number;
  skuPrefix?: string;
  autoNumberSku: boolean;
};

// ============================================
// ATTRIBUTE SELECTOR
// ============================================

interface AttributeSelectorProps {
  group: AttributeGroup;
  onToggle: (value: string) => void;
}

function AttributeSelector({ group, onToggle }: AttributeSelectorProps) {
  const selectedCount = group.options.filter(o => o.selected).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{group.label}</span>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {group.options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md border transition-colors',
              option.selected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border'
            )}
          >
            {option.selected && <Check className="w-3 h-3 inline mr-1" />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PREVIEW GRID
// ============================================

interface PreviewGridProps {
  variants: BatchVariantPreview[];
  maxDisplay?: number;
}

function PreviewGrid({ variants, maxDisplay = 9 }: PreviewGridProps) {
  const displayVariants = variants.slice(0, maxDisplay);
  const remainingCount = variants.length - maxDisplay;

  if (variants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Selecione atributos para ver o preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview ({variants.length} variantes)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {displayVariants.map((variant, index) => (
          <Card key={index} className="p-2">
            <div className="text-sm font-medium truncate">{variant.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {variant.sku}
            </div>
            <div className="text-xs text-green-600">
              R$ {variant.price.toFixed(2)}
            </div>
          </Card>
        ))}
      </div>

      {remainingCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          ... e mais {remainingCount} variante{remainingCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function BatchVariantCreator({
  productId,
  productName,
  template,
  open,
  onOpenChange,
  onCreated,
}: BatchVariantCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>(
    DEFAULT_ATTRIBUTE_GROUPS.map(g => ({
      ...g,
      options: g.options.map(o => ({ ...o, selected: false })),
    }))
  );

  // Form setup
  const form = useForm<BatchVariantFormValues>({
    resolver: zodResolver(batchVariantSchema) as any,
    defaultValues: {
      basePrice: '' as unknown as number,
      skuPrefix: '',
      autoNumberSku: true,
    },
  });

  const basePrice = form.watch('basePrice');
  const skuPrefix = form.watch('skuPrefix');
  const autoNumberSku = form.watch('autoNumberSku');

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      form.reset();
      setAttributeGroups(
        DEFAULT_ATTRIBUTE_GROUPS.map(g => ({
          ...g,
          options: g.options.map(o => ({ ...o, selected: false })),
        }))
      );
    }
  }, [open, form]);

  // Toggle attribute selection
  const handleToggleAttribute = useCallback(
    (groupKey: string, value: string) => {
      setAttributeGroups(prev =>
        prev.map(group =>
          group.key === groupKey
            ? {
                ...group,
                options: group.options.map(opt =>
                  opt.value === value
                    ? { ...opt, selected: !opt.selected }
                    : opt
                ),
              }
            : group
        )
      );
    },
    []
  );

  // Generate variant previews
  const variantPreviews = useMemo(() => {
    const selectedByGroup = attributeGroups
      .map(group => ({
        key: group.key,
        label: group.label,
        selected: group.options.filter(o => o.selected),
      }))
      .filter(g => g.selected.length > 0);

    if (selectedByGroup.length === 0) {
      return [];
    }

    // Generate cartesian product of all selected options
    const combinations: Record<string, string>[][] = [[]];

    for (const group of selectedByGroup) {
      const newCombinations: Record<string, string>[][] = [];
      for (const combo of combinations) {
        for (const option of group.selected) {
          newCombinations.push([...combo, { [group.key]: option.label }]);
        }
      }
      combinations.length = 0;
      combinations.push(...newCombinations);
    }

    // Convert to preview format
    return combinations.map((combo, index) => {
      const attrs = combo.reduce((acc, item) => ({ ...acc, ...item }), {});
      const attrValues = Object.values(attrs);
      const name = attrValues.join(' ');
      const skuSuffix = autoNumberSku
        ? String(index + 1).padStart(3, '0')
        : attrValues.map(v => v.slice(0, 2).toUpperCase()).join('-');

      return {
        name,
        sku: skuPrefix ? `${skuPrefix}-${skuSuffix}` : `SKU-${skuSuffix}`,
        attributes: attrs,
        price: basePrice || 0,
      } as BatchVariantPreview;
    });
  }, [attributeGroups, basePrice, skuPrefix, autoNumberSku]);

  // Submit handler
  const onSubmit = useCallback(
    async (values: BatchVariantFormValues) => {
      if (variantPreviews.length === 0) {
        toast.error('Selecione pelo menos um atributo');
        return;
      }

      setIsSubmitting(true);

      try {
        const variantsToCreate = variantPreviews.map(preview => ({
          productId,
          name: preview.name,
          price: preview.price,
          sku: preview.sku,
          attributes: preview.attributes,
        }));

        const response = await variantsService.createBatch(variantsToCreate);

        toast.success(`${response.variants.length} variantes criadas!`, {
          description: `Adicionadas ao produto ${productName}`,
        });

        onCreated(response.variants);
        onOpenChange(false);
      } catch (error) {
        console.error('Error creating variants:', error);
        toast.error('Erro ao criar variantes', {
          description: 'Verifique os dados e tente novamente.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [productId, productName, variantPreviews, onCreated, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Criar Variantes em Lote
          </DialogTitle>
          <DialogDescription>
            Produto: <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                {/* Attribute Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Selecione os Atributos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {attributeGroups.map(group => (
                      <AttributeSelector
                        key={group.key}
                        group={group}
                        onToggle={value =>
                          handleToggleAttribute(group.key, value)
                        }
                      />
                    ))}
                  </CardContent>
                </Card>

                <Separator />

                {/* Configuration */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Configurações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Base *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Será aplicado a todas as variantes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skuPrefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefixo do SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: NIKE-AM90" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoNumberSku"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Auto-numerar SKUs (001, 002, 003...)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Separator />

                {/* Preview */}
                <PreviewGrid variants={variantPreviews} />
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || variantPreviews.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Criar {variantPreviews.length} Variante
                      {variantPreviews.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
