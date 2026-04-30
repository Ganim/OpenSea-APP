'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';

interface ForceRevokeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terminalName: string;
  openSessionId: string;
  onConfirm: () => Promise<void>;
}

export function ForceRevokeDialog({
  open,
  onOpenChange,
  terminalName,
  openSessionId,
  onConfirm,
}: ForceRevokeDialogProps) {
  const [showPin, setShowPin] = useState(false);

  return (
    <>
      <Dialog open={open && !showPin} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-rose-500" />
              Sessão de caixa aberta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p>
              O terminal <strong>{terminalName}</strong> tem uma sessão de caixa
              em aberto (<code className="text-xs">{openSessionId}</code>).
            </p>
            <p className="text-sm text-muted-foreground">
              Forçar revogação descartará vendas pendentes deste device. Esta
              ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => setShowPin(true)}>
              Forçar revogação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VerifyActionPinModal
        isOpen={showPin}
        onClose={() => setShowPin(false)}
        onSuccess={async () => {
          setShowPin(false);
          await onConfirm();
          onOpenChange(false);
        }}
        title="Confirmar revogação forçada"
        description="Digite seu PIN de ação para descartar a sessão aberta e revogar o terminal."
      />
    </>
  );
}
