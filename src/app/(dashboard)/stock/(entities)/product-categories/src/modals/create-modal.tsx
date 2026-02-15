/**
 * OpenSea OS - Create Category Modal
 */

'use client';

import { logger } from '@/lib/logger';
import { DialogHeader } from '@/components/shared/modals/dialog-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '@/types/stock';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { PiFolderOpenDuotone } from 'react-icons/pi';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
}

export function CreateModal({ isOpen, onClose, onSubmit }: CreateModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    iconUrl: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        description: '',
        iconUrl: '',
        isActive: true,
      });
      onClose();
    } catch (error) {
      logger.error(
        'Erro ao criar categoria',
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={containerRef}
        onOpenAutoFocus={event => {
          event.preventDefault();
          const form = containerRef.current?.querySelector('form');
          const firstFocusable = form?.querySelector<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
          );
          firstFocusable?.focus();
        }}
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader
            title="Nova Categoria"
            description="Crie uma nova categoria de produtos"
            icon={PiFolderOpenDuotone}
            align="between"
            variant="default"
            iconBgClassName="bg-linear-to-br from-blue-500 to-purple-600 text-white"
            onClose={onClose}
          />

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Eletrônicos"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="grid gap-2">
                <Label htmlFor="iconUrl">URL do Ícone (SVG)</Label>
                <Input
                  id="iconUrl"
                  placeholder="https://exemplo.com/icone.svg"
                  value={formData.iconUrl || ''}
                  onChange={e =>
                    setFormData({ ...formData, iconUrl: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Preview do Ícone</Label>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-slate-800 overflow-hidden">
                  {formData.iconUrl ? (
                    <Image
                      src={formData.iconUrl}
                      alt="Preview"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain brightness-0 invert"
                      unoptimized
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <PiFolderOpenDuotone className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Categoria ativa
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
