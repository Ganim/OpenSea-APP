/**
 * Invite Accountant Wizard — StepWizardDialog de 2 etapas
 * Passo 1: Dados do contador (nome, e-mail, CPF/CNPJ, CRC)
 * Passo 2: Confirmação + link gerado + botão de copiar
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { useInviteAccountant } from '@/hooks/finance/use-accountant';
import { translateError } from '@/lib/error-messages';
import {
  Calculator,
  Check,
  Copy,
  Link2,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface InviteAccountantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  cpfCnpj: string;
  crc: string;
}

// =============================================================================
// STEP 1: FORM
// =============================================================================

function StepForm({
  form,
  onChange,
  fieldErrors = {},
}: {
  form: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="acc-name">Nome do Contador *</Label>
        <div className="relative">
          <Input
            id="acc-name"
            placeholder="Nome completo"
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          <FormErrorIcon message={fieldErrors.name} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acc-email">E-mail *</Label>
        <div className="relative">
          <Input
            id="acc-email"
            type="email"
            placeholder="contador@exemplo.com"
            value={form.email}
            onChange={e => onChange('email', e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          <FormErrorIcon message={fieldErrors.email} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acc-cpf">CPF/CNPJ</Label>
        <Input
          id="acc-cpf"
          placeholder="000.000.000-00"
          value={form.cpfCnpj}
          onChange={e => onChange('cpfCnpj', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acc-crc">Registro CRC</Label>
        <Input
          id="acc-crc"
          placeholder="CRC-UF-000000"
          value={form.crc}
          onChange={e => onChange('crc', e.target.value)}
        />
      </div>
    </div>
  );
}

// =============================================================================
// STEP 2: CONFIRMATION
// =============================================================================

function StepConfirmation({
  form,
  portalUrl,
  isLoading,
  isSuccess,
  onSubmit,
}: {
  form: FormData;
  portalUrl: string;
  isLoading: boolean;
  isSuccess: boolean;
  onSubmit: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${portalUrl}`
      : portalUrl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Link copiado para a área de transferência');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Check className="h-5 w-5" />
          <span className="font-medium">Convite enviado com sucesso!</span>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Link de acesso ao portal do contador:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted p-2 rounded break-all">
              {fullUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Compartilhe este link com o contador. Ele terá acesso de leitura aos
          dados financeiros da empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Confirme os dados abaixo para gerar o convite:
      </p>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Nome:</span>
          <span className="font-medium">{form.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">E-mail:</span>
          <span className="font-medium">{form.email}</span>
        </div>
        {form.cpfCnpj && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CPF/CNPJ:</span>
            <span className="font-medium">{form.cpfCnpj}</span>
          </div>
        )}
        {form.crc && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CRC:</span>
            <span className="font-medium">{form.crc}</span>
          </div>
        )}
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando convite...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Enviar Convite
          </>
        )}
      </Button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InviteAccountantModal({
  open,
  onOpenChange,
}: InviteAccountantModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    cpfCnpj: '',
    crc: '',
  });
  const [portalUrl, setPortalUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inviteMutation = useInviteAccountant();

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    try {
      const result = await inviteMutation.mutateAsync({
        email: form.email,
        name: form.name,
        cpfCnpj: form.cpfCnpj || undefined,
        crc: form.crc || undefined,
      });

      setPortalUrl(result.portalUrl);
      toast.success('Convite de contador criado com sucesso');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('email') || msg.includes('Email')) {
        setFieldErrors({ email: translateError(msg) });
        setStep(1);
      } else if (msg.includes('name') || msg.includes('Name')) {
        setFieldErrors({ name: translateError(msg) });
        setStep(1);
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setForm({ name: '', email: '', cpfCnpj: '', crc: '' });
      setPortalUrl('');
      inviteMutation.reset();
    }, 200);
  };

  const step1Valid = form.name.length >= 2 && form.email.includes('@');

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Dados do Contador',
        description: 'Informe os dados do contador que receberá acesso',
        icon: (
          <Calculator className="h-12 w-12 text-teal-500 dark:text-teal-400" />
        ),
        content: (
          <StepForm
            form={form}
            onChange={handleChange}
            fieldErrors={fieldErrors}
          />
        ),
        isValid: step1Valid,
      },
      {
        title: 'Confirmação',
        description: 'Revise e confirme o convite',
        icon: <Link2 className="h-12 w-12 text-teal-500 dark:text-teal-400" />,
        content: (
          <StepConfirmation
            form={form}
            portalUrl={portalUrl}
            isLoading={inviteMutation.isPending}
            isSuccess={inviteMutation.isSuccess}
            onSubmit={handleSubmit}
          />
        ),
        isValid: true,
        footer: inviteMutation.isSuccess ? (
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        ) : (
          <></>
        ),
        onBack: inviteMutation.isSuccess ? undefined : () => setStep(1),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      form,
      step1Valid,
      portalUrl,
      inviteMutation.isPending,
      inviteMutation.isSuccess,
      fieldErrors,
    ]
  );

  return (
    <StepWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onClose={handleClose}
    />
  );
}
