'use client';

import { CreateConsortiumWizard } from '../src/components/create-consortium-wizard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewConsortiumPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      router.push('/finance/consortia');
    }
  };

  return (
    <CreateConsortiumWizard
      open={open}
      onOpenChange={handleOpenChange}
      onCreated={() => router.push('/finance/consortia')}
    />
  );
}
