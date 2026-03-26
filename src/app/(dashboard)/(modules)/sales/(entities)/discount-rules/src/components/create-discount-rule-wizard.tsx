'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { ApiError } from '@/lib/errors/api-error';
import { translateError } from '@/lib/error-messages';
import type { CreateDiscountRuleRequest, DiscountType } from '@/types/sales';
import {
  Check,
  DollarSign,
  Loader2,
  Percent,
  Settings,
  ShoppingCart,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ---- Types ----

interface CreateDiscountRuleWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDiscountRuleRequest) => Promise<void>;
  isSubmitting?: boolean;
}

// ---- Step 1: Nome, Tipo e Valor ----

function StepBasicInfo({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  type,
  onTypeChange,
  value,
  onValueChange,
  fieldErrors,
}: {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  type: DiscountType;
  onTypeChange: (v: DiscountType) => void;
  value: number;
  onValueChange: (v: number) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <div className="relative">
          <Input
            placeholder="Nome da regra de desconto"
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
          placeholder="Descrição da regra..."
          rows={2}
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de Desconto *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={type}
          onChange={e => onTypeChange(e.target.value as DiscountType)}
        >
          <option value="PERCENTAGE">Percentual (%)</option>
          <option value="FIXED_AMOUNT">Valor Fixo (R$)</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Valor *</Label>
        <div className="relative">
          <Input
            type="number"
            min={0}
            step={type === 'PERCENTAGE' ? '1' : '0.01'}
            placeholder={type === 'PERCENTAGE' ? '10' : '50.00'}
            value={value || ''}
            onChange={e => onValueChange(parseFloat(e.target.value) || 0)}
            aria-invalid={!!fieldErrors.value}
          />
          <FormErrorIcon message={fieldErrors.value} />
        </div>
      </div>
    </div>
  );
}

// ---- Step 2: Condições ----

function StepConditions({
  minOrderValue,
  onMinOrderValueChange,
  minQuantity,
  onMinQuantityChange,
  categoryId,
  onCategoryIdChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  isStackable,
  onIsStackableChange,
}: {
  minOrderValue: string;
  onMinOrderValueChange: (v: string) => void;
  minQuantity: string;
  onMinQuantityChange: (v: string) => void;
  categoryId: string;
  onCategoryIdChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  isStackable: boolean;
  onIsStackableChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Data Início *</Label>
          <Input
            type="date"
            value={startDate}
            onChange={e => onStartDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Data Fim *</Label>
          <Input
            type="date"
            value={endDate}
            onChange={e => onEndDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Valor Mínimo do Pedido</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={minOrderValue}
            onChange={e => onMinOrderValueChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Quantidade Mínima</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={minQuantity}
            onChange={e => onMinQuantityChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoria (ID)</Label>
        <Input
          placeholder="ID da categoria (opcional)"
          value={categoryId}
          onChange={e => onCategoryIdChange(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Acumulável</Label>
          <p className="text-xs text-muted-foreground">
            Permitir acúmulo com outras regras
          </p>
        </div>
        <Switch checked={isStackable} onCheckedChange={onIsStackableChange} />
      </div>
    </div>
  );
}

// ---- Main Wizard Component ----

export function CreateDiscountRuleWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateDiscountRuleWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DiscountType>('PERCENTAGE');
  const [value, setValue] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isStackable, setIsStackable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setName('');
    setDescription('');
    setType('PERCENTAGE');
    setValue(0);
    setMinOrderValue('');
    setMinQuantity('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
    setIsStackable(false);
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error('Datas de início e fim são obrigatórias.');
      setCurrentStep(2);
      return;
    }

    const payload: CreateDiscountRuleRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      value,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : undefined,
      minQuantity: minQuantity ? parseInt(minQuantity) : undefined,
      categoryId: categoryId.trim() || undefined,
      startDate,
      endDate,
      isStackable,
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
  }, [
    name,
    description,
    type,
    value,
    minOrderValue,
    minQuantity,
    categoryId,
    startDate,
    endDate,
    isStackable,
    onSubmit,
    handleClose,
  ]);

  const steps: WizardStep[] = [
    {
      title: 'Nome e Valor',
      description: 'Defina o nome, tipo e valor do desconto.',
      icon: (
        <Percent className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />
      ),
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
          type={type}
          onTypeChange={setType}
          value={value}
          onValueChange={v => {
            setValue(v);
            setFieldErrors(prev => {
              const { value: _, ...rest } = prev;
              return rest;
            });
          }}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: name.trim().length > 0 && value > 0,
    },
    {
      title: 'Condições',
      description: 'Configure período, limites e regras de acúmulo.',
      icon: (
        <Settings className="h-16 w-16 text-sky-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(1),
      content: (
        <StepConditions
          minOrderValue={minOrderValue}
          onMinOrderValueChange={setMinOrderValue}
          minQuantity={minQuantity}
          onMinQuantityChange={setMinQuantity}
          categoryId={categoryId}
          onCategoryIdChange={setCategoryId}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          isStackable={isStackable}
          onIsStackableChange={setIsStackable}
        />
      ),
      isValid: !!startDate && !!endDate,
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
