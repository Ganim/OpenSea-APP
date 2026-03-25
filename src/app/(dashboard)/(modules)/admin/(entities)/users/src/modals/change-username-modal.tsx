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
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { showSuccessToast } from '@/lib/toast-utils';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<{ username: string }>({
    defaultValues: { username: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const { handleError } = useFormErrorHandler({
    form,
    fieldMap: {
      'Username already exists': 'username',
      'username already': 'username',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ username: user.username || '' });
    }
  }, [user, form]);

  if (!user) return null;

  const username = form.watch('username');
  const trimmed = username.trim();
  const hasChanged = trimmed !== (user.username || '') && trimmed.length > 0;

  const handleSubmit = async (data: { username: string }) => {
    const value = data.username.trim();
    if (!value || value === (user.username || '')) return;
    setIsSubmitting(true);
    try {
      await usersService.updateUserUsername(user.id, { username: value });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccessToast('Username alterado com sucesso');
      onClose();
    } catch (error) {
      handleError(error);
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

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="new-username">Novo Username</Label>
            <div className="relative">
              <Input
                id="new-username"
                placeholder="Digite o novo username"
                autoFocus
                maxLength={255}
                aria-invalid={!!form.formState.errors.username}
                {...form.register('username', {
                  required: 'Username é obrigatório',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                })}
              />
              {form.formState.errors.username && (
                <FormErrorIcon
                  message={form.formState.errors.username.message ?? ''}
                />
              )}
            </div>
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
