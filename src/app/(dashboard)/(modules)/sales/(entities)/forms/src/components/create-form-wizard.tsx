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
import { Switch } from '@/components/ui/switch';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Textarea } from '@/components/ui/textarea';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { ApiError } from '@/lib/errors/api-error';
import { translateError } from '@/lib/error-messages';
import type { CreateFormRequest, FormFieldType } from '@/types/sales';
import { FORM_FIELD_TYPE_LABELS } from '@/types/sales';
import { Check, FileText, Loader2, Plus, Type, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────

interface CreateFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFormRequest) => Promise<void>;
  isSubmitting?: boolean;
}

interface FieldRow {
  label: string;
  type: FormFieldType;
  isRequired: boolean;
  order: number;
}

// ─── Step 1: Título e Descrição ──────────────────────────────

function StepBasicInfo({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  fieldErrors,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Título *</Label>
        <div className="relative">
          <Input
            placeholder="Título do formulário"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            aria-invalid={!!fieldErrors.title}
          />
          <FormErrorIcon message={fieldErrors.title} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          placeholder="Descrição do formulário..."
          rows={3}
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Step 2: Campos ──────────────────────────────────────────

function StepConfigureFields({
  fields,
  onAddField,
  onRemoveField,
  onFieldChange,
}: {
  fields: FieldRow[];
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  onFieldChange: (index: number, key: keyof FieldRow, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Adicione os campos que o formulário terá.
      </p>

      {fields.map((field, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-white dark:bg-slate-800/40"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-bold mt-1">
            {field.order}
          </div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Label do campo"
                value={field.label}
                onChange={e => onFieldChange(index, 'label', e.target.value)}
              />
              <Select
                value={field.type}
                onValueChange={v => onFieldChange(index, 'type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FORM_FIELD_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={field.isRequired}
                onCheckedChange={v => onFieldChange(index, 'isRequired', v)}
              />
              <span className="text-xs text-muted-foreground">Obrigatório</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveField(index)}
            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={onAddField}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Campo
      </Button>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────

export function CreateFormWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldRow[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setFields([]);
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleAddField = useCallback(() => {
    setFields(prev => [
      ...prev,
      {
        label: '',
        type: 'TEXT' as FormFieldType,
        isRequired: false,
        order: prev.length + 1,
      },
    ]);
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setFields(prev =>
      prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i + 1 }))
    );
  }, []);

  const handleFieldChange = useCallback(
    (index: number, key: keyof FieldRow, value: unknown) => {
      setFields(prev =>
        prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
      );
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const payload: CreateFormRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      fields:
        fields.length > 0
          ? fields.map(f => ({
              label: f.label,
              type: f.type,
              isRequired: f.isRequired,
              order: f.order,
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
  }, [title, description, fields, onSubmit, handleClose]);

  const steps: WizardStep[] = [
    {
      title: 'Informações Básicas',
      description: 'Defina o título e a descrição do formulário.',
      icon: <Type className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />,
      content: (
        <StepBasicInfo
          title={title}
          onTitleChange={v => {
            setTitle(v);
            setFieldErrors(prev => {
              const { title: _, ...rest } = prev;
              return rest;
            });
          }}
          description={description}
          onDescriptionChange={setDescription}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: title.trim().length > 0,
    },
    {
      title: 'Configurar Campos',
      description: 'Adicione os campos do formulário.',
      icon: <FileText className="h-16 w-16 text-teal-400" strokeWidth={1.2} />,
      onBack: () => setCurrentStep(1),
      content: (
        <StepConfigureFields
          fields={fields}
          onAddField={handleAddField}
          onRemoveField={handleRemoveField}
          onFieldChange={handleFieldChange}
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
          Criar Formulário
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
