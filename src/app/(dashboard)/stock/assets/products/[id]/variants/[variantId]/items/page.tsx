/**
 * Variant Items List Page
 * Página de listagem de itens de uma variante específica
 */

'use client';

import { CheckCircle, Package, TrendingUp, Warehouse } from 'lucide-react';
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
import { ItemListCard } from '@/components/shared/cards/entity-cards';
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
import { useVariantItems } from '@/hooks/stock/use-items';
import { useVariant } from '@/hooks/stock/use-variants';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { Item } from '@/types/stock';

function VariantItemsContent({
  productId,
  variantId,
}: {
  productId: string;
  variantId: string;
}) {
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
  const { data: variant, isLoading: loadingVariant } = useVariant(variantId);
  const { data: itemsResponse, isLoading: loadingItems } =
    useVariantItems(variantId);

  const items = useMemo(() => {
    return itemsResponse?.items || [];
  }, [itemsResponse]);

  // Batch operations for items (if needed in the future)
  const batchDelete = useBatchOperation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_id: string) => {
      // Items don't have direct deletion - only movements
      throw new Error('Items should be managed through movements');
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
              ? 'Item processado com sucesso!'
              : `${succeeded} items processados com sucesso!`
          );
        } else {
          toast.error('Erro ao processar alguns items');
        }
        clearSelection();
      },
    }
  );

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(
      item =>
        item.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleItemClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredItems.map(item => item.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleItemDoubleClick = (id: string) => {
    router.push(
      `/stock/assets/products/${productId}/variants/${variantId}/items/${id}`
    );
  };

  const handleItemsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(
        `/stock/assets/products/${productId}/variants/${variantId}/items/${ids[0]}`
      );
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleItemsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(
        `/stock/assets/products/${productId}/variants/${variantId}/items/${ids[0]}/edit`
      );
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleItemsMovements = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(
        `/stock/assets/products/${productId}/variants/${variantId}/items/${ids[0]}/movements`
      );
    } else {
      toast.info('Movimentações múltiplas não disponível');
    }
  };

  const handleItemsDelete = (ids: string[]) => {
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
      label: 'Total de Itens',
      value: items.length,
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Itens Disponíveis',
      value: items.filter(item => item.status === 'AVAILABLE').length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Itens Reservados',
      value: items.filter(item => item.status === 'RESERVED').length,
      icon: <Warehouse className="w-5 h-5" />,
    },
    {
      label: 'Estoque Total',
      value: items.reduce((sum, item) => sum + item.currentQuantity, 0),
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  // Page Header Config
  const pageHeaderConfig: PageHeaderConfig = {
    title: `${variant?.variant.name || 'Variante'}`,
    description: 'Gerencie os itens físicos desta variante',
    showBackButton: true,
    backUrl: `/stock/assets/products/${productId}/variants/${variantId}`,
    onAdd: () =>
      router.push(
        `/stock/assets/products/${productId}/variants/${variantId}/items/new`
      ),
    addLabel: 'Novo Item',
  };

  const renderListItem = (item: Item, isSelected: boolean) => {
    // Map status to display format
    const statusMap: Record<string, string> = {
      AVAILABLE: 'available',
      RESERVED: 'reserved',
      SOLD: 'sold',
      DAMAGED: 'returned', // Using returned for damaged
      IN_TRANSIT: 'in_transit',
    };

    // Generate badges based on item properties
    const badges: Array<{
      label: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    }> = [];

    // Stock level badges
    if (item.currentQuantity <= (variant?.variant.minStock || 0)) {
      badges.push({ label: 'Estoque Baixo', variant: 'destructive' });
    } else if (item.currentQuantity >= (variant?.variant.maxStock || 999)) {
      badges.push({ label: 'Estoque Alto', variant: 'secondary' });
    }

    // Add more badges based on item attributes or business logic
    // TODO: Add champion seller, low rotation, etc. based on movement history

    return (
      <ItemListCard
        serialNumber={item.uniqueCode}
        condition={String(item.attributes?.condition || 'Novo')}
        status={statusMap[item.status] || 'available'}
        location={item.locationId} // TODO: Get location name from locationId
        quantity={item.currentQuantity}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        isSelected={isSelected}
        badges={badges}
      />
    );
  };

  if (loadingVariant || loadingItems) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando itens...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />

      <SearchSection
        searchPlaceholder="Buscar itens..."
        onSearch={handleSearch}
      />

      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredItems}
        renderGridItem={renderListItem} // Only list view for items
        renderListItem={renderListItem}
        selectedIds={selectedIds}
        onItemClick={handleItemClick}
        onItemDoubleClick={handleItemDoubleClick}
        onItemsView={handleItemsView}
        onItemsEdit={handleItemsEdit}
        onItemsStockMovement={handleItemsMovements}
        onItemsDelete={handleItemsDelete}
        emptyMessage="Nenhum item cadastrado para esta variante"
        isSearching={!!searchQuery.trim()}
        defaultView="list" // Force list view for items
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
                ? 'este item'
                : `estes ${itemsToDelete.length} itens`}
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
          itemName="item"
          onClose={() => {
            batchDelete.reset();
            setActiveOperation(null);
          }}
        />
      )}
    </div>
  );
}

export default function VariantItemsPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id: productId, variantId } = use(params);
  return (
    <SelectionProvider>
      <VariantItemsContent productId={productId} variantId={variantId} />
    </SelectionProvider>
  );
}
