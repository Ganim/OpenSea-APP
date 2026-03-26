/**
 * OpenSea OS - Create Category Wizard
 * Modal de criação rápida de categoria
 */

'use client';

import { Button } from '@/components/ui/button';
import { CategoryCombobox } from '@/components/ui/category-combobox';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { translateError } from '@/lib/error-messages';
import { categoriesService } from '@/services/stock';
import type { Category } from '@/types/stock';
import { Loader2, TextCursorInput } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
}

export function CreateModal({ isOpen, onClose, onSubmit }: CreateModalProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    categoriesService
      .listCategories()
      .then(r => setCategories(r.categories || []))
      .catch(() => setCategories([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setParentId('');
      setFieldErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        parentId: parentId || undefined,
        isActive: true,
      });
      setName('');
      setParentId('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (
        msg.includes('name already exists') ||
        msg.includes('category with this name')
      ) {
        setFieldErrors(prev => ({
          ...prev,
          name: translateError(msg),
        }));
      } else if (
        msg.includes('cannot be its own parent') ||
        msg.includes('circular')
      ) {
        toast.error(translateError(msg));
      } else {
        toast.error(translateError(msg));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Nova Categoria',
        description: 'Defina o nome e a hierarquia da categoria',
        icon: (
          <TextCursorInput className="h-16 w-16 text-blue-400 opacity-50" />
        ),
        isValid: name.trim().length > 0,
        content: (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="wizard-name">
                Nome da Categoria{' '}
                <span className="text-[rgb(var(--color-destructive))]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="wizard-name"
                  placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                  value={name}
                  aria-invalid={!!fieldErrors.name}
                  onChange={e => {
                    setName(e.target.value);
                    if (fieldErrors.name)
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && name.trim()) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  autoFocus
                  className="h-11"
                />
                <FormErrorIcon message={fieldErrors.name} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria Pai</Label>
              <CategoryCombobox
                categories={categories}
                value={parentId}
                onValueChange={setParentId}
                placeholder="Nenhuma (categoria raiz)"
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para criar uma categoria no nível raiz
              </p>
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Categoria'
              )}
            </Button>
          </div>
        ),
      },
    ],
    [name, parentId, isSubmitting, categories, onClose, fieldErrors]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      steps={steps}
      currentStep={1}
      onStepChange={() => {}}
      onClose={onClose}
    />
  );
}
