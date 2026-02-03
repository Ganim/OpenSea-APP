'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowRightLeft, Check, ChevronsUpDown } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

import { itemsService } from '@/services/stock';
import type { ItemExtended } from '@/types/stock';

// Mock locations - in production, fetch from API
const MOCK_LOCATIONS = [
  {
    id: '1',
    code: 'A-01-01',
    name: 'Prateleira A1',
    warehouse: 'Armazém Principal',
  },
  {
    id: '2',
    code: 'A-01-02',
    name: 'Prateleira A2',
    warehouse: 'Armazém Principal',
  },
  {
    id: '3',
    code: 'B-01-01',
    name: 'Prateleira B1',
    warehouse: 'Armazém Principal',
  },
  { id: '4', code: 'EST-01', name: 'Estante 1', warehouse: 'Loja' },
  { id: '5', code: 'EST-02', name: 'Estante 2', warehouse: 'Loja' },
];

const transferSchema = z.object({
  destinationLocationId: z
    .string()
    .min(1, 'Selecione uma localização de destino'),
  reasonCode: z.string().optional(),
  notes: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: ItemExtended[];
  onSuccess?: () => void;
}

export function TransferModal({
  open,
  onOpenChange,
  selectedItems,
  onSuccess,
}: TransferModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locations] = useState(MOCK_LOCATIONS);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  const destinationLocationId = watch('destinationLocationId');
  const selectedLocation = locations.find(l => l.id === destinationLocationId);

  const onSubmit = async (data: TransferFormData) => {
    if (selectedItems.length === 0) {
      toast.warning('Nenhum item selecionado');
      return;
    }

    setIsSubmitting(true);

    try {
      const promises = selectedItems.map(item =>
        itemsService.transferItem({
          itemId: item.id,
          destinationBinId: data.destinationLocationId,
          reasonCode: data.reasonCode,
          notes: data.notes,
        })
      );

      await Promise.all(promises);

      toast.success(`${selectedItems.length} item(s) transferido(s)!`);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao transferir itens'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // Group items by current location
  const itemsByLocation = selectedItems.reduce(
    (acc, item) => {
      const locId = item.locationId || 'unknown';
      if (!acc[locId]) {
        acc[locId] = {
          location: item.location,
          items: [],
        };
      }
      acc[locId].items.push(item);
      return acc;
    },
    {} as Record<
      string,
      { location?: ItemExtended['location']; items: ItemExtended[] }
    >
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            Transferir Itens
          </DialogTitle>
          <DialogDescription>
            Transfira os itens selecionados para uma nova localização.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Items Summary */}
          <div className="space-y-2">
            <Label>
              Itens a Transferir
              <Badge variant="secondary" className="ml-2">
                {selectedItems.length} item(s)
              </Badge>
            </Label>
            <ScrollArea className="h-[150px] rounded-md border p-2">
              <div className="space-y-3">
                {Object.entries(itemsByLocation).map(([locId, data]) => (
                  <div key={locId}>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Origem:{' '}
                      {data.location?.name ||
                        data.location?.code ||
                        'Sem localização'}
                    </div>
                    <div className="space-y-1">
                      {data.items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="font-mono text-sm">
                            {item.uniqueCode}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.currentQuantity} un
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Destination Location */}
          <div className="space-y-2">
            <Label htmlFor="destinationLocationId">
              Localização de Destino <span className="text-red-500">*</span>
            </Label>
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
                    <span className="text-muted-foreground">
                      Selecione a localização...
                    </span>
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
                            setValue('destinationLocationId', location.id);
                            setLocationOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              destinationLocationId === location.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{location.code}</span>
                            <span className="text-xs text-muted-foreground">
                              {location.name} • {location.warehouse}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.destinationLocationId && (
              <p className="text-sm text-red-500">
                {errors.destinationLocationId.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reasonCode">Motivo</Label>
            <Textarea
              id="reasonCode"
              placeholder="Ex: Reorganização do estoque, pedido do cliente..."
              rows={2}
              {...register('reasonCode')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !destinationLocationId}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Transferir {selectedItems.length} Item(s)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
