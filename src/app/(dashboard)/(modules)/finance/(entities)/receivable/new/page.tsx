'use client';

import { ReceivableWizardModal } from '@/components/finance/receivable-wizard-modal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewReceivablePage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.push('/finance/receivable');
    }
  }, [open, router]);

  return (
    <ReceivableWizardModal
      open={open}
      onOpenChange={setOpen}
      onCreated={() => {
        router.push('/finance/receivable');
      }}
    />
  );
}
