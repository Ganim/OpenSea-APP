/**
 * Quick Create Modal (Generic)
 * Modal simplificado para criação rápida de qualquer entidade
 * Componente 100% genérico que funciona com qualquer entidade
 */

'use client';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
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
import { Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  title?: string;
  description?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  submitButtonText?: string;
  icon?: React.ReactNode;
}

export function QuickCreateModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Criação Rápida',
  description = 'Crie rapidamente com apenas o nome. Você poderá adicionar mais detalhes depois.',
  inputLabel = 'Nome',
  inputPlaceholder = 'Digite o nome...',
  submitButtonText = 'Criar',
  icon,
}: QuickCreateModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca o input quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      await onSubmit(name.trim());
      setName(''); // Reseta o formulário
      // Mantém o foco no input para permitir cadastro contínuo
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      logger.error('Erro ao criar', error instanceof Error ? error : undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              {icon || <Zap className="w-5 h-5 text-yellow-500" />}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{inputLabel}</Label>
              <Input
                ref={inputRef}
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder}
                disabled={isLoading}
                className="h-12"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Criando...' : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
