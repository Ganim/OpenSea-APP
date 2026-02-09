'use client';

import { logger } from '@/lib/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownToLine, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useVariants } from '@/hooks/stock/use-variants';
import { itemsService } from '@/services/stock';

const entrySchema = z.object({
  variantId: z.string().min(1, 'Selecione uma variante'),
  uniqueCode: z.string().min(1, 'Código único é obrigatório'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  locationId: z.string().optional(),
  batchNumber: z.string().optional(),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface EntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EntryModal({ open, onOpenChange, onSuccess }: EntryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: variantsData } = useVariants();
  const variants = variantsData?.variants || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const selectedVariantId = watch('variantId');

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true);

    try {
      await itemsService.registerEntry({
        uniqueCode: data.uniqueCode,
        variantId: data.variantId,
        quantity: data.quantity,
        batchNumber: data.batchNumber,
        manufacturingDate: data.manufacturingDate
          ? new Date(data.manufacturingDate)
          : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        notes: data.notes,
      });

      toast.success('Entrada registrada com sucesso!');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logger.error('Entry error', error instanceof Error ? error : undefined);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao registrar entrada'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-green-600" />
            Entrada de Estoque
          </DialogTitle>
          <DialogDescription>
            Registre a entrada de novos itens no estoque.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Variant Selection */}
          <div className="space-y-2">
            <Label htmlFor="variantId">
              Variante <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedVariantId}
              onValueChange={value => setValue('variantId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a variante" />
              </SelectTrigger>
              <SelectContent>
                {variants.map(variant => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                    {variant.sku && ` (${variant.sku})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.variantId && (
              <p className="text-sm text-red-500">{errors.variantId.message}</p>
            )}
          </div>

          {/* Unique Code */}
          <div className="space-y-2">
            <Label htmlFor="uniqueCode">
              Código Único <span className="text-red-500">*</span>
            </Label>
            <Input
              id="uniqueCode"
              placeholder="Ex: ITEM-001"
              {...register('uniqueCode')}
            />
            {errors.uniqueCode && (
              <p className="text-sm text-red-500">
                {errors.uniqueCode.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantidade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Batch Number */}
          <div className="space-y-2">
            <Label htmlFor="batchNumber">Número do Lote</Label>
            <Input
              id="batchNumber"
              placeholder="Ex: L2024001"
              {...register('batchNumber')}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturingDate">Data de Fabricação</Label>
              <Input
                id="manufacturingDate"
                type="date"
                {...register('manufacturingDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Data de Validade</Label>
              <Input id="expiryDate" type="date" {...register('expiryDate')} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a entrada..."
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Registrar Entrada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
