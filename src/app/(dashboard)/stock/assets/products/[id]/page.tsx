/**
 * Product View Page
 * Página de visualização de produto usando EntityViewer genérico
 */

'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';

export default function ProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);

  // Redirect to variants page on the server side
  redirect(`/stock/assets/products/${productId}/variants`);
}
