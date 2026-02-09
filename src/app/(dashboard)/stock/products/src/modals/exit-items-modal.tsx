/**
 * ExitItemsModal - Modal for selecting exit type and processing item exit
 */

'use client';

import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Item } from '@/types/stock';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Building,
  Clock,
  Loader2,
  ShoppingCart,
  Undo2,
} from 'lucide-react';
import { useState } from 'react';
import { type ExitType, EXIT_TYPE_CONFIG } from '../types/products.types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart: ShoppingCart,
  AlertTriangle: AlertTriangle,
  Clock: Clock,
  AlertCircle: AlertCircle,
  Building: Building,
  Undo2: Undo2,
  ArrowRightLeft: ArrowRightLeft,
};

export interface ExitItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Item[];
  onConfirm: (exitType: ExitType, reason: string) => Promise<void>;
}

export function ExitItemsModal({
  open,
  onOpenChange,
  selectedItems,
  onConfirm,
}: ExitItemsModalProps) {
  const [selectedType, setSelectedType] = useState<ExitType | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      await onConfirm(selectedType, reason);
      onOpenChange(false);
      setSelectedType(null);
      setReason('');
    } catch (error) {
      logger.error(
        'Error processing exit',
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setSelectedType(null);
      setReason('');
    }
  };

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.currentQuantity,
    0
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dar Saída de Estoque</DialogTitle>
          <DialogDescription>
            Selecione o tipo de saída para{' '}
            {selectedItems.length === 1
              ? '1 item'
              : `${selectedItems.length} itens`}{' '}
            (total: {totalQuantity} unidades)
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <RadioGroup
            value={selectedType || ''}
            onValueChange={value => setSelectedType(value as ExitType)}
            className="grid gap-2"
          >
            {(
              Object.entries(EXIT_TYPE_CONFIG) as [
                ExitType,
                (typeof EXIT_TYPE_CONFIG)[ExitType],
              ][]
            ).map(([type, config]) => {
              const Icon = ICON_MAP[config.icon];
              return (
                <div key={type}>
                  <RadioGroupItem
                    value={type}
                    id={type}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      'hover:bg-muted/50',
                      selectedType === type
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          selectedType === type
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="reason">Observação (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Digite uma observação ou motivo adicional..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedType || isSubmitting}
            variant="destructive"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Saída
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
