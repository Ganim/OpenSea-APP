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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FINANCE_CATEGORY_TYPE_LABELS } from '@/types/finance';
import type { FinanceCategoryType } from '@/types/finance';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: FinanceCategoryType;
    description?: string;
    displayOrder?: number;
  }) => Promise<void>;
  isSubmitting: boolean;
  nextDisplayOrder: number;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  nextDisplayOrder,
}: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<FinanceCategoryType>('EXPENSE');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      displayOrder: nextDisplayOrder,
    });
    // Reset on success
    setName('');
    setType('EXPENSE');
    setDescription('');
  };

  const handleClose = () => {
    setName('');
    setType('EXPENSE');
    setDescription('');
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Categoria Financeira</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova categoria.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nome *</Label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome da categoria"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-type">Tipo *</Label>
                <Select
                  value={type}
                  onValueChange={v => setType(v as FinanceCategoryType)}
                >
                  <SelectTrigger id="cat-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FINANCE_CATEGORY_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Descrição</Label>
              <Textarea
                id="cat-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descrição opcional"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
