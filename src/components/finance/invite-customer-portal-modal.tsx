'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { customerPortalService } from '@/services/finance';
import { CheckCircle, Copy, Link2, Loader2, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InviteCustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillCustomerId?: string;
  prefillCustomerName?: string;
}

export function InviteCustomerPortalModal({
  isOpen,
  onClose,
  prefillCustomerId,
  prefillCustomerName,
}: InviteCustomerPortalModalProps) {
  const [step, setStep] = useState(1);

  // Form state
  const [customerName, setCustomerName] = useState(prefillCustomerName ?? '');
  const [customerId, setCustomerId] = useState(prefillCustomerId ?? '');
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Result state
  const [portalUrl, setPortalUrl] = useState('');

  const inviteMutation = useMutation({
    mutationFn: () =>
      customerPortalService.invite({
        customerId,
        customerName,
        expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : undefined,
      }),
    onSuccess: data => {
      const fullUrl = `${window.location.origin}${data.portalUrl}`;
      setPortalUrl(fullUrl);
      setStep(2);
      toast.success('Convite do portal criado com sucesso!');
    },
    onError: (error: Error) => {
      const translatedMessage = translateError(error.message);
      toast.error(translatedMessage);
    },
  });

  const handleCreate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.customerName = 'Nome e obrigatorio';
    if (!customerId.trim()) errors.customerId = 'ID do cliente e obrigatorio';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    inviteMutation.mutate();
  }, [customerName, customerId, inviteMutation]);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(portalUrl);
    toast.success('URL copiada para a area de transferencia');
  }, [portalUrl]);

  const handleClose = useCallback(() => {
    setStep(1);
    setCustomerName(prefillCustomerName ?? '');
    setCustomerId(prefillCustomerId ?? '');
    setExpiresInDays('30');
    setFieldErrors({});
    setPortalUrl('');
    onClose();
  }, [onClose, prefillCustomerId, prefillCustomerName]);

  const steps: WizardStep[] = [
    {
      title: 'Dados do Cliente',
      description: 'Informe os dados do cliente para gerar o acesso ao portal',
    },
    {
      title: 'Link Gerado',
      description: 'Compartilhe o link com o cliente',
    },
  ];

  return (
    <StepWizardDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Portal do Cliente"
      description="Gere um link de acesso para o cliente visualizar e pagar faturas"
      steps={steps}
      currentStep={step}
      icon={<Link2 className="h-5 w-5" />}
      footer={
        step === 1 ? (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={inviteMutation.isPending}
              className="gap-2"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Gerar Convite
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )
      }
    >
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Nome do Cliente <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="customerName"
                placeholder="Nome completo do cliente"
                value={customerName}
                onChange={e => {
                  setCustomerName(e.target.value);
                  setFieldErrors(prev => ({ ...prev, customerName: '' }));
                }}
                className={fieldErrors.customerName ? 'border-rose-500' : ''}
              />
              {fieldErrors.customerName && (
                <FormErrorIcon message={fieldErrors.customerName} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerId">
              ID do Cliente <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="customerId"
                placeholder="Identificador do cliente (CPF, CNPJ ou codigo)"
                value={customerId}
                onChange={e => {
                  setCustomerId(e.target.value);
                  setFieldErrors(prev => ({ ...prev, customerId: '' }));
                }}
                className={fieldErrors.customerId ? 'border-rose-500' : ''}
              />
              {fieldErrors.customerId && (
                <FormErrorIcon message={fieldErrors.customerId} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresInDays">Validade do Link (dias)</Label>
            <Input
              id="expiresInDays"
              type="number"
              min="1"
              max="365"
              placeholder="30"
              value={expiresInDays}
              onChange={e => setExpiresInDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Deixe vazio para acesso sem data de expiracao.
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-medium mb-1">Convite Criado</h3>
            <p className="text-sm text-muted-foreground">
              Compartilhe o link abaixo com <strong>{customerName}</strong>
            </p>
          </div>

          <div className="space-y-3">
            <Label>URL do Portal</Label>
            <div className="flex gap-2">
              <Input readOnly value={portalUrl} className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Este link permite que o cliente visualize faturas em aberto e
                realize pagamentos. Voce pode revogar o acesso a qualquer
                momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </StepWizardDialog>
  );
}
