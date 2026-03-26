'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { paymentLinksService } from '@/services/finance';
import type { PaymentLinkDetail } from '@/types/finance';
import {
  CheckCircle,
  Copy,
  CreditCard,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CreatePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePaymentLinkModal({
  isOpen,
  onClose,
}: CreatePaymentLinkModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [enablePix, setEnablePix] = useState(true);
  const [enableBoleto, setEnableBoleto] = useState(false);

  // Result state
  const [generatedLink, setGeneratedLink] = useState<PaymentLinkDetail | null>(
    null
  );
  const [generatedUrl, setGeneratedUrl] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      paymentLinksService.create({
        amount: parseFloat(amount),
        description,
        customerName: customerName || undefined,
        expiresAt: expiresAt || undefined,
        enablePix,
        enableBoleto,
      }),
    onSuccess: result => {
      setGeneratedLink(result.paymentLink);
      setGeneratedUrl(result.url);
      setStep(2);
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
    },
    onError: (err: unknown) => {
      toast.error(translateError(err));
    },
  });

  const handleCreate = useCallback(() => {
    createMutation.mutate();
  }, [createMutation]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  }, []);

  const shareViaWhatsApp = useCallback(() => {
    const text = `Olá${customerName ? ` ${customerName}` : ''}! Segue o link para pagamento: ${generatedUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [customerName, generatedUrl]);

  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent(`Link de Pagamento - ${description}`);
    const body = encodeURIComponent(
      `Olá${customerName ? ` ${customerName}` : ''},\n\nSegue o link para pagamento no valor de R$ ${amount}:\n\n${generatedUrl}\n\nAtenciosamente`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [customerName, description, amount, generatedUrl]);

  const isStep1Valid = parseFloat(amount) > 0 && description.trim().length > 0;

  const steps: WizardStep[] = [
    {
      title: 'Dados do Pagamento',
      description: 'Informe o valor e a descrição do link',
      icon: <CreditCard className="h-10 w-10 text-violet-500" />,
      isValid: isStep1Valid,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Consultoria março/2026"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do cliente</Label>
            <Input
              id="customerName"
              placeholder="Ex: João Silva"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              maxLength={128}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Data de expiração</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="enablePix" className="cursor-pointer">
                PIX
              </Label>
              <Switch
                id="enablePix"
                checked={enablePix}
                onCheckedChange={setEnablePix}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enableBoleto" className="cursor-pointer">
                Boleto
              </Label>
              <Switch
                id="enableBoleto"
                checked={enableBoleto}
                onCheckedChange={setEnableBoleto}
              />
            </div>
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isStep1Valid || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Gerar Link
          </Button>
        </div>
      ),
    },
    {
      title: 'Link Gerado',
      description: 'Compartilhe o link de pagamento',
      icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
      content: generatedLink ? (
        <div className="space-y-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/8 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Link criado com sucesso!
            </p>
          </div>

          <div className="space-y-2">
            <Label>Link de pagamento</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={generatedUrl}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={shareViaWhatsApp}
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              WhatsApp
            </Button>
            <Button variant="outline" className="gap-2" onClick={shareViaEmail}>
              <Mail className="h-4 w-4 text-sky-600" />
              E-mail
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p>
              Valor:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(generatedLink.amount)}
            </p>
            <p>Descrição: {generatedLink.description}</p>
            {generatedLink.customerName && (
              <p>Cliente: {generatedLink.customerName}</p>
            )}
          </div>
        </div>
      ) : null,
      footer: (
        <div className="flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      ),
    },
  ];

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onClose={onClose}
    />
  );
}
