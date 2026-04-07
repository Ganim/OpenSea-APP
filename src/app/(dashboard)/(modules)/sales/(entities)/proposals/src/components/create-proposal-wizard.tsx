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
import type { CreateProposalRequest } from '@/types/sales';
import {
  Check,
  FileCheck,
  Loader2,
  Minus,
  NotebookText,
  Package,
  Plus,
  ScrollText,
  User,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ---- Types ----

interface CreateProposalWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProposalRequest) => Promise<void>;
  isSubmitting?: boolean;
}

interface ItemRow {
  description: string;
  quantity: number;
  unitPrice: number;
}

// ---- Step 1: Cliente e Informações ----

function StepBasicInfo({
  customerId,
  onCustomerIdChange,
  title,
  onTitleChange,
  validUntil,
  onValidUntilChange,
  fieldErrors,
}: {
  customerId: string;
  onCustomerIdChange: (v: string) => void;
  title: string;
  onTitleChange: (v: string) => void;
  validUntil: string;
  onValidUntilChange: (v: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cliente *</Label>
        <div className="relative">
          <Input
            placeholder="ID do cliente"
            value={customerId}
            onChange={e => onCustomerIdChange(e.target.value)}
            aria-invalid={!!fieldErrors.customerId}
          />
          <FormErrorIcon message={fieldErrors.customerId} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Título *</Label>
        <div className="relative">
          <Input
            placeholder="Título da proposta"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            aria-invalid={!!fieldErrors.title}
          />
          <FormErrorIcon message={fieldErrors.title} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Válida até</Label>
        <Input
          type="date"
          value={validUntil}
          onChange={e => onValidUntilChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ---- Step 2: Itens e Termos ----

function StepItemsAndTerms({
  items,
  onItemsChange,
  terms,
  onTermsChange,
}: {
  items: ItemRow[];
  onItemsChange: (items: ItemRow[]) => void;
  terms: string;
  onTermsChange: (v: string) => void;
}) {
  const addItem = () => {
    onItemsChange([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof ItemRow,
    value: string | number
  ) => {
    onItemsChange(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Itens</Label>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className="space-y-3 border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Item {index + 1}
              </span>
              {items.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeItem(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                placeholder="Descrição do item"
                value={item.description}
                onChange={e => updateItem(index, 'description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Qtd.</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e =>
                    updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Unit.</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitPrice}
                  onChange={e =>
                    updateItem(
                      index,
                      'unitPrice',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="h-9 px-2.5 w-full"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Adicionar Item
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Termos e Condições</Label>
        </div>
        <Textarea
          placeholder="Termos e condições da proposta..."
          rows={3}
          value={terms}
          onChange={e => onTermsChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ---- Step 3: Revisão ----

function StepReview({
  title,
  customerId,
  validUntil,
  items,
  terms,
  description,
  onDescriptionChange,
}: {
  title: string;
  customerId: string;
  validUntil: string;
  items: ItemRow[];
  terms: string;
  description: string;
  onDescriptionChange: (v: string) => void;
}) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Título</span>
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cliente</span>
          <span className="font-medium">{customerId}</span>
        </div>
        {validUntil && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Válida até</span>
            <span className="font-medium">
              {new Date(validUntil).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Itens</span>
          <span className="font-medium">{items.length}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between text-sm">
          <span className="font-semibold">Total</span>
          <span className="font-bold">{formatCurrency(total)}</span>
        </div>
        {terms && (
          <div className="border-t border-border pt-2">
            <p className="text-xs text-muted-foreground">Termos incluídos</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          placeholder="Descrição geral da proposta..."
          rows={3}
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ---- Main Wizard Component ----

export function CreateProposalWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateProposalWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<ItemRow[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setCustomerId('');
    setTitle('');
    setValidUntil('');
    setDescription('');
    setTerms('');
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    const validItems = items.filter(item => item.description.trim());
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos um item à proposta.');
      setCurrentStep(2);
      return;
    }

    const payload: CreateProposalRequest = {
      customerId: customerId.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      validUntil: validUntil || undefined,
      terms: terms.trim() || undefined,
      items: validItems.map(item => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
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
    customerId,
    title,
    description,
    validUntil,
    terms,
    items,
    onSubmit,
    handleClose,
  ]);

  const hasValidItems = useMemo(
    () => items.some(item => item.description.trim() && item.quantity > 0),
    [items]
  );

  const steps: WizardStep[] = [
    {
      title: 'Cliente e Informações',
      description: 'Selecione o cliente e informe os dados básicos.',
      icon: <User className="h-16 w-16 text-violet-400" strokeWidth={1.2} />,
      content: (
        <StepBasicInfo
          customerId={customerId}
          onCustomerIdChange={v => {
            setCustomerId(v);
            setFieldErrors(prev => {
              const { customerId: _, ...rest } = prev;
              return rest;
            });
          }}
          title={title}
          onTitleChange={v => {
            setTitle(v);
            setFieldErrors(prev => {
              const { title: _, ...rest } = prev;
              return rest;
            });
          }}
          validUntil={validUntil}
          onValidUntilChange={setValidUntil}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: customerId.trim().length > 0 && title.trim().length > 0,
    },
    {
      title: 'Itens e Termos',
      description: 'Adicione os itens e defina os termos comerciais.',
      icon: (
        <Package className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(1),
      content: (
        <StepItemsAndTerms
          items={items}
          onItemsChange={setItems}
          terms={terms}
          onTermsChange={setTerms}
        />
      ),
      isValid: hasValidItems,
    },
    {
      title: 'Revisão',
      description: 'Revise os dados e finalize a proposta.',
      icon: (
        <NotebookText className="h-16 w-16 text-sky-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(2),
      content: (
        <StepReview
          title={title}
          customerId={customerId}
          validUntil={validUntil}
          items={items}
          terms={terms}
          description={description}
          onDescriptionChange={setDescription}
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
          Criar Proposta
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
