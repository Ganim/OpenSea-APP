/**
 * ExitItemsModal - Two-step modal for item exit
 * Step 1: Select exit type
 * Step 2: Observation + confirmation (or transfer modal for TRANSFER)
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Item } from '@/types/stock';
import {
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Building,
  Loader2,
  LogOut,
  ShieldAlert,
  ShoppingCart,
  Undo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ExitType } from '../types/products.types';

const EXIT_OPTIONS: {
  type: ExitType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'red' | 'orange' | 'purple';
}[] = [
  {
    type: 'SALE',
    label: 'Venda',
    description: 'Saída por venda ao cliente',
    icon: ShoppingCart,
  },
  {
    type: 'PRODUCTION',
    label: 'Utilização',
    description: 'Uso interno da empresa ou ordem de serviço',
    icon: Building,
  },
  {
    type: 'SAMPLE',
    label: 'Amostra',
    description: 'Saída para amostra ou mostruário',
    icon: ArrowUpRight,
    color: 'purple',
  },
  {
    type: 'SUPPLIER_RETURN',
    label: 'Devolução ao Fornecedor',
    description: 'Retorno do item ao fornecedor',
    icon: Undo2,
  },
  {
    type: 'LOSS',
    label: 'Perda/Furto/Roubo',
    description: 'Item perdido, furtado ou roubado',
    icon: ShieldAlert,
    color: 'red',
  },
  {
    type: 'TRANSFER',
    label: 'Transferência de Estoque',
    description: 'Movimentação para outro local',
    icon: ArrowRightLeft,
    color: 'orange',
  },
];

export interface ExitItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Item[];
  onConfirm: (exitType: ExitType, reason: string) => Promise<void>;
  /** Called when user selects TRANSFER - parent should open transfer modal */
  onTransfer?: () => void;
  /** When provided, skips step 1 and opens directly on step 2 with this type */
  initialExitType?: ExitType;
}

export function ExitItemsModal({
  open,
  onOpenChange,
  selectedItems,
  onConfirm,
  onTransfer,
  initialExitType,
}: ExitItemsModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<ExitType | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When opening with initialExitType, skip to step 2
  useEffect(() => {
    if (open && initialExitType) {
      setSelectedType(initialExitType);
      setStep(2);
    }
  }, [open, initialExitType]);

  const handleSelectType = (type: ExitType) => {
    if (type === 'TRANSFER') {
      // Close this modal and open transfer modal
      handleClose();
      onTransfer?.();
      return;
    }
    setSelectedType(type);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      await onConfirm(selectedType, reason);
      handleClose();
    } catch (error) {
      logger.error(
        'Error processing exit',
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (initialExitType) {
      // Came from action bar with pre-selected type - close modal
      handleClose();
      return;
    }
    setStep(1);
    setSelectedType(null);
    setReason('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setStep(1);
      setSelectedType(null);
      setReason('');
    }
  };

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.currentQuantity,
    0
  );

  const selectedConfig = EXIT_OPTIONS.find(o => o.type === selectedType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <LogOut className="h-5 w-5" />
                Dar Saída de Estoque
              </>
            ) : (
              <>
                {selectedConfig && (
                  <selectedConfig.icon
                    className={cn(
                      'h-5 w-5',
                      selectedConfig.color === 'red' && 'text-red-500',
                      selectedConfig.color === 'orange' && 'text-orange-500',
                      selectedConfig.color === 'purple' && 'text-purple-500'
                    )}
                  />
                )}
                {selectedConfig?.label} (
                {selectedItems.length === 1
                  ? '1 item'
                  : `${selectedItems.length} itens`}
                )
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? (
              <>
                Selecione o tipo de saída para{' '}
                {selectedItems.length === 1
                  ? '1 item'
                  : `${selectedItems.length} itens`}{' '}
                (total: {totalQuantity} unidades)
              </>
            ) : (
              'Confirmação de saída. Essa ação não poderá ser desfeita!'
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          /* Step 1: Select exit type */
          <div className="py-2 space-y-2">
            {EXIT_OPTIONS.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleSelectType(option.type)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg border border-border cursor-pointer transition-colors text-left hover:bg-muted/50"
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      option.color === 'red' && 'text-red-500',
                      option.color === 'orange' && 'text-orange-500',
                      option.color === 'purple' && 'text-purple-500',
                      !option.color && 'text-muted-foreground'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Step 2: Observation + confirmation */
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Quer deixar alguma observação? (Opcional)
              </Label>
              <Textarea
                id="reason"
                placeholder="Digite uma observação..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                variant="destructive"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar Saída
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
