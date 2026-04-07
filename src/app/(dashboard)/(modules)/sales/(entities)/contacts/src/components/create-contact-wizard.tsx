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
import type { CreateContactRequest, ContactRole } from '@/types/sales';
import { CONTACT_ROLE_LABELS } from '@/types/sales';
import { Briefcase, Check, Loader2, UserCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────

interface CreateContactWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContactRequest) => Promise<void>;
  isSubmitting?: boolean;
}

// ─── Step 1: Informações Básicas ──────────────────────────────

function StepBasicInfo({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  role,
  onRoleChange,
  customerId,
  onCustomerIdChange,
  fieldErrors,
}: {
  firstName: string;
  onFirstNameChange: (v: string) => void;
  lastName: string;
  onLastNameChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  customerId: string;
  onCustomerIdChange: (v: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Nome *</Label>
          <div className="relative">
            <Input
              placeholder="Nome"
              value={firstName}
              onChange={e => onFirstNameChange(e.target.value)}
              aria-invalid={!!fieldErrors.firstName}
            />
            <FormErrorIcon message={fieldErrors.firstName} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Sobrenome</Label>
          <Input
            placeholder="Sobrenome"
            value={lastName}
            onChange={e => onLastNameChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>E-mail</Label>
        <div className="relative">
          <Input
            type="email"
            placeholder="contato@exemplo.com"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          <FormErrorIcon message={fieldErrors.email} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Telefone</Label>
        <Input
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Papel</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={role}
          onChange={e => onRoleChange(e.target.value)}
        >
          <option value="">Selecione...</option>
          {Object.entries(CONTACT_ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>ID do Cliente (opcional)</Label>
        <Input
          placeholder="UUID do cliente vinculado"
          value={customerId}
          onChange={e => onCustomerIdChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Step 2: Cargo e Redes Sociais ────────────────────────────

function StepPositionAndSocial({
  jobTitle,
  onJobTitleChange,
  department,
  onDepartmentChange,
  whatsapp,
  onWhatsappChange,
  notes,
  onNotesChange,
}: {
  jobTitle: string;
  onJobTitleChange: (v: string) => void;
  department: string;
  onDepartmentChange: (v: string) => void;
  whatsapp: string;
  onWhatsappChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cargo / Título</Label>
        <Input
          placeholder="Ex: Diretor Comercial"
          value={jobTitle}
          onChange={e => onJobTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Departamento</Label>
        <Input
          placeholder="Ex: Comercial, TI, Financeiro"
          value={department}
          onChange={e => onDepartmentChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>WhatsApp</Label>
        <Input
          placeholder="(00) 00000-0000"
          value={whatsapp}
          onChange={e => onWhatsappChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          placeholder="Notas adicionais sobre o contato..."
          rows={3}
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────

export function CreateContactWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateContactWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setRole('');
    setCustomerId('');
    setJobTitle('');
    setDepartment('');
    setWhatsapp('');
    setNotes('');
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    const payload: CreateContactRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role: (role as ContactRole) || undefined,
      customerId: customerId.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      handleClose();
    } catch (err) {
      const apiError = ApiError.from(err);
      const fieldMap: Record<string, string> = {
        'email already': 'email',
        'Contact email already': 'email',
      };
      let mapped = false;
      if (apiError.fieldErrors?.length) {
        const errors: Record<string, string> = {};
        for (const fe of apiError.fieldErrors) {
          errors[fe.field] = translateError(fe.message);
          mapped = true;
        }
        if (mapped) {
          setFieldErrors(errors);
          setCurrentStep(1);
        }
      }
      if (!mapped) {
        for (const [pattern, field] of Object.entries(fieldMap)) {
          if (apiError.message.includes(pattern)) {
            setFieldErrors({ [field]: translateError(apiError.message) });
            setCurrentStep(1);
            mapped = true;
            break;
          }
        }
      }
      if (!mapped) {
        toast.error(translateError(apiError.message));
      }
    }
  }, [
    firstName,
    lastName,
    email,
    phone,
    role,
    customerId,
    jobTitle,
    department,
    whatsapp,
    onSubmit,
    handleClose,
  ]);

  const steps: WizardStep[] = [
    {
      title: 'Informações Básicas',
      description: 'Preencha os dados principais do contato.',
      icon: (
        <UserCircle className="h-16 w-16 text-teal-400" strokeWidth={1.2} />
      ),
      content: (
        <StepBasicInfo
          firstName={firstName}
          onFirstNameChange={v => {
            setFirstName(v);
            setFieldErrors(prev => {
              const { firstName: _, ...rest } = prev;
              return rest;
            });
          }}
          lastName={lastName}
          onLastNameChange={setLastName}
          email={email}
          onEmailChange={v => {
            setEmail(v);
            setFieldErrors(prev => {
              const { email: _, ...rest } = prev;
              return rest;
            });
          }}
          phone={phone}
          onPhoneChange={setPhone}
          role={role}
          onRoleChange={setRole}
          customerId={customerId}
          onCustomerIdChange={setCustomerId}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: firstName.trim().length > 0,
    },
    {
      title: 'Cargo e Informações Adicionais',
      description: 'Informe o cargo, departamento e dados complementares.',
      icon: (
        <Briefcase className="h-16 w-16 text-violet-400" strokeWidth={1.2} />
      ),
      onBack: () => setCurrentStep(1),
      content: (
        <StepPositionAndSocial
          jobTitle={jobTitle}
          onJobTitleChange={setJobTitle}
          department={department}
          onDepartmentChange={setDepartment}
          whatsapp={whatsapp}
          onWhatsappChange={setWhatsapp}
          notes={notes}
          onNotesChange={setNotes}
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
          Criar Contato
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
