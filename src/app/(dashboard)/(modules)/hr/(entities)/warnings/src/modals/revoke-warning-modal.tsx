/**
 * Revoke Warning Modal
 * Two-step destructive flow: motivo obrigatório → PIN de ação.
 * Revogar advertência tem implicação CLT (documento formal); PIN é
 * obrigatório conforme regra de ações destrutivas do projeto.
 */

'use client';

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
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
import { Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRevokeWarning } from '../api';

interface RevokeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  warningId: string | null;
}

export function RevokeWarningModal({
  isOpen,
  onClose,
  warningId,
}: RevokeWarningModalProps) {
  const [revokeReason, setRevokeReason] = useState('');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const revokeWarning = useRevokeWarning();

  const handleClose = () => {
    setRevokeReason('');
    setPinModalOpen(false);
    onClose();
  };

  const handleOpenPin = () => {
    if (!warningId) return;
    if (!revokeReason || revokeReason.length < 10) {
      toast.error('O motivo da revogação deve ter no mínimo 10 caracteres');
      return;
    }
    setPinModalOpen(true);
  };

  const handlePinConfirmed = async () => {
    if (!warningId) return;
    try {
      await revokeWarning.mutateAsync({
        id: warningId,
        data: { revokeReason },
      });
      handleClose();
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <>
      <Dialog
        open={isOpen && !pinModalOpen}
        onOpenChange={open => !open && handleClose()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-rose-500" />
              Revogar Advertência
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da revogação. Na próxima etapa, o PIN de ação
              será solicitado. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Motivo da Revogação <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                placeholder="Explique o motivo da revogação (mín. 10 caracteres)"
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                rows={4}
              />
              {revokeReason.length > 0 && revokeReason.length < 10 && (
                <p className="text-xs text-rose-500">
                  Mínimo de 10 caracteres ({revokeReason.length}/10)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleOpenPin}
              disabled={
                revokeWarning.isPending ||
                !revokeReason ||
                revokeReason.length < 10
              }
            >
              {revokeWarning.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Revogando...
                </span>
              ) : (
                'Prosseguir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VerifyActionPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={handlePinConfirmed}
        title="Confirmar Revogação de Advertência"
        description="Digite seu PIN de Ação para revogar esta advertência. Esta operação ficará registrada no log de auditoria."
      />
    </>
  );
}
