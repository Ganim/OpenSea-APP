/**
 * OpenSea OS - Variants Page
 * Página de gerenciamento de variantes usando o novo sistema OpenSea OS
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import type { HeaderButton } from '@/components/layout/types/header.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ConfirmDialog,
  CoreProvider,
  EntityCard,
  EntityForm,
  EntityGrid,
  SelectionToolbar,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { variantsService } from '@/services/stock';
import type {
  CreateVariantRequest,
  UpdateVariantRequest,
  Variant,
} from '@/types/stock';
import { ArrowLeft, Palette, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { VariantDetailModal, variantsConfig } from './src';

export default function VariantsPage() {
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Variant>({
    entityName: 'Variante',
    entityNamePlural: 'Variantes',
    queryKey: ['variants'],
    baseUrl: '/api/v1/variants',
    listFn: async () => {
      const response = await variantsService.listVariants();
      return response.variants;
    },
    getFn: (id: string) => variantsService.getVariant(id).then(r => r.variant),
    createFn: data =>
      variantsService
        .createVariant(data as CreateVariantRequest)
        .then(r => r.variant),
    updateFn: (id, data) =>
      variantsService
        .updateVariant(id, data as UpdateVariantRequest)
        .then(r => r.variant),
    deleteFn: id => variantsService.deleteVariant(id),
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Variant>({
    entityName: 'Variante',
    entityNamePlural: 'Variantes',
    queryKey: ['variants'],
    crud,
    viewRoute: id => `/stock/variants/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false)
      );
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleVariantClick = (variant: Variant) => {
    setSelectedVariant(variant);
    setDetailModalOpen(true);
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Variant, isSelected: boolean) => {
    return (
      <EntityCard
        id={item.id}
        variant="grid"
        title={item.name}
        subtitle={item.sku}
        icon={Palette}
        iconBgColor="bg-gradient-to-br from-violet-500 to-purple-600"
        badges={[
          {
            label: `R$ ${Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            variant: 'default',
          },
        ]}
        metadata={
          <div className="flex items-center gap-4 text-xs">
            {item.barcode && <span>Código: {item.barcode}</span>}
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
        onDoubleClick={() => handleVariantClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  const renderListCard = (item: Variant, isSelected: boolean) => {
    return (
      <EntityCard
        id={item.id}
        variant="list"
        title={item.name}
        subtitle={item.sku}
        icon={Palette}
        iconBgColor="bg-gradient-to-br from-violet-500 to-purple-600"
        badges={[
          {
            label: `R$ ${Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            variant: 'default',
          },
        ]}
        metadata={
          <>
            {item.barcode && (
              <span className="text-xs">Código: {item.barcode}</span>
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
        onDoubleClick={() => handleVariantClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;

  const initialIds = useMemo(
    () => page.filteredItems.map(i => i.id),
    [page.filteredItems]
  );

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const handleCreate = useCallback(() => {
    page.modals.open('create');
  }, [page.modals]);

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'create-variant',
        title: 'Nova Variante',
        icon: Plus,
        onClick: handleCreate,
        variant: 'default',
      },
    ],
    [handleCreate]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'variants',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            buttons={actionButtons}
            onBack={() => router.back()}
            backLabel="Estoque"
            backIcon={ArrowLeft}
          />

          <Header
            title="Variantes"
            description="Gerencie as variantes de produtos"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            value={page.searchQuery}
            placeholder={variantsConfig.display.labels.searchPlaceholder}
            onSearch={value => page.handlers.handleSearch(value)}
            onClear={() => page.handlers.handleSearch('')}
            showClear={true}
            size="md"
          />

          {/* Grid */}
          {page.isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : page.error ? (
            <GridError
              type="server"
              title="Erro ao carregar variantes"
              message="Ocorreu um erro ao tentar carregar as variantes. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={variantsConfig}
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
                <DialogTitle>Nova Variante</DialogTitle>
              </DialogHeader>
              <EntityForm
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                config={variantsConfig.form! as any}
                mode="create"
                onSubmit={async data => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await crud.create(data as any);
                  page.modals.close('create');
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
                <DialogTitle>Editar Variante</DialogTitle>
              </DialogHeader>
              {page.modals.editingItem && (
                <EntityForm
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  config={variantsConfig.form! as any}
                  mode="edit"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  initialData={page.modals.editingItem as any}
                  onSubmit={async data => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await crud.update(page.modals.editingItem!.id, data as any);
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
            title="Excluir Variante"
            description={
              page.modals.itemsToDelete.length === 1
                ? 'Tem certeza que deseja excluir esta variante? Esta ação não pode ser desfeita.'
                : `Tem certeza que deseja excluir ${page.modals.itemsToDelete.length} variantes? Esta ação não pode ser desfeita.`
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
            title="Duplicar Variante"
            description={
              page.modals.itemsToDuplicate.length === 1
                ? 'Tem certeza que deseja duplicar esta variante?'
                : `Tem certeza que deseja duplicar ${page.modals.itemsToDuplicate.length} variantes?`
            }
            onConfirm={page.handlers.handleDuplicateConfirm}
            confirmLabel="Duplicar"
            cancelLabel="Cancelar"
            isLoading={crud.isDuplicating}
          />

          {/* Hierarchical Detail Modal */}
          <VariantDetailModal
            variant={selectedVariant}
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
