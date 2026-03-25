'use client';

import type { PayableWizardData } from './payable-wizard-modal';

interface PayableStepDetailsProps {
  data: PayableWizardData;
  onChange: (partial: Partial<PayableWizardData>) => void;
}

export function PayableStepDetails({ data, onChange }: PayableStepDetailsProps) {
  void data;
  void onChange;

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <p className="text-sm">Etapa 2 — Em breve</p>
    </div>
  );
}
