'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';

export default function VariantViewPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id: productId, variantId } = use(params);

  // Redirect to items page on the server side
  redirect(`/stock/assets/products/${productId}/variants/${variantId}/items`);
}
