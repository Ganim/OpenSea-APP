/**
 * Item Edit Page
 * Página de edição de item usando EntityForm genérico
 */

'use client';

import { ArrowLeft, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';

import { EntityForm, type EntityFormRef } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { itemFormConfig } from '@/config/entities/items.config';
import { useItem } from '@/hooks/stock/use-items';

export default function ItemEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const formRef = useRef<EntityFormRef>(null);

  const { id: itemId } = use(params);

  // API Data
  const { data: item, isLoading } = useItem(itemId);

  if (!item && !isLoading) {
    router.push('/stock/assets/items');
    return null;
  }

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      console.log('Salvando item:', data);
      // Items usam movimentações ao invés de updates diretos
      toast.info('Use movimentações para atualizar itens');
      router.push(`/stock/assets/items/${itemId}`);
    },
    [itemId, router]
  );

  const handleCancel = () => {
    router.push(`/stock/assets/items/${itemId}`);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const config = useMemo(
    () => ({
      ...itemFormConfig,
      defaultValues: item?.item,
      onSubmit: handleSubmit,
    }),
    [item, handleSubmit]
  );

  if (isLoading || !item) {
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Editar Item
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.item.uniqueCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      <EntityForm ref={formRef} config={config} />
    </div>
  );
}
