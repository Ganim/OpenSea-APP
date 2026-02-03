/**
 * OpenSea OS - Products Page
 * Página de gerenciamento de produtos usando o novo sistema OpenSea OS
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import type { HeaderButton } from '@/components/layout/types/header.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { productsConfig } from '@/config/entities/products.config';
import {
  ConfirmDialog,
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import ItemCard from '@/core/components/item-card';
import { formatUnitOfMeasure } from '@/helpers/formatters';
import { productsService } from '@/services/stock';
import type { Item, Product } from '@/types/stock';
import { ChevronRight, Grid3x3, Package, Plus, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateProductForm, EditProductForm } from './src/components';
import { ProductVariantsItemsModal } from './src/modals';
import type { ProductFormData } from './src/types';

export default function ProductsPage() {
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Product>({
    entityName: 'Produto',
    entityNamePlural: 'Produtos',
    queryKey: ['products'],
    baseUrl: '/api/v1/products',
    listFn: async () => {
      const response = await productsService.listProducts();
      return response.products;
    },
    getFn: (id: string) => productsService.getProduct(id).then(r => r.product),
    createFn: data =>
      productsService
        .createProduct(data as ProductFormData)
        .then(r => r.product),
    updateFn: (id, data) =>
      productsService.updateProduct(id, data as any).then(r => r.product),
    deleteFn: id => productsService.deleteProduct(id),
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Product>({
    entityName: 'Produto',
    entityNamePlural: 'Produtos',
    queryKey: ['products'],
    crud,
    viewRoute: id => `/stock/products/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.fullCode?.toLowerCase().includes(q) ?? false) ||
        (item.description?.toLowerCase().includes(q) ?? false)
      );
    },
  });

  // ============================================================================
  // DEBUG - Verificar dados da API
  // ============================================================================

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      page.filteredItems?.length > 0
    ) {
      const firstProduct = page.filteredItems[0];
      console.log('🔍 DEBUG - Primeiro produto:', {
        name: firstProduct.name,
        templateId: firstProduct.templateId,
        template: firstProduct.template,
        manufacturer: firstProduct.manufacturer,
      });
    }
  }, [page.filteredItems]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  }, []);

  const handleMoveItem = useCallback((item: Item) => {
    // TODO: Implement item movement modal
    console.log('Move item:', item);
  }, []);

  // Context menu handlers
  const handleContextView = (ids: string[]) => {
    page.handlers.handleItemsView(ids);
  };

  const handleContextEdit = (ids: string[]) => {
    page.handlers.handleItemsEdit(ids);
  };

  const handleContextDuplicate = (ids: string[]) => {
    page.handlers.handleItemsDuplicate(ids);
  };

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.open('delete');
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Product, isSelected: boolean) => {
    // Dados agora vêm expandidos do backend
    // Mas template pode vir como undefined, então usar fallback seguro
    const templateName = item.template?.name || 'Template';
    const unitOfMeasure = formatUnitOfMeasure(
      item.template?.unitOfMeasure || 'UNITS'
    );
    const manufacturerName = item.manufacturer?.name;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <ItemCard
          id={item.id}
          variant="grid"
          title={item.name}
          subtitle={manufacturerName || 'Fabricante não informado'}
          icon={Package}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          badges={[
            {
              label: templateName,
              variant: 'default' as const,
            },
            {
              label: unitOfMeasure,
              variant: 'default' as const,
            },
            ...(item.outOfLine
              ? [
                  {
                    label: 'Fora de Linha',
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            ...(item.status !== 'ACTIVE'
              ? [
                  {
                    label: item.status === 'INACTIVE' ? 'Inativo' : 'Arquivado',
                    variant: 'secondary' as const,
                  },
                ]
              : []),
          ]}
          footer={
            <button
              onClick={() => handleProductClick(item)}
              className="w-full flex items-center justify-between px-3 py-4 text-xs font-medium text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded-b-xl transition-colors cursor-pointer bg-emerald-600 hover:bg-emerald-700"
            >
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                <span>
                  {item.variants?.length
                    ? `${item.variants.length} variantes`
                    : 'Ver variantes'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
          showStatusBadges={true}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: Product, isSelected: boolean) => {
    // Dados agora vêm expandidos do backend
    // Mas template pode vir como undefined, então usar fallback seguro
    const templateName = item.template?.name || 'Template';
    const unitOfMeasure = formatUnitOfMeasure(
      item.template?.unitOfMeasure || 'UNITS'
    );
    const manufacturerName = item.manufacturer?.name;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="list"
          title={item.name}
          subtitle={manufacturerName || item.fullCode}
          icon={Package}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          badges={[
            {
              label: templateName,
              variant: 'default' as const,
            },
            {
              label: unitOfMeasure,
              variant: 'default' as const,
            },
            ...(item.outOfLine
              ? [
                  {
                    label: 'Fora de Linha',
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            ...(item.status !== 'ACTIVE'
              ? [
                  {
                    label: item.status === 'INACTIVE' ? 'Inativo' : 'Arquivado',
                    variant: 'secondary' as const,
                  },
                ]
              : []),
          ]}
          metadata={
            <>
              {item.description && (
                <span className="text-xs truncate">{item.description}</span>
              )}
            </>
          }
          footer={
            <button
              onClick={() => handleProductClick(item)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                <span>
                  {item.variants?.length
                    ? `${item.variants.length} variantes`
                    : 'Ver variantes'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
          showStatusBadges={true}
        />
      </EntityContextMenu>
    );
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedIds = useMemo(
    () => Array.from(page.selection?.state.selectedIds || []),
    [page.selection?.state.selectedIds]
  );

  const hasSelection = selectedIds.length > 0;

  // Memoize initialIds para evitar recálculos desnecessários
  const initialIds = useMemo(
    () =>
      (Array.isArray(page.filteredItems) ? page.filteredItems : []).map(
        i => i.id
      ),
    [page.filteredItems]
  );

  const headerButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'import-products',
        title: 'Importar',
        icon: Upload,
        onClick: () => router.push('/import/stock/products/home'),
        variant: 'outline',
      },
      {
        id: 'create-product',
        title: 'Novo Produto',
        icon: Plus,
        onClick: () => page.modals.open('create'),
        variant: 'default',
      },
    ],
    [page.modals, router]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'products',
        initialIds,
      }}
    >
      <PageLayout backgroundVariant="none" maxWidth="full" spacing="gap-8">
        <Header
          title="Produtos"
          description="Gerencie o catálogo de produtos"
          buttons={headerButtons}
        />

        <SearchBar
          placeholder={productsConfig.display.labels.searchPlaceholder}
          value={page.searchQuery}
          onSearch={value => page.handlers.handleSearch(value)}
          showClear={true}
          size="md"
        />

        {/* Grid */}
        {page.isLoading ? (
          <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
        ) : page.error ? (
          <GridError
            type="server"
            title="Erro ao carregar produtos"
            message="Ocorreu um erro ao tentar carregar os produtos. Por favor, tente novamente."
            action={{
              label: 'Tentar Novamente',
              onClick: () => crud.refetch(),
            }}
          />
        ) : (
          <EntityGrid
            config={productsConfig}
            items={page.filteredItems}
            renderGridItem={renderGridCard}
            renderListItem={renderListCard}
            isLoading={page.isLoading}
            isSearching={!!page.searchQuery}
            onItemClick={(item, e) => page.handlers.handleItemClick(item, e)}
            onItemDoubleClick={item =>
              page.handlers.handleItemDoubleClick(item)
            }
            showSorting={true}
            defaultSortField="name"
            defaultSortDirection="asc"
          />
        )}

        {/* Selection Toolbar */}
        {hasSelection && (
          <SelectionToolbar
            selectedIds={selectedIds}
            totalItems={page.filteredItems.length}
            onClear={() => page.selection?.actions.clear()}
            onSelectAll={() => page.selection?.actions.selectAll()}
            defaultActions={{
              view: true,
              edit: true,
              duplicate: true,
              delete: true,
            }}
            handlers={{
              onView: page.handlers.handleItemsView,
              onEdit: page.handlers.handleItemsEdit,
              onDuplicate: page.handlers.handleItemsDuplicate,
              onDelete: page.handlers.handleItemsDelete,
            }}
          />
        )}

        {/* Create Modal */}
        <Dialog
          open={page.modals.isOpen('create')}
          onOpenChange={open => !open && page.modals.close('create')}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <CreateProductForm
              onSubmit={async data => {
                await crud.create(data);
              }}
              onCancel={() => page.modals.close('create')}
              isSubmitting={crud.isCreating}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog
          open={page.modals.isOpen('edit')}
          onOpenChange={open => !open && page.modals.close('edit')}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            {page.modals.editingItem && (
              <EditProductForm
                product={page.modals.editingItem}
                onSubmit={async data => {
                  await crud.update(page.modals.editingItem!.id, data);
                  page.modals.close('edit');
                }}
                onCancel={() => page.modals.close('edit')}
                isSubmitting={crud.isUpdating}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={page.modals.isOpen('delete')}
          onOpenChange={open => !open && page.modals.close('delete')}
          title="Excluir Produto"
          description={
            page.modals.itemsToDelete.length === 1
              ? 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.'
              : `Tem certeza que deseja excluir ${page.modals.itemsToDelete.length} produtos? Esta ação não pode ser desfeita.`
          }
          onConfirm={page.handlers.handleDeleteConfirm}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="destructive"
          isLoading={crud.isDeleting}
        />

        {/* Duplicate Confirmation */}
        <ConfirmDialog
          open={page.modals.isOpen('duplicate')}
          onOpenChange={open => !open && page.modals.close('duplicate')}
          title="Duplicar Produto"
          description={
            page.modals.itemsToDuplicate.length === 1
              ? 'Tem certeza que deseja duplicar este produto?'
              : `Tem certeza que deseja duplicar ${page.modals.itemsToDuplicate.length} produtos?`
          }
          onConfirm={page.handlers.handleDuplicateConfirm}
          confirmLabel="Duplicar"
          cancelLabel="Cancelar"
          isLoading={crud.isDuplicating}
        />

        {/* Product Variants & Items Modal (Two-column) */}
        <ProductVariantsItemsModal
          product={selectedProduct}
          open={productModalOpen}
          onOpenChange={open => {
            setProductModalOpen(open);
            if (!open) {
              setSelectedProduct(null);
            }
          }}
          onMoveItem={handleMoveItem}
        />
      </PageLayout>
    </CoreProvider>
  );
}
