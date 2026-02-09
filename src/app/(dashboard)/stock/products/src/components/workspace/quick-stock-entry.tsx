'use client';

/**
 * QuickStockEntry Component
 * Popover for rapidly adding stock to a variant
 * Target: 3 clicks to add stock
 */

import { logger } from '@/lib/logger';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Plus,
  Loader2,
  MapPin,
  Check,
  ChevronsUpDown,
  Package,
} from 'lucide-react';

import { useLocations } from '@/hooks/stock/use-stock-other';
import { itemsService } from '@/services/stock';
import type { QuickStockEntryProps } from './types';

// ============================================
// VALIDATION SCHEMA
// ============================================

const quickStockSchema = z.object({
  quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
  locationId: z.string().min(1, 'Selecione uma localização'),
});

type QuickStockFormValues = z.infer<typeof quickStockSchema>;

// ============================================
// COMPONENT
// ============================================

export function QuickStockEntry({
  variantId,
  variantName,
  open,
  onOpenChange,
  onSuccess,
}: QuickStockEntryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const { data: locationsData, isLoading: loadingLocations } = useLocations();
  const locations = locationsData?.locations || [];

  const form = useForm<QuickStockFormValues>({
    resolver: zodResolver(quickStockSchema) as any,
    defaultValues: {
      quantity: 1,
      locationId: '',
    },
  });

  const onSubmit = useCallback(
    async (values: QuickStockFormValues) => {
      setIsSubmitting(true);

      try {
        const response = await itemsService.registerEntry({
          variantId,
          binId: values.locationId,
          quantity: values.quantity,
          uniqueCode: `ITM-${Date.now()}`, // Auto-generate
        });

        toast.success('Estoque adicionado!', {
          description: `${values.quantity} unidade(s) de ${variantName}`,
        });

        form.reset();
        onSuccess(response.item);
        onOpenChange(false);
      } catch (error) {
        logger.error(
          'Error adding stock',
          error instanceof Error ? error : undefined
        );
        toast.error('Erro ao adicionar estoque');
      } finally {
        setIsSubmitting(false);
      }
    },
    [variantId, variantName, form, onSuccess, onOpenChange]
  );

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Entrada Rápida</span>
          </div>

          <div className="text-xs text-muted-foreground truncate">
            {variantName}
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
              onKeyDown={handleKeyDown}
            >
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className="h-8"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Localização</FormLabel>
                    <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'w-full justify-between h-8 text-sm',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={loadingLocations}
                          >
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {field.value
                                ? locations.find(l => l.id === field.value)
                                    ?.code
                                : 'Selecione...'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Buscar..."
                            className="h-8"
                          />
                          <CommandList>
                            <CommandEmpty>Nenhuma localização.</CommandEmpty>
                            <CommandGroup>
                              {locations.map(location => (
                                <CommandItem
                                  key={location.id}
                                  value={location.code}
                                  onSelect={() => {
                                    form.setValue('locationId', location.id);
                                    setLocationOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-3 w-3',
                                      field.value === location.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <span className="truncate">
                                    {location.code}
                                  </span>
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

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Adicionar'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// QUICK STOCK BUTTON (Standalone trigger)
// ============================================

interface QuickStockButtonProps {
  variantId: string;
  variantName: string;
  onSuccess?: () => void;
  className?: string;
}

export function QuickStockButton({
  variantId,
  variantName,
  onSuccess,
  className,
}: QuickStockButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <QuickStockEntry
      variantId={variantId}
      variantName={variantName}
      open={open}
      onOpenChange={setOpen}
      onSuccess={() => {
        onSuccess?.();
      }}
    />
  );
}
