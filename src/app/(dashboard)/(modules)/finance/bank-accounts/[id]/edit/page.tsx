'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';

/**
 * Página de edição removida - a edição agora é feita pela página de detalhe.
 * Redireciona para a página de detalhe da conta bancária.
 */
export default function EditBankAccountRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  redirect(`/finance/bank-accounts/${id}`);
}
