/**
 * Cash Movement Modal
 * Modal para sangria ou suprimento de caixa
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NavigationWizardDialog,
  type NavigationSection,
} from '@/components/ui/navigation-wizard-dialog';
import { formatCurrency } from '@/lib/utils';
import { Numpad } from '@/components/ui/numpad';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useState } from 'react';

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'WITHDRAWAL' | 'SUPPLY';
  onConfirm: (data: { amount: number; reason: string }) => void;
  isPending?: boolean;
}

const CONFIG = {
  WITHDRAWAL: {
    title: 'Sangria',
    subtitle: 'Retirada de valores do caixa',
    icon: <ArrowUpCircle className="w-4 h-4" />,
    confirmLabel: 'Registrar Sangria',
    pendingLabel: 'Registrando...',
  },
  SUPPLY: {
    title: 'Suprimento',
    subtitle: 'Entrada de valores no caixa',
    icon: <ArrowDownCircle className="w-4 h-4" />,
    confirmLabel: 'Registrar Suprimento',
    pendingLabel: 'Registrando...',
  },
} as const;

export function CashMovementModal({
  isOpen,
  onClose,
  type,
  onConfirm,
  isPending,
}: CashMovementModalProps) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  const config = CONFIG[type];

  const sections: NavigationSection[] = [
    {
      id: 'movement',
      label: config.title,
      icon: config.icon,
      description: config.subtitle,
    },
  ];

  function handleConfirm() {
    onConfirm({ amount: amount / 100, reason });
  }

  function handleClose() {
    setAmount(0);
    setReason('');
    onClose();
  }

  return (
    <NavigationWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
      title={config.title}
      subtitle={config.subtitle}
      sections={sections}
      activeSection="movement"
      onSectionChange={() => {}}
      variant="compact"
      isPending={isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || amount <= 0 || !reason.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isPending ? config.pendingLabel : config.confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Display do valor */}
        <div className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 p-6 text-center">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Valor
          </p>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {formatCurrency(amount / 100)}
          </p>
        </div>

        {/* Numpad */}
        <div className="flex justify-center">
          <Numpad value={amount} onChange={setAmount} />
        </div>

        {/* Motivo */}
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo</Label>
          <Input
            id="reason"
            placeholder={
              type === 'WITHDRAWAL'
                ? 'Ex.: Pagamento de fornecedor'
                : 'Ex.: Reforço de troco'
            }
            value={reason}
            onChange={e => setReason(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>
    </NavigationWizardDialog>
  );
}
