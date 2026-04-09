'use client';

import { useState, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  MoveRight,
  Package,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BinSelector } from '../components/bin-selector';
import type { BinItem, Bin } from '@/types/stock';

export interface MoveItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BinItem;
  currentBin: Bin;
  warehouseId?: string;
  onMove: (itemId: string, destinationBinId: string) => Promise<void>;
}

export function MoveItemModal({
  open,
  onOpenChange,
  item,
  currentBin,
  warehouseId,
  onMove,
}: MoveItemModalProps) {
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [targetBinId, setTargetBinId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMove = useCallback(async () => {
    if (!targetBinId) return;
    setIsMoving(true);
    setError(null);
    try {
      await onMove(item.id, targetBinId);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao mover item.');
    } finally {
      setIsMoving(false);
    }
  }, [targetBinId, item.id, onMove, onOpenChange]);

  const handleClose = useCallback(() => {
    if (isMoving) return;
    setTargetAddress(null);
    setTargetBinId(null);
    setError(null);
    onOpenChange(false);
  }, [isMoving, onOpenChange]);

  const canMove = !!targetBinId && targetAddress !== currentBin.address;
  const itemCode = item.itemCode;

  return (
    <Dialog open={open} onOpenChange={val => !val && handleClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] w-[calc(100vw-1rem)] sm:w-full flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Hero header — same pattern as ItemHistoryModal */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border-b border-border px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5">
          <DialogHeader>
            <div className="flex flex-col gap-3">
              {/* Title row */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 border border-blue-600/25 dark:border-blue-500/20 shrink-0">
                  <MoveRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-base text-left">
                    Transferir Item
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-left">
                    <span className="font-mono text-xs sm:text-sm break-all">
                      {itemCode}
                    </span>
                  </DialogDescription>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-stretch gap-2">
                <div className="flex-1 min-w-[120px] bg-white dark:bg-white/5 border border-border rounded-lg px-3 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Origem
                  </div>
                  <div className="text-sm font-semibold text-foreground mt-0.5 font-mono break-all">
                    {currentBin.address}
                  </div>
                </div>
                <div className="flex-1 min-w-[120px] bg-white dark:bg-white/5 border border-border rounded-lg px-3 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Quantidade
                  </div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {item.quantity}
                    {item.unitLabel ? (
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        {item.unitLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Item card */}
          <div className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/15 mt-0.5">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground truncate">
                {item.productName}
              </p>
              {(item.variantName || item.variantReference) && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.variantName}
                  {item.variantName && item.variantReference && ' · '}
                  {item.variantReference}
                </p>
              )}
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 tabular-nums text-xs self-start"
            >
              {item.quantity}
              {item.unitLabel ? ` ${item.unitLabel}` : ''}
            </Badge>
          </div>

          {/* Movement arrow: origin → destination */}
          <div className="flex items-center gap-3">
            <div className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                Origem
              </p>
              <p className="font-mono font-semibold text-sm break-all">
                {currentBin.address}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
            <div
              className={cn(
                'flex-1 px-3 py-2.5 rounded-lg border text-center',
                targetAddress
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-dashed border-border'
              )}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                Destino
              </p>
              <p className="font-mono font-semibold text-sm break-all">
                {targetAddress || '—'}
              </p>
            </div>
          </div>

          {/* Destination selector */}
          <BinSelector
            label="Nicho de destino"
            value={targetAddress || undefined}
            onChange={(address, bin) => {
              setTargetAddress(address);
              setTargetBinId(bin?.id ?? null);
              setError(null);
            }}
            placeholder="Selecione o nicho de destino"
            warehouseId={warehouseId}
            zoneId={!warehouseId ? currentBin.zoneId : undefined}
            onlyAvailable
            excludeBinIds={[currentBin.id]}
            required
          />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-rose-50 dark:bg-rose-500/8 border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isMoving}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleMove}
            disabled={!canMove || isMoving}
            className="gap-1.5 w-full sm:w-auto"
          >
            {isMoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoveRight className="h-4 w-4" />
            )}
            {isMoving ? 'Movendo...' : 'Transferir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
