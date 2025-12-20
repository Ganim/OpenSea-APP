/**
 * OpenSea OS - Products Page
 * Página de gerenciamento de produtos usando o novo sistema OpenSea OS
 */

'use client';

import { CreateProductForm } from '@/components/stock/create-product-form';
import { ProductDetailModal } from '@/components/stock/product-detail-modal';
import { VariantDetailModal } from '@/components/stock/variant-detail-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { productsConfig } from '@/config/entities/products.config';
import {
  ConfirmDialog,
  CoreProvider,
  EntityForm,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { productsService } from '@/services/stock';
import type { Product, Variant } from '@/types/stock';
import { Package, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

export default function ProductsPage() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [variantDetailModalOpen, setVariantDetailModalOpen] = useState(false);

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
      productsService.createProduct(data as any).then(r => r.product),
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
    viewRoute: (id) => `/stock/assets/products/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.code?.toLowerCase().includes(q) ?? false) ||
        (item.description?.toLowerCase().includes(q) ?? false)
      );
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  }, []);

  const handleVariantClick = useCallback((variant: Variant) => {
    setSelectedVariant(variant);
    setVariantDetailModalOpen(true);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Product, isSelected: boolean) => {
    return (
      <UniversalCard
        id={item.id}
        variant="grid"
        title={item.name}
        subtitle={item.code}
        icon={Package}
        iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
        badges={[
          {
            label:
              item.status === 'ACTIVE'
                ? 'Ativo'
                : item.status === 'INACTIVE'
                  ? 'Inativo'
                  : 'Arquivado',
            variant: item.status === 'ACTIVE' ? 'default' : 'secondary',
          },
        ]}
        metadata={
          <div className="flex items-center gap-4 text-xs">
            {item.description && (
              <span className="truncate">{item.description}</span>
            )}
            {item.createdAt && (
              <span>
                Criado em {new Date(item.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        }
        isSelected={isSelected}
        showSelection={true}
        onSelectionChange={checked => {
          if (page.selection) {
            if (checked) {
              page.selection.actions.select(item.id);
            } else {
              page.selection.actions.deselect(item.id);
            }
          }
        }}
        onClick={e => page.handlers.handleItemClick(item, e)}
        onDoubleClick={() => handleProductClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  const renderListCard = (item: Product, isSelected: boolean) => {
    return (
      <UniversalCard
        id={item.id}
        variant="list"
        title={item.name}
        subtitle={item.code}
        icon={Package}
        iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
        badges={[
          {
            label:
              item.status === 'ACTIVE'
                ? 'Ativo'
                : item.status === 'INACTIVE'
                  ? 'Inativo'
                  : 'Arquivado',
            variant: item.status === 'ACTIVE' ? 'default' : 'secondary',
          },
        ]}
        metadata={
          <>
            {item.description && (
              <span className="text-xs truncate">{item.description}</span>
            )}
          </>
        }
        isSelected={isSelected}
        showSelection={true}
        onSelectionChange={checked => {
          if (page.selection) {
            if (checked) {
              page.selection.actions.select(item.id);
            } else {
              page.selection.actions.deselect(item.id);
            }
          }
        }}
        onClick={e => page.handlers.handleItemClick(item, e)}
        onDoubleClick={() => handleProductClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
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
    () => page.filteredItems.map(i => i.id),
    [page.filteredItems]
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
      <div className="min-h-screen  from-blue-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-8xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Produtos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie o catálogo de produtos
              </p>
            </div>
            <Button
              onClick={() => page.modals.open('create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={productsConfig.display.labels.searchPlaceholder}
                value={page.searchQuery}
                onChange={e => page.handlers.handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Grid */}
          {page.isLoading ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-gray-600 dark:text-white/60">Carregando...</p>
            </Card>
          ) : page.error ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-destructive">Erro ao carregar produtos</p>
            </Card>
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
                <EntityForm
                  config={productsConfig.form!}
                  mode="edit"
                  initialData={page.modals.editingItem}
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

          {/* Hierarchical Detail Modals */}
          <ProductDetailModal
            product={selectedProduct}
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            onVariantClick={handleVariantClick}
          />

          <VariantDetailModal
            variant={selectedVariant}
            open={variantDetailModalOpen}
            onOpenChange={setVariantDetailModalOpen}
          />
        </div>
      </div>
    </CoreProvider>
  );
}
