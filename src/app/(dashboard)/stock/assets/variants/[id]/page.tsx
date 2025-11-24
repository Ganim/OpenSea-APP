/**
 * Variant View Page
 * Página de visualização de variante com lista de itens
 */

'use client';

import {
  AlertCircle,
  CheckCircle,
  Copy,
  Edit,
  Package,
  Trash2,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
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
import { useDeleteVariant, useVariant } from '@/hooks/stock/use-variants';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { Item } from '@/types/stock';

function VariantViewContent({ variantId }: { variantId: string }) {
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
  const deleteVariantMutation = useDeleteVariant();

  const items = useMemo(() => {
    return itemsResponse?.items || [];
  }, [itemsResponse]);

  // Batch operations for items (if needed in the future)
  const batchDelete = useBatchOperation(
    async (id: string) => {
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
    router.push(`/stock/assets/items/${id}`);
  };

  const handleItemsView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/items/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleItemsEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/items/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
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

  const handleVariantEdit = () => {
    router.push(`/stock/assets/variants/${variantId}/edit`);
  };

  const handleVariantDelete = async () => {
    try {
      await deleteVariantMutation.mutateAsync(variantId);
      toast.success('Variante excluída com sucesso!');
      router.push('/stock/assets/variants');
    } catch {
      toast.error('Erro ao excluir variante');
    }
  };

  const handleStockMovement = () => {
    toast.info('Funcionalidade de movimentação em desenvolvimento');
  };

  const handleCopyCode = async () => {
    if (variant?.variant.sku) {
      await navigator.clipboard.writeText(variant.variant.sku);
      toast.success('Código SKU copiado!');
    }
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
    title: variant?.variant.name || 'Variante',
    description: `SKU: ${variant?.variant.sku || ''} • Gerencie os itens desta variante`,
    showBackButton: true,
    backUrl: '/stock/assets/variants',
    customActions: [
      {
        label: 'Movimentar Estoque',
        onClick: handleStockMovement,
        variant: 'outline' as const,
        icon: <Warehouse className="w-4 h-4" />,
      },
      {
        label: 'Copiar Código',
        onClick: handleCopyCode,
        variant: 'outline' as const,
        icon: <Copy className="w-4 h-4" />,
      },
      {
        label: 'Editar',
        onClick: handleVariantEdit,
        variant: 'outline' as const,
        icon: <Edit className="w-4 h-4" />,
      },
      {
        label: 'Excluir',
        onClick: () => setIsDeleteDialogOpen(true),
        variant: 'destructive' as const,
        icon: <Trash2 className="w-4 h-4" />,
      },
    ],
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
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando variante...
          </p>
        </div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Variante não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            A variante solicitada não existe ou foi removida.
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
              Tem certeza que deseja excluir a variante &quot;
              {variant.variant.name}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVariantDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function VariantViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: variantId } = use(params);
  return (
    <SelectionProvider>
      <VariantViewContent variantId={variantId} />
    </SelectionProvider>
  );
}
