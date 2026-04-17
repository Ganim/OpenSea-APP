'use client';

import { Button } from '@/components/ui/button';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translateError } from '@/lib/error-messages';
import type {
  CreateWorkplaceRiskData,
  WorkplaceRisk,
  WorkplaceRiskCategory,
  WorkplaceRiskSeverity,
} from '@/types/hr';
import { AlertTriangle, Check, Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkplaceRiskData) => void;
  isSubmitting: boolean;
  risk?: WorkplaceRisk | null;
}

const CATEGORY_OPTIONS: { value: WorkplaceRiskCategory; label: string }[] = [
  { value: 'FISICO', label: 'Físico' },
  { value: 'QUIMICO', label: 'Químico' },
  { value: 'BIOLOGICO', label: 'Biológico' },
  { value: 'ERGONOMICO', label: 'Ergonômico' },
  { value: 'ACIDENTE', label: 'Acidente' },
];

const SEVERITY_OPTIONS: { value: WorkplaceRiskSeverity; label: string }[] = [
  { value: 'BAIXO', label: 'Baixo' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'ALTO', label: 'Alto' },
  { value: 'CRITICO', label: 'Crítico' },
];

export function RiskModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  risk,
}: RiskModalProps) {
  const isEditing = !!risk;

  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkplaceRiskCategory | ''>('');
  const [severity, setSeverity] = useState<WorkplaceRiskSeverity | ''>('');
  const [source, setSource] = useState('');
  const [affectedArea, setAffectedArea] = useState('');
  const [controlMeasures, setControlMeasures] = useState('');
  const [epiRequired, setEpiRequired] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      if (risk) {
        setName(risk.name);
        setCategory(risk.category);
        setSeverity(risk.severity);
        setSource(risk.source ?? '');
        setAffectedArea(risk.affectedArea ?? '');
        setControlMeasures(risk.controlMeasures ?? '');
        setEpiRequired(risk.epiRequired ?? '');
        setIsActive(risk.isActive);
      } else {
        setName('');
        setCategory('');
        setSeverity('');
        setSource('');
        setAffectedArea('');
        setControlMeasures('');
        setEpiRequired('');
        setIsActive(true);
        setFieldErrors({});
      }
    }
  }, [isOpen, risk]);

  const canSubmit = !!(name.trim() && category && severity);

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep(1);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const data: CreateWorkplaceRiskData = {
      name: name.trim(),
      category: category as WorkplaceRiskCategory,
      severity: severity as WorkplaceRiskSeverity,
      source: source.trim() || undefined,
      affectedArea: affectedArea.trim() || undefined,
      controlMeasures: controlMeasures.trim() || undefined,
      epiRequired: epiRequired.trim() || undefined,
      isActive,
    };

    try {
      await onSubmit(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (
        msg.includes('name already') ||
        msg.includes('already exists') ||
        msg.includes('nome')
      ) {
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
        title: isEditing ? 'Editar Risco' : 'Novo Risco Ambiental',
        description: isEditing
          ? 'Atualize as informações do risco.'
          : 'Identifique o risco ambiental do trabalho.',
        icon: (
          <AlertTriangle
            className="h-16 w-16 text-amber-400"
            strokeWidth={1.2}
          />
        ),
        isValid: canSubmit,
        content: (
          <div className="space-y-4 py-2">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="risk-name" className="text-xs">
                Nome do Risco <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="risk-name"
                  data-testid="risk-name"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (fieldErrors.name)
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="Ex: Ruído contínuo acima de 85 dB"
                  className="h-9"
                  aria-invalid={!!fieldErrors.name}
                />
                <FormErrorIcon message={fieldErrors.name} />
              </div>
            </div>

            {/* Categoria + Severidade */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label className="text-xs">
                  Categoria <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={v => setCategory(v as WorkplaceRiskCategory)}
                >
                  <SelectTrigger className="h-9" data-testid="risk-category">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs">
                  Severidade <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={severity}
                  onValueChange={v => setSeverity(v as WorkplaceRiskSeverity)}
                >
                  <SelectTrigger className="h-9" data-testid="risk-severity">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map(opt => (
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
        title: 'Contexto do Risco',
        description: 'Informe a fonte geradora e onde o risco ocorre.',
        icon: (
          <ShieldCheck className="h-16 w-16 text-sky-400" strokeWidth={1.2} />
        ),
        content: (
          <div className="space-y-4 py-2">
            {/* Fonte + Área */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="risk-source" className="text-xs">
                  Fonte Geradora
                </Label>
                <Input
                  id="risk-source"
                  data-testid="risk-source"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="Ex: Máquina de corte"
                  className="h-9"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="risk-area" className="text-xs">
                  Área Afetada
                </Label>
                <Input
                  id="risk-area"
                  data-testid="risk-area"
                  value={affectedArea}
                  onChange={e => setAffectedArea(e.target.value)}
                  placeholder="Ex: Setor de produção"
                  className="h-9"
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                data-testid="risk-active"
              />
              <Label className="text-xs">Risco ativo</Label>
            </div>
          </div>
        ),
      },
      {
        title: 'Medidas de Controle',
        description: 'Descreva as medidas preventivas e o EPI necessário.',
        icon: (
          <Check className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />
        ),
        content: (
          <div className="space-y-4 py-2">
            {/* Medidas de Controle */}
            <div className="space-y-2">
              <Label htmlFor="risk-controls" className="text-xs">
                Medidas de Controle
              </Label>
              <Textarea
                id="risk-controls"
                data-testid="risk-controls"
                value={controlMeasures}
                onChange={e => setControlMeasures(e.target.value)}
                placeholder="Descreva as medidas preventivas e corretivas..."
                rows={4}
              />
            </div>

            {/* EPI */}
            <div className="space-y-2">
              <Label htmlFor="risk-epi" className="text-xs">
                EPI Necessário
              </Label>
              <Input
                id="risk-epi"
                data-testid="risk-epi"
                value={epiRequired}
                onChange={e => setEpiRequired(e.target.value)}
                placeholder="Ex: Protetor auricular, luvas"
                className="h-9"
              />
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(2)}
              disabled={isSubmitting}
            >
              ← Voltar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              data-testid="risk-submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Adicionar Risco'}
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isEditing,
      name,
      category,
      severity,
      source,
      affectedArea,
      controlMeasures,
      epiRequired,
      isActive,
      isSubmitting,
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
