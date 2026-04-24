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
import { RotatingCodeDisplay } from '@/components/ui/rotating-code-display';
import { translateError } from '@/lib/error-messages';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';

interface RevealAdminTotpModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

/**
 * Modal que mostra o código TOTP rotativo administrativo de um usuário.
 * **Deve ser aberto SOMENTE após** um `VerifyActionPinModal` ter sido
 * validado. Este componente não pede o PIN — ele assume que o parent já
 * garantiu essa etapa.
 */
export function RevealAdminTotpModal({
  isOpen,
  onClose,
  user,
}: RevealAdminTotpModalProps) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-totp', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não fornecido');
      return usersService.revealAdminTotp(user.id);
    },
    enabled: isOpen && !!user,
    // Sempre buscar ao abrir; refetch é disparado pelo componente quando rotaciona.
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Token de Reset Administrativo
          </DialogTitle>
          <DialogDescription>
            Passe este código para <strong>{user?.email || 'o usuário'}</strong>{' '}
            por telefone ou presencialmente. O código é rotativo e muda
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando código...
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  Não foi possível gerar o código
                </p>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                  {translateError(
                    error instanceof Error ? error.message : 'Erro desconhecido'
                  )}
                </p>
              </div>
            </div>
          ) : data ? (
            <>
              <RotatingCodeDisplay
                code={data.code}
                expiresAt={data.expiresAt}
                periodSeconds={data.periodSeconds}
                onRotate={() => refetch()}
              />

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠️ Atenção à segurança
                </p>
                <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-0.5 list-disc list-inside">
                  <li>
                    Nunca compartilhe este código em canais públicos ou chats.
                  </li>
                  <li>
                    Peça ao usuário para usá-lo imediatamente em "Esqueci minha
                    senha".
                  </li>
                  <li>Esta revelação fica registrada no log de auditoria.</li>
                </ul>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isFetching}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
