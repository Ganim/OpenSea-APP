/**
 * Quick Create Location Modal
 * Modal simplificado para criação rápida de localização
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
import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface QuickCreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string, name?: string) => Promise<void>;
}

export function QuickCreateLocationModal({
  isOpen,
  onClose,
  onSubmit,
}: QuickCreateLocationModalProps) {
  const [code, setCode] = useState('');
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
    if (!code.trim()) return;

    try {
      setIsLoading(true);
      await onSubmit(code.trim(), name.trim() || undefined);
      setCode(''); // Reseta o formulário
      setName('');
      // Mantém o foco no input para permitir cadastro contínuo
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Erro ao criar localização:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <MapPin className="w-5 h-5 text-blue-500" />
            </div>
            <DialogTitle>Criação Rápida</DialogTitle>
          </div>
          <DialogDescription>
            Crie uma localização rapidamente com código e nome. Você poderá
            adicionar os detalhes depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Código da Localização <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                ref={inputRef}
                placeholder="Ex: ARM-01, PRT-A1, EST-001..."
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                required
                className="h-11"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Código único para identificar a localização
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Localização (opcional)</Label>
              <Input
                id="name"
                placeholder="Ex: Armazém Principal, Prateleira A1..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Nome descritivo da localização
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
              disabled={!code.trim() || isLoading}
              className="bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isLoading ? 'Criando...' : 'Criar Rápido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
