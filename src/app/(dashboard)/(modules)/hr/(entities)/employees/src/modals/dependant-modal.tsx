'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Switch } from '@/components/ui/switch';
import { translateError } from '@/lib/error-messages';
import type {
  CreateDependantData,
  EmployeeDependant,
  UpdateDependantData,
} from '@/types/hr';
import { Check, Heart, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface DependantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDependantData | UpdateDependantData) => void;
  isSubmitting: boolean;
  dependant?: EmployeeDependant | null;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'SPOUSE', label: 'Cônjuge' },
  { value: 'CHILD', label: 'Filho(a)' },
  { value: 'STEPCHILD', label: 'Enteado(a)' },
  { value: 'PARENT', label: 'Pai/Mãe' },
  { value: 'OTHER', label: 'Outro' },
];

export function DependantModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  dependant,
}: DependantModalProps) {
  const isEditing = !!dependant;

  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isIrrfDependant, setIsIrrfDependant] = useState(false);
  const [isSalarioFamilia, setIsSalarioFamilia] = useState(false);
  const [hasDisability, setHasDisability] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      if (dependant) {
        setName(dependant.name);
        setCpf(dependant.cpf || '');
        setBirthDate(dependant.birthDate?.split('T')[0] || '');
        setRelationship(dependant.relationship);
        setIsIrrfDependant(dependant.isIrrfDependant);
        setIsSalarioFamilia(dependant.isSalarioFamilia);
        setHasDisability(dependant.hasDisability);
        setFieldErrors({});
      } else {
        setName('');
        setCpf('');
        setBirthDate('');
        setRelationship('');
        setIsIrrfDependant(false);
        setIsSalarioFamilia(false);
        setHasDisability(false);
        setFieldErrors({});
      }
    }
  }, [isOpen, dependant]);

  const isStep1Valid = !!(name.trim() && birthDate && relationship);
  const canSubmit = isStep1Valid;

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const data: CreateDependantData = {
      name: name.trim(),
      cpf: cpf.trim() || undefined,
      birthDate,
      relationship,
      isIrrfDependant,
      isSalarioFamilia,
      hasDisability,
    };

    try {
      await onSubmit(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('CPF') || msg.includes('cpf')) {
        setFieldErrors(prev => ({ ...prev, cpf: translateError(msg) }));
        setCurrentStep(1);
      } else if (msg.includes('name') || msg.includes('nome')) {
        setFieldErrors(prev => ({ ...prev, name: translateError(msg) }));
        setCurrentStep(1);
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: isEditing ? 'Editar Dependente' : 'Novo Dependente',
        description: isEditing
          ? 'Atualize os dados do dependente.'
          : 'Registre um novo dependente do funcionário.',
        icon: (
          <Heart
            className="h-16 w-16 text-pink-400 opacity-50"
            strokeWidth={1.2}
          />
        ),
        isValid: isStep1Valid,
        content: (
          <div className="space-y-4 py-2">
            {/* Nome + CPF */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="dep-name" className="text-xs">
                  Nome Completo <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="dep-name"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (fieldErrors.name)
                        setFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Nome completo do dependente"
                    className="h-9"
                    aria-invalid={!!fieldErrors.name}
                  />
                  <FormErrorIcon message={fieldErrors.name} />
                </div>
              </div>
              <div className="w-40 space-y-2">
                <Label htmlFor="dep-cpf" className="text-xs">
                  CPF
                </Label>
                <div className="relative">
                  <Input
                    id="dep-cpf"
                    value={cpf}
                    onChange={e => {
                      setCpf(e.target.value);
                      if (fieldErrors.cpf)
                        setFieldErrors(prev => ({ ...prev, cpf: '' }));
                    }}
                    placeholder="000.000.000-00"
                    className="h-9"
                    aria-invalid={!!fieldErrors.cpf}
                  />
                  <FormErrorIcon message={fieldErrors.cpf} />
                </div>
              </div>
            </div>

            {/* Data de Nascimento + Parentesco */}
            <div className="flex items-end gap-3">
              <div className="w-44 space-y-2">
                <Label htmlFor="dep-birthdate" className="text-xs">
                  Data de Nascimento <span className="text-rose-500">*</span>
                </Label>
                <DatePicker
                  id="dep-birthdate"
                  value={birthDate}
                  onChange={v => setBirthDate(typeof v === 'string' ? v : '')}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs">
                  Parentesco <span className="text-rose-500">*</span>
                </Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: isEditing ? 'Editar Dependente' : 'Novo Dependente',
        description: 'Fiscal e benefícios',
        icon: (
          <Heart
            className="h-16 w-16 text-pink-400 opacity-50"
            strokeWidth={1.2}
          />
        ),
        isValid: isStep1Valid,
        onBack: () => setCurrentStep(1),
        content: (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Dependente IRRF</Label>
                <p className="text-xs text-muted-foreground">
                  Incluir como dependente para dedução do Imposto de Renda
                </p>
              </div>
              <Switch
                checked={isIrrfDependant}
                onCheckedChange={setIsIrrfDependant}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Salário-Família</Label>
                <p className="text-xs text-muted-foreground">
                  Habilita o recebimento do benefício de Salário-Família
                </p>
              </div>
              <Switch
                checked={isSalarioFamilia}
                onCheckedChange={setIsSalarioFamilia}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">
                  Pessoa com Deficiência
                </Label>
                <p className="text-xs text-muted-foreground">
                  Indica se o dependente possui alguma deficiência
                </p>
              </div>
              <Switch
                checked={hasDisability}
                onCheckedChange={setHasDisability}
              />
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Adicionar Dependente'}
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isEditing,
      name,
      cpf,
      birthDate,
      relationship,
      isIrrfDependant,
      isSalarioFamilia,
      hasDisability,
      isSubmitting,
      isStep1Valid,
      canSubmit,
      fieldErrors,
    ]
  );

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
