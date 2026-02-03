'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useCreateVariant,
  useDeleteVariant,
  useProductVariants,
  useUpdateVariant,
} from '@/hooks/stock';
import { productsService, templatesService } from '@/services/stock';
import type {
  CreateVariantRequest,
  Product,
  Template,
  UpdateVariantRequest,
  Variant,
} from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { VariantForm } from './variant-form';
import { VariantList } from './variant-list';

interface VariantManagerProps {
  productId: string;
}

type ViewMode = 'list' | 'create' | 'edit';

/**
 * Gerenciador completo de variantes
 * Permite listar, criar, editar e deletar variantes
 */
export function VariantManager({ productId }: VariantManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const [deleteError, setDeleteError] = useState<string>();

  // Queries
  const { data: variantsResponse, isLoading: isLoadingVariants } =
    useProductVariants(productId);
  const variants = variantsResponse?.variants || [];

  // Debug
  useEffect(() => {
    console.log(
      '🔍 VariantManager - productId:',
      productId,
      'variants loaded:',
      variants.length,
      'isLoading:',
      isLoadingVariants
    );
  }, [productId, variants.length, isLoadingVariants]);

  const { data: product } = useQuery<Product>({
    queryKey: ['products', productId],
    queryFn: async () => {
      const response = await productsService.getProduct(productId);
      return response.product;
    },
  });

  const { data: template } = useQuery<Template>({
    queryKey: ['templates', product?.templateId],
    queryFn: async () => {
      if (!product?.templateId) throw new Error('Template ID not found');
      const response = await templatesService.getTemplate(product.templateId);
      return response.template;
    },
    enabled: !!product?.templateId,
  });

  // Mutations
  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();
  const deleteMutation = useDeleteVariant();

  const handleAdd = useCallback(() => {
    setSelectedVariant(undefined);
    setViewMode('create');
  }, []);

  const handleEdit = useCallback((variant: Variant) => {
    setSelectedVariant(variant);
    setViewMode('edit');
  }, []);

  const handleCancel = useCallback(() => {
    setViewMode('list');
    setSelectedVariant(undefined);
  }, []);

  const handleSave = useCallback(
    async (data: CreateVariantRequest | UpdateVariantRequest) => {
      try {
        setDeleteError(undefined);

        if (selectedVariant) {
          // Edit mode
          await updateMutation.mutateAsync({
            id: selectedVariant.id,
            data: data as UpdateVariantRequest,
          });
          toast.success('Variante atualizada com sucesso!');
        } else {
          // Create mode
          const createData = {
            ...(data as CreateVariantRequest),
            productId,
          };
          await createMutation.mutateAsync(createData);
          toast.success('Variante criada com sucesso!');
        }

        setViewMode('list');
        setSelectedVariant(undefined);
      } catch (error) {
        console.error('Erro ao salvar variante:', error);
        const message =
          error instanceof Error ? error.message : 'Erro ao salvar variante';
        toast.error('Erro ao salvar', { description: message });
      }
    },
    [productId, selectedVariant, createMutation, updateMutation]
  );

  const handleDelete = useCallback(
    async (variantId: string) => {
      if (
        !confirm(
          'Tem certeza que deseja excluir esta variante? Esta ação não pode ser desfeita.'
        )
      ) {
        return;
      }

      try {
        setDeleteError(undefined);
        await deleteMutation.mutateAsync({ id: variantId, productId });
        toast.success('Variante excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir variante:', error);
        const message =
          error instanceof Error ? error.message : 'Erro ao excluir variante';
        setDeleteError(message);
        toast.error('Erro ao excluir', { description: message });
      }
    },
    [deleteMutation, productId]
  );

  // Loading state
  if (isLoadingVariants) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando variantes...
          </p>
        </div>
      </Card>
    );
  }

  // List view
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {/* Header com ações */}
        <div className="flex items-center justify-between sticky top-0 py-4 z-10 border-b border-gray-200 dark:border-slate-700 -mx-6 px-6 pb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Variantes ({variants.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie todas as variantes do produto
            </p>
          </div>
          <Button size="sm" onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Variante
          </Button>
        </div>

        {/* Delete error alert */}
        {deleteError && (
          <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Erro ao excluir variante
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {deleteError}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteError(undefined)}
            >
              ✕
            </Button>
          </div>
        )}

        {/* Variants list */}
        <VariantList
          variants={variants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          isLoading={deleteMutation.isPending}
        />
      </div>
    );
  }

  // Form view
  return (
    <VariantForm
      productId={productId}
      variant={selectedVariant}
      product={product}
      template={template}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={createMutation.isPending || updateMutation.isPending}
    />
  );
}
