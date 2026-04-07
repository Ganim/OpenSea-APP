/**
 * Create User Modal
 * Modal para criação de novo usuário com validação robusta.
 *
 * - Campos username e email validam unicidade on blur
 * - Senha usa PasswordStrengthChecklist em tempo real
 * - Erros de API são mapeados para os campos via useFormErrorHandler
 */

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
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PasswordStrengthChecklist,
  isPasswordStrong,
} from '@/components/ui/password-strength-checklist';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { t } from '@/lib/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, t('validation.minLength', { field: 'Username', min: 3 }))
    .max(30, t('validation.maxLength', { field: 'Username', max: 30 })),
  email: z.string().email(t('validation.email')),
  password: z
    .string()
    .min(8, t('validation.minLength', { field: 'Senha', min: 8 })),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (data: CreateUserFormData) => Promise<void>;
}

export function CreateModal({
  isOpen,
  onOpenChange,
  onCreateUser,
}: CreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const { handleError } = useFormErrorHandler({
    form,
    fieldMap: {
      'Username already exists': 'username',
      'Email already exists': 'email',
      'username already': 'username',
      'email already': 'email',
    },
  });

  const password = form.watch('password');

  const onSubmit = async (data: CreateUserFormData) => {
    if (!isPasswordStrong(data.password)) {
      form.setError('password', {
        type: 'manual',
        message: t('auth.passwordNotStrong'),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateUser(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo usuário. As permissões serão
            gerenciadas através de grupos de permissões após a criação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="joaosilva"
                aria-invalid={!!form.formState.errors.username}
                {...form.register('username')}
              />
              {form.formState.errors.username && (
                <FormErrorIcon
                  message={form.formState.errors.username.message ?? ''}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="joao@exemplo.com"
                aria-invalid={!!form.formState.errors.email}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <FormErrorIcon
                  message={form.formState.errors.email.message ?? ''}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={!!form.formState.errors.password}
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <FormErrorIcon
                  message={form.formState.errors.password.message ?? ''}
                />
              )}
            </div>
            <PasswordStrengthChecklist password={password} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
