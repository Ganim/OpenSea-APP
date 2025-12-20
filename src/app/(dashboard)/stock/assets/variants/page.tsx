/**
 * OpenSea OS - Variants Page
 * Página de gerenciamento de variantes usando o novo sistema OpenSea OS
 */

'use client';

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
import { variantsConfig } from '@/config/entities/variants.config';
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
import { variantsService } from '@/services/stock';
import type { Variant } from '@/types/stock';
import { Palette, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function VariantsPage() {
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
      variantsService.createVariant(data as any).then(r => r.variant),
    updateFn: (id, data) =>
      variantsService.updateVariant(id, data as any).then(r => r.variant),
    deleteFn: id => variantsService.deleteVariant(id),
  });

  const page = useEntityPage<Variant>({
    entityName: 'Variante',
    entityNamePlural: 'Variantes',
    queryKey: ['variants'],
    crud,
    viewRoute: (id) => `/stock/assets/variants/${id}`,
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
      <UniversalCard
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
      <UniversalCard
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

  return (
    <CoreProvider
      selection={{
        namespace: 'variants',
        initialIds,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-gray-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-8xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Variantes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie as variantes de produtos
              </p>
            </div>
            <Button
              onClick={() => page.modals.open('create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Variante
            </Button>
          </div>

          <Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={variantsConfig.display.labels.searchPlaceholder}
                value={page.searchQuery}
                onChange={e => page.handlers.handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {page.isLoading ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-gray-600 dark:text-white/60">Carregando...</p>
            </Card>
          ) : page.error ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-destructive">Erro ao carregar variantes</p>
            </Card>
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

          <Dialog
            open={page.modals.isOpen('create')}
            onOpenChange={open => !open && page.modals.close('create')}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Variante</DialogTitle>
              </DialogHeader>
              <EntityForm
                config={variantsConfig.form!}
                mode="create"
                onSubmit={async data => {
                  await crud.create(data);
                  page.modals.close('create');
                }}
                onCancel={() => page.modals.close('create')}
                isSubmitting={crud.isCreating}
              />
            </DialogContent>
          </Dialog>

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
                  config={variantsConfig.form!}
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
        </div>
      </div>
    </CoreProvider>
  );
}
