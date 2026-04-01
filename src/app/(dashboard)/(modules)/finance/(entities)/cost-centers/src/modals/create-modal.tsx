'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateCostCenterData } from '@/types/finance';
import { translateError } from '@/lib/error-messages';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { toast } from 'sonner';
import { DollarSign, Landmark, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';

interface CreateCostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCostCenterData) => void;
  isSubmitting: boolean;
  nextCode: string;
}

export function CreateCostCenterModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  nextCode,
}: CreateCostCenterModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [annualBudget, setAnnualBudget] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setIsActive(true);
      setMonthlyBudget('');
      setAnnualBudget('');
      setFieldErrors({});
      setCurrentStep(1);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const data: CreateCostCenterData = {
      code: nextCode,
      name: name.trim(),
      isActive,
    };

    if (description.trim()) {
      data.description = description.trim();
    }

    const monthly = parseFloat(monthlyBudget);
    if (!isNaN(monthly) && monthly > 0) {
      data.monthlyBudget = monthly;
    }

    const annual = parseFloat(annualBudget);
    if (!isNaN(annual) && annual > 0) {
      data.annualBudget = annual;
    }

    try {
      await onSubmit(data);
      setFieldErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('already exists') ||
        msg.includes('name already') ||
        msg.includes('code already')
      ) {
        const field = msg.includes('code') ? 'code' : 'name';
        setFieldErrors({ [field]: translateError(msg) });
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const steps: WizardStep[] = [
    {
      title: 'Identificação',
      description: 'Dados básicos do centro de custo',
      icon: <Landmark className="h-12 w-12 text-teal-400" />,
      isValid: name.trim().length > 0,
      content: (
        <div className="space-y-4">
          {/* Código (auto-gerado, somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="cc-code">{'C\u00F3digo'}</Label>
            <Input
              id="cc-code"
              value={nextCode}
              readOnly
              disabled
              className="font-mono bg-muted"
            />
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="cc-name">Nome *</Label>
            <div className="relative">
              <Input
                id="cc-name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (fieldErrors.name)
                    setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Ex.: Departamento Comercial"
                required
                autoFocus
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && <FormErrorIcon message={fieldErrors.name} />}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="cc-description">{'Descri\u00E7\u00E3o'}</Label>
            <Textarea
              id="cc-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={'Descri\u00E7\u00E3o opcional do centro de custo'}
              rows={3}
            />
          </div>

          {/* Switch Ativo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="cc-active" className="cursor-pointer">
              Ativo
            </Label>
            <Switch
              id="cc-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Orçamento',
      description: 'Definição de limites orçamentários',
      icon: <DollarSign className="h-12 w-12 text-emerald-400" />,
      isValid: true,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cc-monthly">{'Or\u00E7amento Mensal (R$)'}</Label>
            <Input
              id="cc-monthly"
              type="number"
              step="0.01"
              min="0"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-annual">{'Or\u00E7amento Anual (R$)'}</Label>
            <Input
              id="cc-annual"
              type="number"
              step="0.01"
              min="0"
              value={annualBudget}
              onChange={e => setAnnualBudget(e.target.value)}
              placeholder="0,00"
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
