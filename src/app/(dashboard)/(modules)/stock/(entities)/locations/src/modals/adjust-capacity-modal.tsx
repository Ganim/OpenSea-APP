'use client';

import { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUpdateBin } from '../api/bins.queries';

interface AdjustCapacityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  binId: string;
  binAddress: string;
  currentCapacity: number | null | undefined;
  zoneId: string;
}

export function AdjustCapacityModal({
  open,
  onOpenChange,
  binId,
  binAddress,
  currentCapacity,
  zoneId,
}: AdjustCapacityModalProps) {
  const [capacity, setCapacity] = useState('');
  const updateBin = useUpdateBin();

  useEffect(() => {
    if (open) {
      setCapacity(currentCapacity?.toString() ?? '');
    }
  }, [open, currentCapacity]);

  const handleSubmit = useCallback(async () => {
    const parsed = parseInt(capacity, 10);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Capacidade inválida');
      return;
    }

    try {
      await updateBin.mutateAsync({
        id: binId,
        zoneId,
        data: { capacity: parsed },
      });
      toast.success('Capacidade atualizada com sucesso!');
      onOpenChange(false);
    } catch {
      toast.error('Erro ao atualizar capacidade');
    }
  }, [binId, capacity, updateBin, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajustar Capacidade</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Defina a capacidade máxima do nicho{' '}
            <span className="font-mono font-medium text-foreground">
              {binAddress}
            </span>
          </p>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Capacidade</Label>
            <Input
              type="number"
              min={0}
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
              placeholder="Ex: 50"
              className="h-11"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateBin.isPending || !capacity.trim()}
          >
            {updateBin.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
