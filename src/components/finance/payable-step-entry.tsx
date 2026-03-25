'use client';

import type { PayableWizardData } from './payable-wizard-modal';

interface PayableStepEntryProps {
  data: PayableWizardData;
  onChange: (partial: Partial<PayableWizardData>) => void;
}

export function PayableStepEntry({ data, onChange }: PayableStepEntryProps) {
  void data;
  void onChange;

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <p className="text-sm">Etapa 1 — Em breve</p>
    </div>
  );
}
