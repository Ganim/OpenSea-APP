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
  CreateMessageTemplateRequest,
  MessageChannel,
} from '@/types/sales';
import { MESSAGE_CHANNEL_LABELS } from '@/types/sales';
import { Check, Loader2, Mail, Send } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────

interface CreateMessageTemplateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMessageTemplateRequest) => Promise<void>;
  isSubmitting?: boolean;
}

// ─── Step 1: Nome e Canal ────────────────────────────────────

function StepBasicInfo({
  name,
  onNameChange,
  channel,
  onChannelChange,
  fieldErrors,
}: {
  name: string;
  onNameChange: (v: string) => void;
  channel: MessageChannel;
  onChannelChange: (v: MessageChannel) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <div className="relative">
          <Input
            placeholder="Nome do modelo"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          <FormErrorIcon message={fieldErrors.name} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Canal *</Label>
        <Select
          value={channel}
          onValueChange={v => onChannelChange(v as MessageChannel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o canal..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MESSAGE_CHANNEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Step 2: Assunto e Corpo ─────────────────────────────────

function StepContent({
  channel,
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  fieldErrors,
}: {
  channel: MessageChannel;
  subject: string;
  onSubjectChange: (v: string) => void;
  body: string;
  onBodyChange: (v: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      {(channel === 'EMAIL' || channel === 'NOTIFICATION') && (
        <div className="space-y-2">
          <Label>Assunto</Label>
          <Input
            placeholder="Assunto da mensagem"
            value={subject}
            onChange={e => onSubjectChange(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Corpo da Mensagem *</Label>
        <div className="relative">
          <Textarea
            placeholder="Escreva o corpo da mensagem... Use {{variavel}} para variáveis dinâmicas."
            rows={6}
            value={body}
            onChange={e => onBodyChange(e.target.value)}
            aria-invalid={!!fieldErrors.body}
          />
          <FormErrorIcon message={fieldErrors.body} />
        </div>
        <p className="text-xs text-muted-foreground">
          Use {`{{nome_variavel}}`} para inserir variáveis dinâmicas.
        </p>
      </div>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────

export function CreateMessageTemplateWizard({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateMessageTemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<MessageChannel>('EMAIL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setName('');
    setChannel('EMAIL');
    setSubject('');
    setBody('');
    setFieldErrors({});
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    const payload: CreateMessageTemplateRequest = {
      name: name.trim(),
      channel,
      subject: subject.trim() || undefined,
      body: body.trim(),
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
  }, [name, channel, subject, body, onSubmit, handleClose]);

  const steps: WizardStep[] = [
    {
      title: 'Nome e Canal',
      description: 'Defina o nome e o canal do modelo de mensagem.',
      icon: <Send className="h-16 w-16 text-sky-400" strokeWidth={1.2} />,
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
          channel={channel}
          onChannelChange={setChannel}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: name.trim().length > 0,
    },
    {
      title: 'Conteúdo',
      description: 'Defina o assunto e o corpo da mensagem.',
      icon: <Mail className="h-16 w-16 text-emerald-400" strokeWidth={1.2} />,
      onBack: () => setCurrentStep(1),
      content: (
        <StepContent
          channel={channel}
          subject={subject}
          onSubjectChange={setSubject}
          body={body}
          onBodyChange={v => {
            setBody(v);
            setFieldErrors(prev => {
              const { body: _, ...rest } = prev;
              return rest;
            });
          }}
          fieldErrors={fieldErrors}
        />
      ),
      isValid: body.trim().length > 0,
      footer: (
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Criar Modelo
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
