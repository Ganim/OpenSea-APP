/**
 * OpenSea OS - Create Workplace Risk Wizard
 * Modal de criação rápida de risco ocupacional
 */

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { translateError } from '@/lib/error-messages';
import type {
  CreateWorkplaceRiskData,
  SafetyProgram,
  WorkplaceRiskCategory,
  WorkplaceRiskSeverity,
} from '@/types/hr';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  RISK_CATEGORY_OPTIONS,
  RISK_SEVERITY_OPTIONS,
} from '../utils/workplace-risks.utils';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programId: string, data: CreateWorkplaceRiskData) => Promise<void>;
  programs: SafetyProgram[];
  defaultProgramId?: string;
}

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  programs,
  defaultProgramId,
}: CreateModalProps) {
  const [programId, setProgramId] = useState(defaultProgramId ?? '');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkplaceRiskCategory | ''>('');
  const [severity, setSeverity] = useState<WorkplaceRiskSeverity | ''>('');
  const [source, setSource] = useState('');
  const [affectedArea, setAffectedArea] = useState('');
  const [controlMeasures, setControlMeasures] = useState('');
  const [epiRequired, setEpiRequired] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setProgramId(defaultProgramId ?? '');
      setName('');
      setCategory('');
      setSeverity('');
      setSource('');
      setAffectedArea('');
      setControlMeasures('');
      setEpiRequired('');
      setIsSubmitting(false);
      setFieldErrors({});
    }
  }, [isOpen, defaultProgramId]);

  const canSubmit = programId && name.trim() && category && severity;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const data: CreateWorkplaceRiskData = {
        name: name.trim(),
        category: category as WorkplaceRiskCategory,
        severity: severity as WorkplaceRiskSeverity,
        source: source.trim() || undefined,
        affectedArea: affectedArea.trim() || undefined,
        controlMeasures: controlMeasures.trim() || undefined,
        epiRequired: epiRequired.trim() || undefined,
      };
      await onSubmit(programId, data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('already') || msg.includes('exists')) {
        setFieldErrors(prev => ({ ...prev, name: translateError(msg) }));
      } else {
        toast.error(translateError(msg));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePrograms = programs.filter(
    p => p.status === 'ACTIVE' || p.status === 'DRAFT'
  );

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Novo Risco Ocupacional',
        description:
          'Cadastre um novo risco ocupacional vinculado a um programa de segurança.',
        icon: <AlertTriangle className="h-16 w-16 text-amber-400 opacity-50" />,
        isValid: !!canSubmit,
        content: (
          <div className="space-y-4 py-2">
            {/* Programa de Segurança */}
            <div className="space-y-2">
              <Label className="text-xs">
                Programa de Segurança <span className="text-rose-500">*</span>
              </Label>
              <Select value={programId} onValueChange={setProgramId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecionar programa..." />
                </SelectTrigger>
                <SelectContent>
                  {activePrograms.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="risk-name" className="text-xs">
                Nome do Risco <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="risk-name"
                  value={name}
                  aria-invalid={!!fieldErrors.name}
                  onChange={e => {
                    setName(e.target.value);
                    if (fieldErrors.name)
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="Ex: Ruído excessivo no setor de produção"
                  className="h-9"
                  autoFocus
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
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RISK_CATEGORY_OPTIONS.map(opt => (
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
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar severidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RISK_SEVERITY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fonte + Área Afetada */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="risk-source" className="text-xs">
                  Fonte do Risco
                </Label>
                <Input
                  id="risk-source"
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
                  value={affectedArea}
                  onChange={e => setAffectedArea(e.target.value)}
                  placeholder="Ex: Setor de produção"
                  className="h-9"
                />
              </div>
            </div>

            {/* Medidas de Controle */}
            <div className="space-y-2">
              <Label htmlFor="risk-measures" className="text-xs">
                Medidas de Controle
              </Label>
              <Textarea
                id="risk-measures"
                value={controlMeasures}
                onChange={e => setControlMeasures(e.target.value)}
                placeholder="Descreva as medidas de controle adotadas..."
                rows={2}
              />
            </div>

            {/* EPI */}
            <div className="space-y-2">
              <Label htmlFor="risk-epi" className="text-xs">
                EPI Necessário
              </Label>
              <Textarea
                id="risk-epi"
                value={epiRequired}
                onChange={e => setEpiRequired(e.target.value)}
                placeholder="Equipamentos de proteção individual necessários..."
                rows={2}
              />
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
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Risco'
              )}
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      programId,
      name,
      category,
      severity,
      source,
      affectedArea,
      controlMeasures,
      epiRequired,
      isSubmitting,
      canSubmit,
      onClose,
      fieldErrors,
      activePrograms,
    ]
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
