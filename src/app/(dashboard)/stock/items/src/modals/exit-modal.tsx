'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowUpFromLine } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { itemsService } from '@/services/stock';
import type { ItemExtended, ExitMovementType } from '@/types/stock';

const EXIT_TYPES: { value: ExitMovementType; label: string }[] = [
  { value: 'SALE', label: 'Venda' },
  { value: 'PRODUCTION', label: 'Produção' },
  { value: 'SAMPLE', label: 'Amostra' },
  { value: 'LOSS', label: 'Perda/Extravio' },
];

const exitSchema = z.object({
  movementType: z.enum(['SALE', 'PRODUCTION', 'SAMPLE', 'LOSS']),
  reasonCode: z.string().optional(),
  destinationRef: z.string().optional(),
  notes: z.string().optional(),
});

type ExitFormData = z.infer<typeof exitSchema>;

interface ExitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: ItemExtended[];
  onSuccess?: () => void;
}

export function ExitModal({
  open,
  onOpenChange,
  selectedItems,
  onSuccess,
}: ExitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExitFormData>({
    resolver: zodResolver(exitSchema),
    defaultValues: {
      movementType: 'SALE',
    },
  });

  const movementType = watch('movementType');

  // Initialize quantities when items change
  useState(() => {
    const initial: Record<string, number> = {};
    selectedItems.forEach(item => {
      initial[item.id] = item.currentQuantity;
    });
    setQuantities(initial);
  });

  const onSubmit = async (data: ExitFormData) => {
    const itemsToExit = selectedItems.filter(
      item => quantities[item.id] && quantities[item.id] > 0
    );

    if (itemsToExit.length === 0) {
      toast.warning('Informe a quantidade para pelo menos um item');
      return;
    }

    // Validate quantities
    for (const item of itemsToExit) {
      const qty = quantities[item.id];
      if (qty > item.currentQuantity) {
        toast.error(
          `Quantidade para ${item.uniqueCode} excede o disponível (${item.currentQuantity})`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const promises = itemsToExit.map(item =>
        itemsService.registerExit({
          itemId: item.id,
          quantity: quantities[item.id],
          movementType: data.movementType,
          reasonCode: data.reasonCode,
          destinationRef: data.destinationRef,
          notes: data.notes,
        })
      );

      await Promise.all(promises);

      toast.success(`Saída de ${itemsToExit.length} item(s) registrada!`);
      reset();
      setQuantities({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logger.error('Exit error', error instanceof Error ? error : undefined);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao registrar saída'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setQuantities({});
    onOpenChange(false);
  };

  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const totalQuantity = Object.values(quantities).reduce(
    (sum, q) => sum + (q || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="h-5 w-5 text-red-600" />
            Saída de Estoque
          </DialogTitle>
          <DialogDescription>
            Registre a saída dos itens selecionados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Movement Type */}
          <div className="space-y-2">
            <Label htmlFor="movementType">
              Tipo de Saída <span className="text-red-500">*</span>
            </Label>
            <Select
              value={movementType}
              onValueChange={value =>
                setValue('movementType', value as ExitMovementType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {EXIT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="destinationRef">
              Referência/Destino
              {movementType === 'SALE' && ' (Nº Pedido)'}
            </Label>
            <Input
              id="destinationRef"
              placeholder={
                movementType === 'SALE'
                  ? 'Ex: PED-001'
                  : 'Referência do destino'
              }
              {...register('destinationRef')}
            />
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <Label>
              Itens ({selectedItems.length})
              <Badge variant="secondary" className="ml-2">
                Total: {totalQuantity} un
              </Badge>
            </Label>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {selectedItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-medium truncate">
                        {item.uniqueCode}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Disponível: {item.currentQuantity} un
                        {item.batchNumber && ` • Lote: ${item.batchNumber}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Input
                        type="number"
                        min={0}
                        max={item.currentQuantity}
                        value={quantities[item.id] || ''}
                        onChange={e =>
                          handleQuantityChange(
                            item.id,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 h-8"
                        placeholder="Qtd"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a saída..."
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
              variant="destructive"
              disabled={isSubmitting || totalQuantity === 0}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Registrar Saída ({totalQuantity} un)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
