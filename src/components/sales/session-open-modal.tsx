/**
 * Session Open Modal
 * Modal para abertura de caixa com numpad para fundo de troco
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  NavigationWizardDialog,
  type NavigationSection,
} from '@/components/ui/navigation-wizard-dialog';
import { formatCurrency } from '@/lib/utils';
import { Numpad } from '@/components/ui/numpad';
import { DollarSign } from 'lucide-react';
import { useState } from 'react';

interface SessionOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (openingBalance: number) => void;
  isPending?: boolean;
}

export function SessionOpenModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: SessionOpenModalProps) {
  const [amount, setAmount] = useState(0);

  const sections: NavigationSection[] = [
    {
      id: 'opening',
      label: 'Abertura de Caixa',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Informe o valor do fundo de troco',
    },
  ];

  function handleConfirm() {
    onConfirm(amount);
  }

  function handleClose() {
    setAmount(0);
    onClose();
  }

  return (
    <NavigationWizardDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
      title="Abertura de Caixa"
      subtitle="Configure o caixa para iniciar as vendas"
      sections={sections}
      activeSection="opening"
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
            disabled={isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isPending ? 'Abrindo...' : 'Abrir Caixa'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* Display do valor */}
        <div className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 p-6 text-center">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Fundo de Troco
          </p>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {formatCurrency(amount / 100)}
          </p>
        </div>

        {/* Numpad */}
        <Numpad value={amount} onChange={setAmount} />
      </div>
    </NavigationWizardDialog>
  );
}
