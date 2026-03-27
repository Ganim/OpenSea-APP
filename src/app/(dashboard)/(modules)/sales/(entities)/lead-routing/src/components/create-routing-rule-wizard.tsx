'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { ApiError } from '@/lib/errors/api-error';
import { translateError } from '@/lib/error-messages';
import type {
  CreateLeadRoutingRuleRequest,
  LeadRoutingStrategy,
} from '@/types/sales';
import { LEAD_ROUTING_STRATEGY_LABELS } from '@/types/sales';
import {
  Check,
  Loader2,
  Shuffle,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────

interface CreateRoutingRuleWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLeadRoutingRuleRequest) => Promise<void>;
  isSubmitting?: boolean;
}

// ─── Step 1: Informações Básicas ──────────────────────────────

function StepBasicInfo({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  strategy,
  onStrategyChange,
  fieldErrors,
}: {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  strategy: LeadRoutingStrategy;
  onStrategyChange: (v: LeadRoutingStrategy) => void;
  fieldErrors: Record<string, string>;
}) {
  const strategyDescriptions: Record<LeadRoutingStrategy, string> = {
    ROUND_ROBIN: 'Distribui leads igualmente entre os vendedores, em rodízio.',
    TERRITORY: 'Direciona leads com base na região geográfica.',
    SEGMENT: 'Encaminha leads com base no segmento ou tipo de cliente.',
    LOAD_BALANCE: 'Distribui priorizando vendedores com menos leads ativos.',
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome da Regra *</Label>
        <div className="relative">
          <Input
            placeholder="Ex: Distribuição Região Sul"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          <FormErrorIcon message={fieldErrors.name} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          placeholder="Descreva o critério de roteamento..."
          rows={2}
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Estratégia *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={strategy}
          onChange={e =>
            onStrategyChange(e.target.value as LeadRoutingStrategy)
          }
        >
          {(
            Object.keys(LEAD_ROUTING_STRATEGY_LABELS) as LeadRoutingStrategy[]
          ).map(s => (
            <option key={s} value={s}>
              {LEAD_ROUTING_STRATEGY_LABELS[s]}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {strategyDescriptions[strategy]}
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Usuários ─────────────────────────────────────────

function StepUsers({
  userIdsText,
  onUserIdsTextChange,
}: {
  userIdsText: string;
  onUserIdsTextChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>IDs dos Usuários *</Label>
        <Textarea
          placeholder="Cole os IDs dos usuários, um por linha"
          rows={5}
          value={userIdsText}
          onChange={e => onUserIdsTextChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Informe os IDs dos vendedores que receberão os leads nesta regra.
          Um ID por linha.
        </p>
      </div>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────

export function CreateRoutingRuleWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateRoutingRuleWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState<LeadRoutingStrategy>('ROUND_ROBIN');
  const [userIdsText, setUserIdsText] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setName('');
    setDescription('');
    setStrategy('ROUND_ROBIN');
    setUserIdsText('');
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const userIds = useMemo(
    () =>
      userIdsText
        .split('\n')
        .map(id => id.trim())
        .filter(Boolean),
    [userIdsText]
  );

  const handleSubmit = useCallback(async () => {
    const payload: CreateLeadRoutingRuleRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      strategy,
      isActive: true,
      userIds,
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
  }, [name, description, strategy, userIds, onSubmit, handleClose]);

  const steps: WizardStep[] = [
    {
      title: 'Configuração',
      description: 'Defina o nome e a estratégia de roteamento.',
      icon: <Shuffle className="h-16 w-16 text-teal-400" strokeWidth={1.2} />,
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
          description={description}
          onDescriptionChange={setDescription}
          strategy={strategy}
          onStrategyChange={setStrategy}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: name.trim().length > 0,
    },
    {
      title: 'Usuários',
      description: 'Selecione os vendedores para esta regra.',
      icon: <Users className="h-16 w-16 text-violet-400" strokeWidth={1.2} />,
      onBack: () => setCurrentStep(1),
      content: (
        <StepUsers
          userIdsText={userIdsText}
          onUserIdsTextChange={setUserIdsText}
        />
      ),
      isValid: userIds.length > 0,
      footer: (
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Criar Regra
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

