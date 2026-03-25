/**
 * Create Permission Group Modal
 * Modal para criar novo grupo de permissões
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
import { Textarea } from '@/components/ui/textarea';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { showSuccessToast } from '@/lib/toast-utils';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateModalProps } from '../types';
import { createPermissionGroup } from '../utils/permission-groups.utils';

export function CreateModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      priority: 0,
      isActive: true,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const { handleError } = useFormErrorHandler({
    form,
    fieldMap: {
      'name already exists': 'name',
      'slug already exists': 'slug',
      'already exists': 'name',
    },
  });

  const handleSubmit = async (formData: {
    name: string;
    slug: string;
    description: string;
    priority: number;
    isActive: boolean;
  }) => {
    setIsLoading(true);
    try {
      await createPermissionGroup(formData);
      showSuccessToast('Grupo criado com sucesso');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo grupo de permissões
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Ex: Gerentes"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register('name', {
                    required: 'Nome é obrigatório',
                  })}
                />
                {form.formState.errors.name && (
                  <FormErrorIcon
                    message={form.formState.errors.name.message ?? ''}
                  />
                )}
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="relative">
                <Input
                  id="slug"
                  placeholder="Ex: managers"
                  aria-invalid={!!form.formState.errors.slug}
                  {...form.register('slug')}
                />
                {form.formState.errors.slug && (
                  <FormErrorIcon
                    message={form.formState.errors.slug.message ?? ''}
                  />
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o grupo..."
                rows={3}
                {...form.register('description')}
              />
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                placeholder="0"
                {...form.register('priority', { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
