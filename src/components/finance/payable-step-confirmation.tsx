'use client';

import type { PayableWizardData } from './payable-wizard-modal';

interface PayableStepConfirmationProps {
  data: PayableWizardData;
  isBatch: boolean;
  onSubmit: () => void;
  isPending: boolean;
}

export function PayableStepConfirmation({
  data,
  isBatch,
  onSubmit,
  isPending,
}: PayableStepConfirmationProps) {
  void data;
  void isBatch;
  void onSubmit;
  void isPending;

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <p className="text-sm">Etapa 3 — Em breve</p>
    </div>
  );
}
