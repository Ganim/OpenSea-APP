/**
 * Quick Create Template Modal
 * Modal simplificado para criação rápida de template
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
import { Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface QuickCreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function QuickCreateTemplateModal({
  isOpen,
  onClose,
  onSubmit,
}: QuickCreateTemplateModalProps) {
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
      console.error('Erro ao criar template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <DialogTitle>Criação Rápida</DialogTitle>
          </div>
          <DialogDescription>
            Crie um template rapidamente com apenas o nome. Você poderá
            adicionar os detalhes depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Template <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                ref={inputRef}
                placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="h-11"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Você poderá configurar atributos e detalhes posteriormente
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isLoading ? 'Criando...' : 'Criar Rápido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
