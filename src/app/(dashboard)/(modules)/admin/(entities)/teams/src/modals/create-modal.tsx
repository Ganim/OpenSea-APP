/**
 * Create Team Modal
 * Modal para criar nova equipe
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
import type { CreateModalProps, NewTeamData } from '../types';
import { createTeam } from '../utils/teams.crud';

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#F97316', // orange
  '#14B8A6', // teal
  '#6366F1', // indigo
];

const initialFormData: NewTeamData = {
  name: '',
  description: '',
  color: '',
};

export function CreateModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<NewTeamData>({ ...initialFormData });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createTeam({
        name: formData.name,
        description: formData.description || null,
        color: formData.color || null,
      });
      showSuccessToast('Equipe criada com sucesso');
      onSuccess();
      onOpenChange(false);
      setFormData({ ...initialFormData });
    } catch (error) {
      logger.error(
        'Erro ao criar equipe',
        error instanceof Error ? error : undefined
      );
      showErrorToast({
        title: 'Erro ao criar equipe',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Equipe</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova equipe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="team-name">Nome *</Label>
              <Input
                id="team-name"
                placeholder="Ex: Equipe de Vendas"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="team-description">Descrição</Label>
              <Textarea
                id="team-description"
                placeholder="Descreva a equipe..."
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        formData.color === color ? 'white' : 'transparent',
                      boxShadow:
                        formData.color === color
                          ? `0 0 0 2px ${color}`
                          : 'none',
                    }}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        color: formData.color === color ? '' : color,
                      })
                    }
                  />
                ))}
              </div>
              {formData.color && (
                <p className="text-xs text-muted-foreground">
                  Cor selecionada: {formData.color}
                </p>
              )}
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
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Criando...' : 'Criar Equipe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
