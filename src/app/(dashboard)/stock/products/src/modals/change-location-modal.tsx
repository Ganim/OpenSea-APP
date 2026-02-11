/**
 * ChangeLocationModal - Modal for changing item location (stock transfer)
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
import type { Item } from '@/types/stock';
import { ArrowLeft, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { BinSelector } from '../components/bin-selector';

export interface ChangeLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Item[];
  onConfirm: (newBinId: string, reason: string) => Promise<void>;
}

export function ChangeLocationModal({
  open,
  onOpenChange,
  selectedItems,
  onConfirm,
}: ChangeLocationModalProps) {
  const [newBinId, setNewBinId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newBinId) return;

    setIsSubmitting(true);
    try {
      await onConfirm(newBinId, reason);
      onOpenChange(false);
      setNewBinId('');
      setReason('');
    } catch (error) {
      logger.error(
        'Error changing location',
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setNewBinId('');
      setReason('');
    }
  };

  // Get unique current locations
  const currentLocations = selectedItems.reduce((acc, item) => {
    const address =
      item.bin?.address || item.resolvedAddress || item.binId || 'N/A';
    if (!acc.includes(address)) acc.push(address);
    return acc;
  }, [] as string[]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Transferência de Estoque (
            {selectedItems.length === 1
              ? '1 item'
              : `${selectedItems.length} itens`}
            )
          </DialogTitle>
          <DialogDescription>
            Selecione o novo local para os itens selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Current + New Location side by side */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            <div className="space-y-2">
              <Label>Local atual</Label>
              {currentLocations.map(location => (
                <div
                  key={location}
                  className="flex items-center gap-2 h-11 px-3 rounded-2xl border border-input bg-muted/50 text-sm w-full"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono truncate">{location}</span>
                </div>
              ))}
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mt-10" />

            <div className="space-y-2">
              <Label>Novo local</Label>
              <BinSelector
                value={newBinId}
                onChange={setNewBinId}
                placeholder="Selecione..."
                className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Quer deixar alguma observação? (Opcional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Digite uma observação..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={!newBinId || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
