/**
 * Product Variants List Page
 * Página de listagem de variantes de um produto específico
 */

'use client';

import { AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { use, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  BatchProgressDialog,
  EntityGrid,
  PageHeader,
  PageHeaderConfig,
  SearchSection,
  StatsSection,
} from '@/components/shared';
import {
  VariantGridCard,
  VariantListCard,
} from '@/components/shared/cards/entity-cards';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SelectionProvider, useSelection } from '@/contexts/selection-context';
import { useProduct } from '@/hooks/stock/use-products';
import {
  useDeleteVariant,
  useProductVariants,
} from '@/hooks/stock/use-variants';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { Variant } from '@/types/stock';

function VariantsContent({ productId }: { productId: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [activeOperation, setActiveOperation] = useState<'delete' | null>(null);

  const {
    selectedIds,
    lastSelectedId,
    selectItem,
    selectRange,
    clearSelection,
  } = useSelection();

  // API Data
  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { data: variantsResponse, isLoading: loadingVariants } =
    useProductVariants(productId);
  const deleteVariantMutation = useDeleteVariant();

  const variants = useMemo(() => {
    const allVariants = variantsResponse?.variants || [];
    // Filter variants by productId to ensure only product variants are shown
    const filteredVariants = allVariants.filter(
      variant => variant.productId === productId
    );
    return filteredVariants;
  }, [variantsResponse, productId]);

  // Batch operations
  const batchDelete = useBatchOperation(
    async (id: string) => {
      await deleteVariantMutation.mutateAsync(id);
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Variante excluída com sucesso!'
              : `${succeeded} variantes excluídas com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir algumas variantes');
        }
        clearSelection();
      },
    }
  );

  // Filtered variants
  const filteredVariants = useMemo(() => {
    if (!searchQuery.trim()) return variants;
    return variants.filter(
      v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [variants, searchQuery]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleVariantClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredVariants.map(v => v.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleVariantDoubleClick = (id: string) => {
    router.push(`/stock/assets/products/${productId}/variants/${id}`);
  };

  const handleVariantsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/products/${productId}/variants/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleVariantsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(
        `/stock/assets/products/${productId}/variants/${ids[0]}/edit`
      );
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleVariantsDelete = (ids: string[]) => {
    setItemsToDelete(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false);
    setActiveOperation('delete');
    await batchDelete.start(itemsToDelete);
  };

  // Stats
  const stats = [
    {
      label: 'Total de Variantes',
      value: variants.length,
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Preço Médio',
      value: `R$ ${variants.length > 0 ? (variants.reduce((sum, v) => sum + v.price, 0) / variants.length).toFixed(2) : '0,00'}`,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Custo Médio',
      value: `R$ ${variants.length > 0 ? (variants.reduce((sum, v) => sum + (v.costPrice || 0), 0) / variants.length).toFixed(2) : '0,00'}`,
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      label: 'Estoque Baixo',
      value: 0,
      icon: <AlertCircle className="w-5 h-5" />,
    },
  ];

  // Page Header Config
  const pageHeaderConfig: PageHeaderConfig = {
    title: `Variantes de ${product?.product.name || 'Produto'}`,
    description: 'Gerencie as variantes deste produto',
    showBackButton: true,
    backUrl: `/stock/assets/products/${productId}`,
    onAdd: () =>
      router.push(`/stock/assets/products/${productId}/variants/new`),
    addLabel: 'Nova Variante',
  };

  const renderGridItem = (variant: Variant, isSelected: boolean) => (
    <VariantGridCard
      name={variant.name}
      sku={variant.sku}
      options={Object.keys(variant.attributes)}
      createdAt={variant.createdAt}
      updatedAt={variant.updatedAt}
      isSelected={isSelected}
    />
  );

  const renderListItem = (variant: Variant, isSelected: boolean) => (
    <VariantListCard
      name={variant.name}
      sku={variant.sku}
      options={Object.keys(variant.attributes)}
      createdAt={variant.createdAt}
      updatedAt={variant.updatedAt}
      isSelected={isSelected}
    />
  );

  if (loadingProduct || loadingVariants) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando variantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />

      <SearchSection
        searchPlaceholder="Buscar variantes..."
        onSearch={handleSearch}
      />

      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredVariants}
        renderGridItem={renderGridItem}
        renderListItem={renderListItem}
        selectedIds={selectedIds}
        onItemClick={handleVariantClick}
        onItemDoubleClick={handleVariantDoubleClick}
        onItemsView={handleVariantsView}
        onItemsEdit={handleVariantsEdit}
        onItemsDelete={handleVariantsDelete}
        emptyMessage="Nenhuma variante cadastrada"
        isSearching={!!searchQuery.trim()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{' '}
              {itemsToDelete.length === 1
                ? 'esta variante'
                : `estas ${itemsToDelete.length} variantes`}
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Progress Dialog */}
      {activeOperation === 'delete' && (
        <BatchProgressDialog
          open={batchDelete.isRunning}
          status={batchDelete.status}
          total={batchDelete.total}
          processed={batchDelete.processed}
          succeeded={batchDelete.succeeded}
          failed={batchDelete.failed}
          progress={batchDelete.progress}
          operationType="delete"
          itemName="variante"
          onClose={() => {
            batchDelete.reset();
            setActiveOperation(null);
          }}
        />
      )}
    </div>
  );
}

export default function ProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  return (
    <SelectionProvider>
      <VariantsContent productId={productId} />
    </SelectionProvider>
  );
}
