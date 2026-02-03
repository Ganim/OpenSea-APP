'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronsUpDown,
  MapPin,
  Package,
  AlertCircle,
} from 'lucide-react';
import type { WizardVariant, WizardStockEntry } from '../hooks/use-wizard';

interface Location {
  id: string;
  code: string;
  name: string;
  warehouseName?: string;
  type: string;
}

interface StepStockProps {
  variants: WizardVariant[];
  stockEntries: WizardStockEntry[];
  onUpdateStockEntry: (
    variantId: string,
    entry: Partial<WizardStockEntry>
  ) => void;
  errors?: Record<string, string>;
}

// Mock locations - in real app, fetch from API
const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    code: 'A-01-01',
    name: 'Prateleira A1',
    warehouseName: 'Armazém Principal',
    type: 'SHELF',
  },
  {
    id: '2',
    code: 'A-01-02',
    name: 'Prateleira A2',
    warehouseName: 'Armazém Principal',
    type: 'SHELF',
  },
  {
    id: '3',
    code: 'B-01-01',
    name: 'Prateleira B1',
    warehouseName: 'Armazém Principal',
    type: 'SHELF',
  },
  {
    id: '4',
    code: 'EST-01',
    name: 'Estante 1',
    warehouseName: 'Loja',
    type: 'RACK',
  },
  {
    id: '5',
    code: 'EST-02',
    name: 'Estante 2',
    warehouseName: 'Loja',
    type: 'RACK',
  },
];

export function StepStock({
  variants,
  stockEntries,
  onUpdateStockEntry,
  errors,
}: StepStockProps) {
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);

  // Get stock entry for a variant
  const getStockEntry = (variantId: string): WizardStockEntry | undefined => {
    return stockEntries.find(e => e.variantId === variantId);
  };

  // Calculate totals
  const totalQuantity = stockEntries.reduce(
    (sum, e) => sum + (e.quantity || 0),
    0
  );
  const totalValue = stockEntries.reduce((sum, e) => {
    const variant = variants.find(v => v.id === e.variantId);
    return (
      sum + (e.quantity || 0) * (variant?.costPrice || variant?.price || 0)
    );
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Estoque Inicial</h2>
        <p className="text-sm text-muted-foreground">
          Defina a quantidade e localização inicial para cada variante.
        </p>
      </div>

      {errors?.stock && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {errors.stock}
        </div>
      )}

      {/* Variants Stock List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4 pr-4">
          {variants.map(variant => {
            const entry = getStockEntry(variant.id);
            const variantError = errors?.[`stock_${variant.id}`];

            return (
              <StockEntryCard
                key={variant.id}
                variant={variant}
                entry={entry}
                locations={locations}
                onUpdate={data => onUpdateStockEntry(variant.id, data)}
                error={variantError}
              />
            );
          })}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Total de variantes:
          </span>
          <span className="font-medium">{variants.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Quantidade total:
          </span>
          <span className="font-medium">
            {totalQuantity.toLocaleString('pt-BR')} un.
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Valor total em estoque:
          </span>
          <span className="font-bold text-lg">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalValue)}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Apply same location to all
            const defaultLocation = locations[0];
            if (defaultLocation) {
              variants.forEach(variant => {
                onUpdateStockEntry(variant.id, {
                  locationId: defaultLocation.id,
                });
              });
            }
          }}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Mesma localização para todos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Set quantity 1 for all without quantity
            variants.forEach(variant => {
              const entry = getStockEntry(variant.id);
              if (!entry?.quantity) {
                onUpdateStockEntry(variant.id, { quantity: 1 });
              }
            });
          }}
        >
          <Package className="h-4 w-4 mr-2" />
          Quantidade 1 para todos
        </Button>
      </div>
    </div>
  );
}

// ============================================
// STOCK ENTRY CARD
// ============================================

interface StockEntryCardProps {
  variant: WizardVariant;
  entry?: WizardStockEntry;
  locations: Location[];
  onUpdate: (data: Partial<WizardStockEntry>) => void;
  error?: string;
}

function StockEntryCard({
  variant,
  entry,
  locations,
  onUpdate,
  error,
}: StockEntryCardProps) {
  const [locationOpen, setLocationOpen] = useState(false);

  const selectedLocation = locations.find(l => l.id === entry?.locationId);

  return (
    <Card className={cn(error && 'border-red-500')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{variant.name}</span>
            {variant.sku && (
              <Badge variant="outline" className="text-xs font-mono">
                {variant.sku}
              </Badge>
            )}
          </div>
          {variant.price && (
            <span className="text-muted-foreground font-normal">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(variant.price)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-xs">Quantidade Inicial</Label>
            <Input
              type="number"
              min="0"
              value={entry?.quantity || ''}
              onChange={e =>
                onUpdate({ quantity: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          {/* Location */}
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs">Localização</Label>
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={locationOpen}
                  className="w-full justify-between"
                >
                  {selectedLocation ? (
                    <span className="truncate">
                      {selectedLocation.code} - {selectedLocation.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Selecione...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar localização..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma localização encontrada.</CommandEmpty>
                    <CommandGroup>
                      {locations.map(location => (
                        <CommandItem
                          key={location.id}
                          value={`${location.code} ${location.name}`}
                          onSelect={() => {
                            onUpdate({ locationId: location.id });
                            setLocationOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              entry?.locationId === location.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{location.code}</span>
                            <span className="text-xs text-muted-foreground">
                              {location.name}
                              {location.warehouseName &&
                                ` • ${location.warehouseName}`}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Lot/Batch info (optional) */}
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <div className="space-y-2">
            <Label className="text-xs">Lote (opcional)</Label>
            <Input
              value={entry?.lotNumber || ''}
              onChange={e => onUpdate({ lotNumber: e.target.value })}
              placeholder="Número do lote"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Validade (opcional)</Label>
            <Input
              type="date"
              value={entry?.expirationDate || ''}
              onChange={e => onUpdate({ expirationDate: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
