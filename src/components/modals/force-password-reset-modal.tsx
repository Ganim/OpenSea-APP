'use client';

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
import { useForcePasswordReset } from '@/hooks/use-force-password-reset';
import type { User } from '@/types/auth';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ForcePasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ForcePasswordResetModal({
  isOpen,
  onClose,
  user,
}: ForcePasswordResetModalProps) {
  const [reason, setReason] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const forcePasswordReset = useForcePasswordReset();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await forcePasswordReset.mutateAsync({
        userId: user.id,
        data: {
          reason: reason || undefined,
          sendEmail,
        },
      });

      toast.success(`Reset de senha solicitado para ${user.email}`);

      // Limpar formulário
      setReason('');
      setSendEmail(false);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao solicitar reset de senha'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Forçar Reset de Senha
          </DialogTitle>
          <DialogDescription>
            Solicitação de redefinição de senha para{' '}
            <strong>{user?.email || 'usuário'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Política de segurança, suspeita de comprometimento..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              O motivo será exibido ao usuário quando tentar fazer login
            </p>
          </div>

          {/* Enviar Email */}
          <div className="flex items-center space-x-2">
            <input
              id="sendEmail"
              type="checkbox"
              checked={sendEmail}
              onChange={e => setSendEmail(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <Label
              htmlFor="sendEmail"
              className="cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Enviar email de notificação
            </Label>
          </div>

          {/* Resumo */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              ℹ️ O que acontecerá:
            </p>
            <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <li>• O usuário será bloqueado no próximo login</li>
              <li>• Receberá um token para redefinir a senha</li>
              {sendEmail && (
                <li>• Um email de notificação será enviado imediatamente</li>
              )}
              {reason && <li>• O motivo será exibido no erro de login</li>}
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={forcePasswordReset.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={forcePasswordReset.isPending}
            className="gap-2"
          >
            {forcePasswordReset.isPending && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Forçar Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
