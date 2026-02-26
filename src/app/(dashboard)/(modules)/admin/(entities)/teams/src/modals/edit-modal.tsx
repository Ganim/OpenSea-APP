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
import { teamsService } from '@/services/core/teams.service';
import type { Team } from '@/types/core';
import { useEffect, useState } from 'react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onSuccess: () => void;
}

export function EditModal({ isOpen, onClose, team, onSuccess }: EditModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team && isOpen) {
      setName(team.name);
      setDescription(team.description ?? '');
      setColor(team.color ?? '');
    }
  }, [team, isOpen]);

  const handleSubmit = async () => {
    if (!team || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await teamsService.updateTeam(team.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color: color.trim() || undefined,
      });
      showSuccessToast('Equipe atualizada com sucesso');
      onSuccess();
    } catch (error) {
      logger.error('Erro ao atualizar equipe', error instanceof Error ? error : undefined);
      showErrorToast({
        title: 'Erro ao atualizar equipe',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Equipe</DialogTitle>
          <DialogDescription>Altere as informações da equipe.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome da equipe"
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição da equipe"
              rows={3}
            />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={color || '#3b82f6'}
                onChange={e => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
