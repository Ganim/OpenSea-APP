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
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { ApiError } from '@/lib/errors/api-error';
import { translateError } from '@/lib/error-messages';
import type {
  CreateWorkflowRequest,
  WorkflowTrigger,
  WorkflowStepType,
} from '@/types/sales';
import {
  WORKFLOW_TRIGGER_LABELS,
  WORKFLOW_STEP_TYPE_LABELS,
} from '@/types/sales';
import { Check, GitBranch, Loader2, Plus, X, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────

interface CreateWorkflowWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWorkflowRequest) => Promise<void>;
  isSubmitting?: boolean;
}

interface StepRow {
  order: number;
  type: WorkflowStepType;
  config: Record<string, unknown>;
}

// ─── Step 1: Nome e Gatilho ──────────────────────────────────

function StepBasicInfo({
  name,
  onNameChange,
  trigger,
  onTriggerChange,
  description,
  onDescriptionChange,
  fieldErrors,
}: {
  name: string;
  onNameChange: (v: string) => void;
  trigger: WorkflowTrigger;
  onTriggerChange: (v: WorkflowTrigger) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <div className="relative">
          <Input
            placeholder="Nome do workflow"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          <FormErrorIcon message={fieldErrors.name} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gatilho *</Label>
        <Select
          value={trigger}
          onValueChange={v => onTriggerChange(v as WorkflowTrigger)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o gatilho..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(WORKFLOW_TRIGGER_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          placeholder="Descrição do workflow..."
          rows={3}
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Step 2: Etapas ──────────────────────────────────────────

function StepConfigureSteps({
  steps,
  onAddStep,
  onRemoveStep,
  onStepTypeChange,
}: {
  steps: StepRow[];
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onStepTypeChange: (index: number, type: WorkflowStepType) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Adicione e configure as etapas que serão executadas quando o gatilho for
        acionado.
      </p>

      {steps.map((step, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white dark:bg-slate-800/40"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-bold">
            {step.order}
          </div>
          <div className="flex-1">
            <Select
              value={step.type}
              onValueChange={v =>
                onStepTypeChange(index, v as WorkflowStepType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WORKFLOW_STEP_TYPE_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveStep(index)}
            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={onAddStep}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Etapa
      </Button>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────

export function CreateWorkflowWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateWorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<WorkflowTrigger>('ORDER_CREATED');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setName('');
    setTrigger('ORDER_CREATED');
    setDescription('');
    setSteps([]);
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleAddStep = useCallback(() => {
    setSteps(prev => [
      ...prev,
      {
        order: prev.length + 1,
        type: 'SEND_EMAIL' as WorkflowStepType,
        config: {},
      },
    ]);
  }, []);

  const handleRemoveStep = useCallback((index: number) => {
    setSteps(prev =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    );
  }, []);

  const handleStepTypeChange = useCallback(
    (index: number, type: WorkflowStepType) => {
      setSteps(prev => prev.map((s, i) => (i === index ? { ...s, type } : s)));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const payload: CreateWorkflowRequest = {
      name: name.trim(),
      trigger,
      description: description.trim() || undefined,
      steps:
        steps.length > 0
          ? steps.map(s => ({
              order: s.order,
              type: s.type,
              config: s.config,
            }))
          : undefined,
    };

    try {
      await onSubmit(payload);
      handleClose();
    } catch (err) {
      const apiError = ApiError.from(err);
      if (apiError.fieldErrors?.length) {
        const errors: Record<string, string> = {};
        for (const fe of apiError.fieldErrors) {
          errors[fe.field] = translateError(fe.message);
        }
        setFieldErrors(errors);
        setCurrentStep(1);
      } else {
        toast.error(translateError(apiError.message));
      }
    }
  }, [name, trigger, description, steps, onSubmit, handleClose]);

  const wizardSteps: WizardStep[] = [
    {
      title: 'Informações Básicas',
      description: 'Defina o nome e o gatilho do workflow.',
      icon: <Zap className="h-16 w-16 text-violet-400" strokeWidth={1.2} />,
      content: (
        <StepBasicInfo
          name={name}
          onNameChange={v => {
            setName(v);
            setFieldErrors(prev => {
              const { name: _, ...rest } = prev;
              return rest;
            });
          }}
          trigger={trigger}
          onTriggerChange={setTrigger}
          description={description}
          onDescriptionChange={setDescription}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: name.trim().length > 0,
    },
    {
      title: 'Configurar Etapas',
      description: 'Adicione as ações que o workflow executará.',
      icon: (
        <GitBranch className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(1),
      content: (
        <StepConfigureSteps
          steps={steps}
          onAddStep={handleAddStep}
          onRemoveStep={handleRemoveStep}
          onStepTypeChange={handleStepTypeChange}
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
          Criar Workflow
        </Button>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={wizardSteps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
