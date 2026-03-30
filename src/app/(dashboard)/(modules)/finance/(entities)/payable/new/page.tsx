'use client';

import { PayableWizardModal } from '@/components/finance/payable-wizard-modal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPayablePage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      router.push('/finance/payable');
    }
  };

  return (
    <PayableWizardModal
      open={open}
      onOpenChange={handleOpenChange}
      onCreated={() => router.push('/finance/payable')}
    />
  );
}
