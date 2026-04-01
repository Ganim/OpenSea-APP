'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface RejectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (rejectionReason?: string) => Promise<void>;
  candidateName?: string;
}

export function RejectApplicationModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
  candidateName,
}: RejectApplicationModalProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit(reason.trim() || undefined);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={val => !val && handleClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Rejeitar Candidatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {candidateName
              ? `Tem certeza que deseja rejeitar a candidatura de ${candidateName}?`
              : 'Tem certeza que deseja rejeitar esta candidatura?'}
          </p>

          <div className="space-y-2">
            <Label htmlFor="reject-reason">Motivo da rejeição</Label>
            <Textarea
              id="reject-reason"
              placeholder="Descreva o motivo da rejeição (opcional)..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejeitando...
              </>
            ) : (
              'Rejeitar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
