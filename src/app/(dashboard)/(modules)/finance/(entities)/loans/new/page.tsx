'use client';

import { CreateLoanWizard } from '../src/components/create-loan-wizard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewLoanPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      router.push('/finance/loans');
    }
  };

  return (
    <CreateLoanWizard
      open={open}
      onOpenChange={handleOpenChange}
      onCreated={() => router.push('/finance/loans')}
    />
  );
}
