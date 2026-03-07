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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { useState } from 'react';
import type { CreateModalProps } from '../types';
import { createPermissionGroup } from '../utils/permission-groups.utils';

export function CreateModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    priority: 0,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createPermissionGroup(formData);
      showSuccessToast('Grupo criado com sucesso');
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        priority: 0,
        isActive: true,
      });
    } catch (error) {
      logger.error(
        'Erro ao criar grupo',
        error instanceof Error ? error : undefined
      );
      showErrorToast({
        title: 'Erro ao criar grupo',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Gerentes"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="Ex: managers"
                value={formData.slug}
                onChange={e =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o grupo..."
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                placeholder="0"
                value={formData.priority}
                onChange={e =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 0,
                  })
                }
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
