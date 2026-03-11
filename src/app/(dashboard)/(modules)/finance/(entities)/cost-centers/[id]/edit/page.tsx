/**
 * @deprecated This page is no longer used.
 * Cost center editing is handled via the detail page.
 * This file redirects to the detail page for backwards compatibility.
 */

'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';

export default function EditCostCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  redirect(`/finance/cost-centers/${id}`);
}
