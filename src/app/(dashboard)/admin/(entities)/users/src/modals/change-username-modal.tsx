/**
 * Change Username Modal
 * Modal para alterar o username de um usuário
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ChangeUsernameModal({
  isOpen,
  onClose,
  user,
}: ChangeUsernameModalProps) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  if (!user) return null;

  const trimmed = username.trim();
  const hasChanged = trimmed !== (user.username || '') && trimmed.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanged) return;
    setIsSubmitting(true);
    try {
      await usersService.updateUserUsername(user.id, { username: trimmed });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccessToast('Username alterado com sucesso');
      onClose();
    } catch (error) {
      showErrorToast({
        title: 'Erro ao alterar username',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                <Pencil className="h-5 w-5" />
              </div>
              Alterar Username
            </div>
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="new-username">Novo Username</Label>
            <Input
              id="new-username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Digite o novo username"
              autoFocus
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              Username atual: <strong>{user.username}</strong>
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!hasChanged || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
