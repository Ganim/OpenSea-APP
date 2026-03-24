'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Package,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  MoneyInput,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { itemsService } from '@/services/stock/items.service';

// ============================================
// TYPES
// ============================================

interface AddItemToBinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binId: string;
}

interface VariantOption {
  id: string;
  name: string;
  reference: string | null;
  colorHex: string | null;
  secondaryColorHex: string | null;
  pattern: string | null;
  productName: string;
  templateName: string | null;
  fullLabel: string;
}

// ============================================
// HELPERS
// ============================================

function getPatternStyle(
  colorHex: string | null,
  secondaryColorHex: string | null,
  pattern: string | null
): React.CSSProperties {
  const primary = colorHex || '#cbd5e1';
  const secondary = secondaryColorHex || '';
  const hasSecondary = !!secondary;
  const sec = secondary || '#94a3b8';

  switch (pattern) {
    case 'SOLID':
      if (hasSecondary)
        return { background: `linear-gradient(135deg, ${primary} 50%, ${sec} 50%)` };
      return { background: primary };
    case 'STRIPED':
      return { background: `repeating-linear-gradient(45deg, ${primary}, ${primary} 4px, ${sec} 4px, ${sec} 8px)` };
    case 'PLAID':
      return { background: `repeating-linear-gradient(0deg, ${sec}00 0px, ${sec}00 6px, ${sec}BB 6px, ${sec}BB 8px, ${sec}00 8px, ${sec}00 14px), repeating-linear-gradient(90deg, ${sec}00 0px, ${sec}00 6px, ${sec}BB 6px, ${sec}BB 8px, ${sec}00 8px, ${sec}00 14px), ${primary}` };
    case 'PRINTED':
      return { background: `radial-gradient(circle 2px at 25% 30%, ${sec} 99%, transparent), radial-gradient(circle 1.5px at 60% 20%, ${sec} 99%, transparent), radial-gradient(circle 2px at 80% 60%, ${sec} 99%, transparent), radial-gradient(circle 1.5px at 40% 75%, ${sec} 99%, transparent), ${primary}` };
    case 'GRADIENT':
      return { background: `linear-gradient(135deg, ${primary}, ${sec})` };
    case 'JACQUARD':
      return { background: `repeating-conic-gradient(${primary} 0% 25%, ${sec} 0% 50%) 0 0 / 8px 8px` };
    default:
      return { background: primary };
  }
}

function hasColorInfo(
  colorHex: string | null | undefined,
  pattern: string | null | undefined
): boolean {
  return !!(colorHex || pattern);
}

function sanitizeQuantity(value: string): string {
  return value.replace(/[^0-9.,]/g, '').replace(',', '.');
}

interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function fetchAllPages<T>(
  endpoint: string,
  dataKey: string
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  const limit = 100;
  while (true) {
    const response = await apiClient.get<Record<string, unknown>>(
      `${endpoint}?page=${page}&limit=${limit}`
    );
    const items = response[dataKey] as T[] | undefined;
    if (items && items.length > 0) allItems.push(...items);
    const meta = response.meta as PaginatedMeta | undefined;
    if (!meta || page >= meta.pages) break;
    page++;
  }
  return allItems;
}

// ============================================
// COMPONENT
// ============================================

export function AddItemToBinModal({
  open,
  onOpenChange,
  binId,
}: AddItemToBinModalProps) {
  const queryClient = useQueryClient();

  const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(null);
  const [variantPopoverOpen, setVariantPopoverOpen] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState(0);

  // Fetch all variants + products in parallel to build full labels
  const { data: variantOptions, isLoading: loadingVariants } = useQuery({
    queryKey: ['bin-entry', 'variants-with-details'],
    queryFn: async (): Promise<VariantOption[]> => {
      const [variants, products] = await Promise.all([
        fetchAllPages<{
          id: string;
          name: string;
          reference?: string;
          productId: string;
          colorHex?: string;
          secondaryColorHex?: string;
          pattern?: string;
        }>('/v1/variants', 'variants'),
        fetchAllPages<{
          id: string;
          name: string;
          templateId?: string;
          template?: { id: string; name: string };
        }>('/v1/products', 'products'),
      ]);

      const productMap = new Map(products.map(p => [p.id, p]));

      return variants.map(v => {
        const product = productMap.get(v.productId);
        const templateName = product?.template?.name ?? null;
        const productName = product?.name ?? '';
        const fullLabel = [templateName, productName, v.name]
          .filter(Boolean)
          .join(' · ');

        return {
          id: v.id,
          name: v.name,
          reference: v.reference || null,
          colorHex: v.colorHex || null,
          secondaryColorHex: v.secondaryColorHex || null,
          pattern: v.pattern || null,
          productName,
          templateName,
          fullLabel,
        };
      });
    },
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  // Mutation
  const createItemMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariant) throw new Error('Selecione uma variante');

      const parsedQty = parseFloat(sanitizeQuantity(quantity));
      if (isNaN(parsedQty) || parsedQty <= 0) {
        throw new Error('Quantidade inválida');
      }

      return itemsService.registerEntry({
        variantId: selectedVariant.id,
        binId,
        quantity: parsedQty,
        movementType: 'PURCHASE',
        unitCost: unitCost > 0 ? unitCost : undefined,
      });
    },
    onSuccess: () => {
      toast.success('Item adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['bin-detail'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['bins'] });
      queryClient.invalidateQueries({ queryKey: ['zone-items'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao adicionar item');
    },
  });

  const handleClose = useCallback(() => {
    setSelectedVariant(null);
    setQuantity('1');
    setUnitCost(0);
    setVariantPopoverOpen(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const canSubmit =
    !!selectedVariant && parseFloat(sanitizeQuantity(quantity)) > 0;

  return (
    <Dialog open={open} onOpenChange={val => !val && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            Adicionar Item ao Nicho
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Variant Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Variante <span className="text-rose-500">*</span>
            </Label>
            <Popover
              open={variantPopoverOpen}
              onOpenChange={setVariantPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={variantPopoverOpen}
                  className="w-full justify-between h-auto min-h-[44px] px-3 py-2"
                >
                  {selectedVariant ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      {hasColorInfo(selectedVariant.colorHex, selectedVariant.pattern) ? (
                        <div
                          className="h-7 w-10 rounded-md shrink-0 border border-black/10"
                          style={getPatternStyle(
                            selectedVariant.colorHex,
                            selectedVariant.secondaryColorHex,
                            selectedVariant.pattern
                          )}
                        />
                      ) : (
                        <div className="h-7 w-10 rounded-md shrink-0 bg-muted flex items-center justify-center">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-medium truncate">
                          {selectedVariant.fullLabel}
                        </p>
                        {selectedVariant.reference && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            Ref: {selectedVariant.reference}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Buscar variante...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Buscar por nome, produto ou referência..."
                    className="h-10"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {loadingVariants ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Carregando...</span>
                        </div>
                      ) : (
                        'Nenhuma variante encontrada.'
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="max-h-[280px]">
                        {(variantOptions ?? []).map(option => (
                          <CommandItem
                            key={option.id}
                            value={`${option.fullLabel} ${option.reference || ''}`}
                            onSelect={() => {
                              setSelectedVariant(option);
                              setVariantPopoverOpen(false);
                            }}
                            className="cursor-pointer py-2.5 px-2"
                          >
                            <div className="flex items-center gap-2.5 w-full min-w-0">
                              {hasColorInfo(option.colorHex, option.pattern) ? (
                                <div
                                  className="h-7 w-10 rounded-md shrink-0 border border-black/10"
                                  style={getPatternStyle(
                                    option.colorHex,
                                    option.secondaryColorHex,
                                    option.pattern
                                  )}
                                />
                              ) : (
                                <div className="h-7 w-10 rounded-md shrink-0 bg-muted flex items-center justify-center">
                                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {option.fullLabel}
                                </p>
                                {option.reference && (
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    Ref: {option.reference}
                                  </p>
                                )}
                              </div>
                              {selectedVariant?.id === option.id && (
                                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Quantidade <span className="text-rose-500">*</span>
            </Label>
            <InputGroup>
              <Input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={e => setQuantity(sanitizeQuantity(e.target.value))}
                placeholder="1"
                className="h-11"
              />
              <InputGroupAddon>
                <InputGroupText>un</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Unit Cost (optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Custo Unitário{' '}
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <MoneyInput
              value={unitCost}
              onChange={setUnitCost}
              className="h-11"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => createItemMutation.mutate()}
            disabled={!canSubmit || createItemMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {createItemMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Adicionar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
