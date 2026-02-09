'use client';

/**
 * QuickAddModal Component
 * Rapid product creation with optional variant and stock in one flow
 * Target: 3 clicks from open to complete product
 */

import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronsUpDown,
  ChevronDown,
  Package,
  Palette,
  Box,
  Loader2,
  Sparkles,
  Keyboard,
} from 'lucide-react';

import { useTemplates } from '@/hooks/stock/use-stock-other';
import { useLocations } from '@/hooks/stock/use-stock-other';
import {
  productsService,
  variantsService,
  itemsService,
} from '@/services/stock';
import type { QuickAddModalProps, QuickAddResult } from './types';
import type { Template, Product, Variant } from '@/types/stock';

// ============================================
// VALIDATION SCHEMA
// ============================================

const quickAddSchema = z
  .object({
    // Template (required)
    templateId: z.string().min(1, 'Selecione um template'),

    // Product (required)
    productName: z.string().min(1, 'Nome do produto é obrigatório'),
    productDescription: z.string().optional(),

    // Variant (optional)
    createVariant: z.boolean().default(false),
    variantName: z.string().optional(),
    variantPrice: z.coerce.number().optional(),
    variantSku: z.string().optional(),

    // Stock (optional)
    addInitialStock: z.boolean().default(false),
    stockQuantity: z.coerce.number().optional(),
    stockLocationId: z.string().optional(),
  })
  .refine(
    data => {
      if (data.createVariant && !data.variantName) {
        return false;
      }
      return true;
    },
    {
      message: 'Nome da variante é obrigatório',
      path: ['variantName'],
    }
  )
  .refine(
    data => {
      if (
        data.createVariant &&
        (!data.variantPrice || data.variantPrice <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Preço deve ser maior que zero',
      path: ['variantPrice'],
    }
  )
  .refine(
    data => {
      if (
        data.addInitialStock &&
        (!data.stockQuantity || data.stockQuantity <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Quantidade deve ser maior que zero',
      path: ['stockQuantity'],
    }
  )
  .refine(
    data => {
      if (data.addInitialStock && !data.stockLocationId) {
        return false;
      }
      return true;
    },
    {
      message: 'Selecione uma localização',
      path: ['stockLocationId'],
    }
  );

type QuickAddFormValues = z.infer<typeof quickAddSchema>;

// ============================================
// COMPONENT
// ============================================

export function QuickAddModal({
  open,
  onOpenChange,
  defaultTemplateId,
  defaultProductId,
  onSuccess,
}: QuickAddModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [variantExpanded, setVariantExpanded] = useState(false);
  const [stockExpanded, setStockExpanded] = useState(false);

  // Data hooks
  const { data: templates = [], isLoading: loadingTemplates } = useTemplates();
  const { data: locationsData, isLoading: loadingLocations } = useLocations();

  const locations = locationsData?.locations || [];

  // Form setup
  const form = useForm<QuickAddFormValues>({
    resolver: zodResolver(quickAddSchema) as any,
    defaultValues: {
      templateId: defaultTemplateId || '',
      productName: '',
      productDescription: '',
      createVariant: false,
      variantName: '',
      variantPrice: '' as unknown as number,
      variantSku: '',
      addInitialStock: false,
      stockQuantity: '' as unknown as number,
      stockLocationId: '',
    },
  });

  const watchCreateVariant = form.watch('createVariant');
  const watchAddStock = form.watch('addInitialStock');
  const watchTemplateId = form.watch('templateId');

  // Get selected template for preview
  const selectedTemplate = templates.find(t => t.id === watchTemplateId);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        templateId: defaultTemplateId || '',
        productName: '',
        productDescription: '',
        createVariant: false,
        variantName: '',
        variantPrice: '' as unknown as number,
        variantSku: '',
        addInitialStock: false,
        stockQuantity: '' as unknown as number,
        stockLocationId: '',
      });
      setVariantExpanded(false);
      setStockExpanded(false);
    }
  }, [open, defaultTemplateId, form]);

  // Auto-expand sections when checkboxes are checked
  useEffect(() => {
    if (watchCreateVariant) {
      setVariantExpanded(true);
    }
  }, [watchCreateVariant]);

  useEffect(() => {
    if (watchAddStock) {
      setStockExpanded(true);
    }
  }, [watchAddStock]);

  // Submit handler
  const onSubmit = useCallback(
    async (values: QuickAddFormValues) => {
      setIsSubmitting(true);

      try {
        // Step 1: Create Product
        const productResponse = await productsService.createProduct({
          name: values.productName,
          description: values.productDescription,
          templateId: values.templateId,
        });
        const product = productResponse.product;

        let variant: Variant | undefined;
        const items: any[] = [];

        // Step 2: Create Variant (if requested)
        if (values.createVariant && values.variantName && values.variantPrice) {
          const variantResponse = await variantsService.createVariant({
            productId: product.id,
            name: values.variantName,
            price: values.variantPrice,
            sku: values.variantSku || undefined,
          });
          variant = variantResponse.variant;

          // Step 3: Add Initial Stock (if requested)
          if (
            values.addInitialStock &&
            values.stockQuantity &&
            values.stockLocationId &&
            variant
          ) {
            const entryResponse = await itemsService.registerEntry({
              variantId: variant.id,
              binId: values.stockLocationId,
              quantity: values.stockQuantity,
              uniqueCode: `ITM-${Date.now()}`, // Auto-generate
            });
            items.push(entryResponse.item);
          }
        }

        // Success!
        const result: QuickAddResult = { product, variant, items };

        toast.success('Produto criado com sucesso!', {
          description: variant
            ? `${product.name} com variante ${variant.name}`
            : product.name,
          action: !variant
            ? {
                label: 'Adicionar Variante',
                onClick: () => {
                  // Could trigger variant creation modal
                },
              }
            : undefined,
        });

        onSuccess?.(result);
        onOpenChange(false);
      } catch (error) {
        logger.error(
          'Error creating product',
          error instanceof Error ? error : undefined
        );
        toast.error('Erro ao criar produto', {
          description: 'Verifique os dados e tente novamente.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSuccess, onOpenChange]
  );

  // Calculate summary
  const getSummary = () => {
    const parts: string[] = ['1 produto'];
    if (watchCreateVariant) {
      parts.push('1 variante');
    }
    if (watchAddStock && form.getValues('stockQuantity')) {
      parts.push(`${form.getValues('stockQuantity')} unidades em estoque`);
    }
    return `Criar ${parts.join(' + ')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Add
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                {/* Section 1: Template */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      1
                    </Badge>
                    <span className="text-sm font-medium">Template</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <Popover
                          open={templateOpen}
                          onOpenChange={setTemplateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={templateOpen}
                                className="w-full justify-between"
                                disabled={loadingTemplates}
                              >
                                {loadingTemplates ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Carregando...
                                  </span>
                                ) : field.value ? (
                                  templates.find(t => t.id === field.value)
                                    ?.name || 'Selecione...'
                                ) : (
                                  'Selecione um template...'
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar template..." />
                              <CommandList>
                                <CommandEmpty>
                                  Nenhum template encontrado.
                                </CommandEmpty>
                                <CommandGroup>
                                  {templates.map(template => (
                                    <CommandItem
                                      key={template.id}
                                      value={template.name}
                                      onSelect={() => {
                                        form.setValue(
                                          'templateId',
                                          template.id
                                        );
                                        setTemplateOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === template.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {template.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recent templates as quick buttons */}
                  {templates.length > 0 && !watchTemplateId && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">
                        Recentes:
                      </span>
                      {templates.slice(0, 3).map(template => (
                        <Button
                          key={template.id}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() =>
                            form.setValue('templateId', template.id)
                          }
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Section 2: Product */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      2
                    </Badge>
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Produto</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Nike Air Max 90"
                            {...field}
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Descrição opcional..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Section 3: Variant (Collapsible) */}
                <Collapsible
                  open={variantExpanded}
                  onOpenChange={setVariantExpanded}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          3
                        </Badge>
                        <Palette className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">
                          Variante Inicial
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Opcional
                        </Badge>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              variantExpanded && 'rotate-180'
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <FormField
                      control={form.control}
                      name="createVariant"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Criar variante junto com o produto
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <CollapsibleContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="variantName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Vermelho 42"
                                  {...field}
                                  disabled={!watchCreateVariant}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="variantPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  {...field}
                                  disabled={!watchCreateVariant}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="variantSku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Auto-gerado se vazio"
                                {...field}
                                disabled={!watchCreateVariant}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Deixe vazio para gerar automaticamente
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                <Separator />

                {/* Section 4: Initial Stock (Collapsible) */}
                <Collapsible
                  open={stockExpanded}
                  onOpenChange={setStockExpanded}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          4
                        </Badge>
                        <Box className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          Estoque Inicial
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Opcional
                        </Badge>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              stockExpanded && 'rotate-180'
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <FormField
                      control={form.control}
                      name="addInitialStock"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!watchCreateVariant}
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              'text-sm font-normal cursor-pointer',
                              !watchCreateVariant && 'text-muted-foreground'
                            )}
                          >
                            Adicionar ao estoque
                          </FormLabel>
                          {!watchCreateVariant && (
                            <span className="text-xs text-muted-foreground">
                              (requer variante)
                            </span>
                          )}
                        </FormItem>
                      )}
                    />

                    <CollapsibleContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="stockQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="10"
                                  {...field}
                                  disabled={!watchAddStock}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stockLocationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Localização *</FormLabel>
                              <Popover
                                open={locationOpen}
                                onOpenChange={setLocationOpen}
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className="w-full justify-between"
                                      disabled={
                                        !watchAddStock || loadingLocations
                                      }
                                    >
                                      {field.value
                                        ? locations.find(
                                            l => l.id === field.value
                                          )?.code || 'Selecione...'
                                        : 'Selecione...'}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-full p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput placeholder="Buscar localização..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        Nenhuma localização encontrada.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {locations.map(location => (
                                          <CommandItem
                                            key={location.id}
                                            value={location.code}
                                            onSelect={() => {
                                              form.setValue(
                                                'stockLocationId',
                                                location.id
                                              );
                                              setLocationOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                'mr-2 h-4 w-4',
                                                field.value === location.id
                                                  ? 'opacity-100'
                                                  : 'opacity-0'
                                              )}
                                            />
                                            {location.code}
                                            {location.titulo && (
                                              <span className="text-muted-foreground ml-2">
                                                - {location.titulo}
                                              </span>
                                            )}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t pt-4 mt-4 space-y-3">
              {/* Summary */}
              <div className="text-sm text-muted-foreground text-center">
                {getSummary()}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>Criar Produto</>
                  )}
                </Button>
              </div>

              {/* Keyboard hint */}
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Keyboard className="w-3 h-3" />
                <span>Ctrl+Enter para criar</span>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
