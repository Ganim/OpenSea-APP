/**
 * Edit Item Page
 * Página para editar um item existente
 */

'use client';

import { useRouter } from 'next/navigation';
import { use, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';

import { EntityForm, type EntityFormRef } from '@/components/shared';
import { itemFormConfig } from '@/config/entities/items.config';
import { useItem, useRegisterItemEntry } from '@/hooks/stock/use-items';
import { useVariant } from '@/hooks/stock/use-variants';

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string; itemId: string }>;
}) {
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);

  const { id: productId, variantId, itemId } = use(params);

  // API Data
  const { data: item } = useItem(itemId);
  const { data: variant } = useVariant(variantId);
  const registerItemEntryMutation = useRegisterItemEntry();

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        // For editing, we might need to create a new entry or update existing
        // Since items are immutable in this system, we create a new entry
        const itemData = {
          variantId,
          uniqueCode: String(data.uniqueCode || ''),
          locationId: String(data.locationId || ''),
          quantity: Number(data.quantity) || item?.item.currentQuantity || 1,
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

        toast.success('Item atualizado com sucesso!');
        router.push(
          `/stock/assets/products/${productId}/variants/${variantId}/items/${itemId}`
        );
      } catch (error) {
        console.error('Erro ao atualizar item:', error);
        toast.error('Erro ao atualizar item');
      }
    },
    [registerItemEntryMutation, variantId, item, router, productId, itemId]
  );

  const config = useMemo(
    () => ({
      ...itemFormConfig,
      onSubmit: handleSubmit,
      defaultValues: item?.item
        ? {
            uniqueCode: item.item.uniqueCode,
            locationId: item.item.locationId,
            quantity: item.item.currentQuantity,
            attributes: item.item.attributes,
            batchNumber: item.item.batchNumber,
            manufacturingDate: item.item.manufacturingDate,
            expiryDate: item.item.expiryDate,
          }
        : {},
    }),
    [handleSubmit, item]
  );

  if (!item || !variant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <EntityForm ref={formRef} config={config} />
    </div>
  );
}
