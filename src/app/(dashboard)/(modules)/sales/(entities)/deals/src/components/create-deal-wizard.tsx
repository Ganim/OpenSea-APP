'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { usePipelines } from '@/hooks/sales/use-pipelines';
import type { CreateDealRequest } from '@/types/sales';
import { Check, DollarSign, Handshake, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────

interface CreateDealWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDealRequest) => Promise<void>;
  isSubmitting?: boolean;
}

// ─── Step 1: Informacoes Basicas ──────────────────────────────

function StepBasicInfo({
  title,
  onTitleChange,
  pipelineId,
  onPipelineChange,
  stageId,
  onStageChange,
  pipelines,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  pipelineId: string;
  onPipelineChange: (v: string) => void;
  stageId: string;
  onStageChange: (v: string) => void;
  pipelines: { id: string; name: string; stages: { id: string; name: string }[] }[];
}) {
  const selectedPipeline = pipelines.find(p => p.id === pipelineId);
  const stages = selectedPipeline?.stages ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Titulo *</Label>
        <Input
          placeholder="Ex: Proposta comercial - Empresa X"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Pipeline *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={pipelineId}
          onChange={e => {
            onPipelineChange(e.target.value);
            onStageChange('');
          }}
        >
          <option value="">Selecione um pipeline</option>
          {pipelines.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Etapa *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={stageId}
          onChange={e => onStageChange(e.target.value)}
          disabled={!pipelineId}
        >
          <option value="">Selecione uma etapa</option>
          {stages.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Step 2: Valor e Detalhes ─────────────────────────────────

function StepValueAndDetails({
  value,
  onValueChange,
  expectedCloseDate,
  onExpectedCloseDateChange,
  probability,
  onProbabilityChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
  expectedCloseDate: string;
  onExpectedCloseDateChange: (v: string) => void;
  probability: string;
  onProbabilityChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Valor (R$)</Label>
        <Input
          type="number"
          placeholder="0,00"
          value={value}
          onChange={e => onValueChange(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label>Data prevista de fechamento</Label>
        <Input
          type="date"
          value={expectedCloseDate}
          onChange={e => onExpectedCloseDateChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Probabilidade (%)</Label>
        <Input
          type="number"
          placeholder="0"
          value={probability}
          onChange={e => onProbabilityChange(e.target.value)}
          min="0"
          max="100"
        />
      </div>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────

export function CreateDealWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateDealWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [value, setValue] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [probability, setProbability] = useState('');

  const { data: pipelinesData } = usePipelines({ isActive: true });
  const pipelines = useMemo(
    () => pipelinesData?.pipelines ?? [],
    [pipelinesData]
  );

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setTitle('');
    setPipelineId('');
    setStageId('');
    setValue('');
    setExpectedCloseDate('');
    setProbability('');
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    const payload: CreateDealRequest = {
      title: title.trim(),
      pipelineId,
      stageId,
      value: value ? parseFloat(value) : undefined,
      expectedCloseDate: expectedCloseDate || undefined,
      probability: probability ? parseInt(probability, 10) : undefined,
    };

    await onSubmit(payload);
    handleClose();
  }, [title, pipelineId, stageId, value, expectedCloseDate, probability, onSubmit, handleClose]);

  const steps: WizardStep[] = [
    {
      title: 'Informacoes Basicas',
      description: 'Defina o titulo, pipeline e etapa do negocio.',
      icon: <Handshake className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />,
      content: (
        <StepBasicInfo
          title={title}
          onTitleChange={setTitle}
          pipelineId={pipelineId}
          onPipelineChange={setPipelineId}
          stageId={stageId}
          onStageChange={setStageId}
          pipelines={pipelines}
        />
      ),
      isValid: title.trim().length > 0 && !!pipelineId && !!stageId,
    },
    {
      title: 'Valor e Detalhes',
      description: 'Informe o valor e detalhes complementares.',
      icon: <DollarSign className="h-16 w-16 text-sky-400" strokeWidth={1.2} />,
      onBack: () => setCurrentStep(1),
      content: (
        <StepValueAndDetails
          value={value}
          onValueChange={setValue}
          expectedCloseDate={expectedCloseDate}
          onExpectedCloseDateChange={setExpectedCloseDate}
          probability={probability}
          onProbabilityChange={setProbability}
        />
      ),
      isValid: true,
      footer: (
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Criar Negocio
        </Button>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
