'use client';

import { RecurringWizard } from '@/components/finance/recurring/recurring-wizard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewRecurringPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      router.push('/finance/recurring');
    }
  };

  return (
    <RecurringWizard
      open={open}
      onOpenChange={handleOpenChange}
      onCreated={() => router.push('/finance/recurring')}
    />
  );
}
