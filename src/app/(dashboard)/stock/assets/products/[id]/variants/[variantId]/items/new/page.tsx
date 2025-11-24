/**
 * Create Item Page
 * Página para criar um novo item de uma variante
 */

'use client';

import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { EntityForm } from '@/components/shared';
import { itemFormConfig } from '@/config/entities/items.config';
import { useRegisterItemEntry } from '@/hooks/stock/use-items';
import { useVariant } from '@/hooks/stock/use-variants';

export default function CreateItemPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id: productId, variantId } = use(params);

  // API Data
  const { data: variant } = useVariant(variantId);
  const registerItemEntryMutation = useRegisterItemEntry();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);

      // Prepare item entry data
      const itemData = {
        variantId,
        uniqueCode: String(data.uniqueCode || ''),
        locationId: String(data.locationId || ''),
        quantity: Number(data.initialQuantity) || 1,
        attributes: (data.attributes as Record<string, unknown>) || {},
        batchNumber: data.batchNumber ? String(data.batchNumber) : undefined,
        manufacturingDate: data.manufacturingDate
          ? new Date(String(data.manufacturingDate))
          : undefined,
        expiryDate: data.expiryDate
          ? new Date(String(data.expiryDate))
          : undefined,
        notes: data.notes ? String(data.notes) : undefined,
      };

      await registerItemEntryMutation.mutateAsync(itemData);

      toast.success('Item criado com sucesso!');
      router.push(
        `/stock/assets/products/${productId}/variants/${variantId}/items`
      );
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(
      `/stock/assets/products/${productId}/variants/${variantId}/items`
    );
  };

  if (!variant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando variante...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EntityForm
        config={{
          ...itemFormConfig,
          onSubmit: handleSubmit,
          onCancel: handleCancel,
          submitLabel: 'Criar Item',
          loading: isSubmitting,
        }}
      />
    </div>
  );
}
