'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PPEAssignment, PPECondition } from '@/types/hr';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useReturnPPE } from '../api';

interface ReturnPPEModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: PPEAssignment | null;
}

export function ReturnPPEModal({
  isOpen,
  onClose,
  assignment,
}: ReturnPPEModalProps) {
  const [returnCondition, setReturnCondition] = useState<PPECondition>('GOOD');
  const [notes, setNotes] = useState('');

  const returnMutation = useReturnPPE({
    onSuccess: () => {
      resetForm();
      onClose();
    },
  });

  function resetForm() {
    setReturnCondition('GOOD');
    setNotes('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!assignment) return;

    await returnMutation.mutateAsync({
      assignmentId: assignment.id,
      data: {
        returnCondition,
        ...(notes.trim() && { notes: notes.trim() }),
      },
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Devolver EPI</DialogTitle>
          <DialogDescription>
            Registre a devolução do equipamento de proteção individual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="return-condition">Condição de Devolução *</Label>
            <Select
              value={returnCondition}
              onValueChange={val => setReturnCondition(val as PPECondition)}
            >
              <SelectTrigger id="return-condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">Novo</SelectItem>
                <SelectItem value="GOOD">Bom</SelectItem>
                <SelectItem value="WORN">Desgastado</SelectItem>
                <SelectItem value="DAMAGED">Danificado</SelectItem>
              </SelectContent>
            </Select>
            {returnCondition === 'DAMAGED' && (
              <p className="mt-1 text-xs text-rose-500">
                Equipamentos danificados não serão devolvidos ao estoque
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="return-notes">Observações</Label>
            <Textarea
              id="return-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observações sobre a devolução..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={returnMutation.isPending}>
            {returnMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirmar Devolução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
