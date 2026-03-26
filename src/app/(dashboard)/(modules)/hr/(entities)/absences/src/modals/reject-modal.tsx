'use client';

/**
 * OpenSea OS - Reject Absence Modal (HR)
 *
 * Modal para rejeitar uma ausência com justificativa.
 */

import { useState } from 'react';
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
import { translateError } from '@/lib/error-messages';
import { XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRejectAbsence } from '../api';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceId: string | null;
}

export function RejectModal({ isOpen, onClose, absenceId }: RejectModalProps) {
  const [reason, setReason] = useState('');

  const rejectAbsence = useRejectAbsence({
    onSuccess: () => {
      setReason('');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(translateError(error.message));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!absenceId || reason.length < 10) return;

    rejectAbsence.mutate({ id: absenceId, reason });
  }

  const isValid = reason.length >= 10;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          setReason('');
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-rose-500 to-rose-600 p-2 rounded-lg">
              <XCircle className="h-5 w-5" />
            </div>
            Rejeitar Ausência
          </DialogTitle>
          <DialogDescription>
            Informe o motivo da rejeição. Mínimo de 10 caracteres.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Motivo da Rejeição</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo da rejeição..."
              rows={4}
              required
              minLength={10}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/10 caracteres mínimos
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setReason('');
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isValid || rejectAbsence.isPending}
            >
              {rejectAbsence.isPending ? 'Rejeitando...' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RejectModal;
