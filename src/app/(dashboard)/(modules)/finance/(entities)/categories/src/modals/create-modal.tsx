'use client';

import { Button } from '@/components/ui/button';
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
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { FINANCE_CATEGORY_TYPE_LABELS } from '@/types/finance';
import type { FinanceCategory, FinanceCategoryType } from '@/types/finance';
import { translateError } from '@/lib/error-messages';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { toast } from 'sonner';
import { FileText, Loader2, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: FinanceCategoryType;
    description?: string;
    displayOrder?: number;
    parentId?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  nextDisplayOrder: number;
  categories?: FinanceCategory[];
  defaultType?: FinanceCategoryType;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  nextDisplayOrder,
  categories = [],
  defaultType = 'EXPENSE',
}: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<FinanceCategoryType>(defaultType);
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Sync type when modal opens with a new defaultType
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setParentId('none');
      setName('');
      setDescription('');
      setFieldErrors({});
      setCurrentStep(1);
    }
  }, [isOpen, defaultType]);

  // Only show parents of the same type (or BOTH) and max level 1
  const availableParents = useMemo(() => {
    const levelMap = new Map<string, number>();

    function computeLevel(cat: FinanceCategory): number {
      if (levelMap.has(cat.id)) return levelMap.get(cat.id)!;
      if (!cat.parentId) {
        levelMap.set(cat.id, 0);
        return 0;
      }
      const parent = categories.find(c => c.id === cat.parentId);
      if (!parent) {
        levelMap.set(cat.id, 0);
        return 0;
      }
      const parentLevel = computeLevel(parent);
      levelMap.set(cat.id, parentLevel + 1);
      return parentLevel + 1;
    }

    for (const cat of categories) {
      computeLevel(cat);
    }

    return categories
      .filter(c => {
        const catLevel = levelMap.get(c.id) ?? 0;
        if (catLevel >= 2) return false;
        // Only same type or BOTH
        return c.type === type || c.type === 'BOTH';
      })
      .map(c => ({
        ...c,
        level: levelMap.get(c.id) ?? 0,
      }));
  }, [categories, type]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await onSubmit({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        displayOrder: nextDisplayOrder,
        parentId: parentId !== 'none' ? parentId : undefined,
      });
      setName('');
      setDescription('');
      setParentId('none');
      setFieldErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists') || msg.includes('name already')) {
        setFieldErrors({ name: translateError(msg) });
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setParentId('none');
    onClose();
  };

  const typeLabel = FINANCE_CATEGORY_TYPE_LABELS[type];

  const steps: WizardStep[] = [
    {
      title: 'Identificação',
      description: 'Nome e classificação da categoria',
      icon: <Tag className="h-12 w-12 text-violet-400" />,
      isValid: name.trim().length > 0,
      content: (
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nome *</Label>
            <div className="relative">
              <Input
                id="cat-name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (fieldErrors.name)
                    setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder={`Nome da categoria de ${typeLabel.toLowerCase()}`}
                required
                autoFocus
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && <FormErrorIcon message={fieldErrors.name} />}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-parent">Categoria Pai</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="cat-parent">
                <SelectValue placeholder="Nenhuma (raiz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma (raiz)</SelectItem>
                {availableParents.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {'─'.repeat(cat.level)} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: 'Detalhes',
      description: 'Informações adicionais',
      icon: <FileText className="h-12 w-12 text-sky-400" />,
      isValid: true,
      content: (
        <div className="grid gap-4">
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
      ),
      footer: (
        <div className="flex items-center gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            ← Voltar
          </Button>
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
