'use client';

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  PasswordStrengthChecklist,
  isPasswordStrong,
} from '@/components/ui/password-strength-checklist';
import { useAdminSetPassword } from '@/hooks/use-admin-set-password';
import { translateError } from '@/lib/error-messages';
import type { User } from '@/types/auth';
import { AlertTriangle, KeyRound, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AdminSetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function AdminSetPasswordModal({
  isOpen,
  onClose,
  user,
}: AdminSetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forceChange, setForceChange] = useState(true);
  const [error, setError] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const setPasswordMutation = useAdminSetPassword();

  const resetState = () => {
    setPassword('');
    setConfirmPassword('');
    setForceChange(true);
    setError('');
    setPinOpen(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError('Preencha ambos os campos de senha.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    if (!isPasswordStrong(password)) {
      setError('A senha não atende aos requisitos de segurança.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setPinOpen(true);
  };

  const handlePinSuccess = async () => {
    if (!user) return;
    try {
      const { revokedSessionsCount } = await setPasswordMutation.mutateAsync({
        userId: user.id,
        data: {
          newPassword: password,
          forceChangeOnNextLogin: forceChange,
        },
      });

      toast.success(
        `Senha definida com sucesso. ${revokedSessionsCount > 0 ? `${revokedSessionsCount} sessão(ões) ativa(s) encerrada(s).` : ''}`.trim()
      );
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(translateError(message));
    }
  };

  return (
    <>
      <Dialog
        open={isOpen && !pinOpen}
        onOpenChange={open => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-500" />
              Definir Senha
            </DialogTitle>
            <DialogDescription>
              Definir uma nova senha para{' '}
              <strong>{user?.email || 'usuário'}</strong>. Após a troca, as
              sessões ativas do usuário serão encerradas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-set-password">Nova Senha</Label>
              <PasswordInput
                id="admin-set-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                iconLeft={<Lock className="w-4 h-4 text-muted-foreground" />}
              />
              <PasswordStrengthChecklist password={password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-set-password-confirm">
                Confirmar Nova Senha
              </Label>
              <PasswordInput
                id="admin-set-password-confirm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                iconLeft={<Lock className="w-4 h-4 text-muted-foreground" />}
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="admin-set-password-force"
                checked={forceChange}
                onCheckedChange={v => setForceChange(v === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="admin-set-password-force"
                  className="cursor-pointer"
                >
                  Obrigar usuário a trocar no próximo login
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recomendado. O usuário será bloqueado até criar uma senha
                  pessoal.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={setPasswordMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={setPasswordMutation.isPending}
              className="gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Definir Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VerifyActionPinModal
        isOpen={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={handlePinSuccess}
        title="Confirmar Definição de Senha"
        description={`Digite seu PIN de Ação para confirmar a definição de uma nova senha para ${user?.email || 'o usuário'}.`}
      />
    </>
  );
}
