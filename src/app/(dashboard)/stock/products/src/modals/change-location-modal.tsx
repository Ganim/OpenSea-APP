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
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
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
          <DialogTitle>Mudar Local</DialogTitle>
          <DialogDescription>
            Transferir{' '}
            {selectedItems.length === 1
              ? '1 item'
              : `${selectedItems.length} itens`}{' '}
            para um novo local
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Current Locations */}
          <div className="space-y-2">
            <Label>Local atual</Label>
            <div className="flex flex-wrap gap-2">
              {currentLocations.map(location => (
                <div
                  key={location}
                  className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-sm"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono">{location}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* New Location Selector */}
          <div className="space-y-2">
            <Label htmlFor="new-location">Novo local</Label>
            <BinSelector
              value={newBinId}
              onChange={setNewBinId}
              placeholder="Selecione o novo local..."
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da transferência (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Digite o motivo da transferência..."
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
          >
            Cancelar
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
