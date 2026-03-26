'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { translateError } from '@/lib/error-messages';
import type { Overtime, ApproveOvertimeData } from '@/types/hr';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatDate, formatHours } from '../utils';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  overtime: Overtime | null;
  onApprove: (id: string, data: ApproveOvertimeData) => void;
  isApproving: boolean;
}

export function ApproveModal({
  isOpen,
  onClose,
  overtime,
  onApprove,
  isApproving,
}: ApproveModalProps) {
  const [addToTimeBank, setAddToTimeBank] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAddToTimeBank(false);
    }
  }, [isOpen]);

  if (!overtime) return null;

  const handleApprove = async () => {
    try {
      await onApprove(overtime.id, { addToTimeBank });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(translateError(msg));
    }
  };

  const handleClose = () => {
    if (!isApproving) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
              <Check className="h-5 w-5" />
            </div>
            Aprovar Hora Extra
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Detalhes */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium mt-0.5">
                  {formatDate(overtime.date)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Horas</p>
                <p className="font-medium mt-0.5">
                  <Badge variant="outline">{formatHours(overtime.hours)}</Badge>
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Motivo</p>
                <p className="font-medium mt-0.5">{overtime.reason}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Funcionário</p>
                <p className="font-mono text-xs mt-0.5">
                  {overtime.employeeId}
                </p>
              </div>
            </div>
          </Card>

          {/* Banco de horas */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label htmlFor="ot-timebank" className="cursor-pointer">
              Adicionar ao Banco de Horas
            </Label>
            <Switch
              id="ot-timebank"
              checked={addToTimeBank}
              onCheckedChange={setAddToTimeBank}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isApproving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            className="gap-2"
          >
            {isApproving && <Loader2 className="w-4 h-4 animate-spin" />}
            Aprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
