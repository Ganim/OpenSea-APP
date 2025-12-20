/**
 * OpenSea OS - Suppliers Page
 * Página de gerenciamento de fornecedores usando o novo sistema OpenSea OS
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { suppliersConfig } from '@/config/entities/suppliers.config';
import {
    ConfirmDialog,
    EntityForm,
    EntityGrid,
    SelectionToolbar,
    UniversalCard,
    useEntityCrud,
    useEntityPage,
} from '@/core';
import { suppliersService } from '@/services/stock';
import type { Supplier } from '@/types/stock';
import { Building2, Plus, Search } from 'lucide-react';

export default function SuppliersPage() {
  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Supplier>({
    entityName: 'Fornecedor',
    entityNamePlural: 'Fornecedores',
    queryKey: ['suppliers'],
    baseUrl: '/api/v1/suppliers',
    listFn: async () => {
      const response = await suppliersService.listSuppliers();
      return response.suppliers;
    },
    getFn: (id: string) =>
      suppliersService.getSupplier(id).then(r => r.supplier),
    createFn: data =>
      suppliersService.createSupplier(data as any).then(r => r.supplier),
    updateFn: (id, data) =>
      suppliersService.updateSupplier(id, data as any).then(r => r.supplier),
    deleteFn: id => suppliersService.deleteSupplier(id),
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Supplier>({
    entityName: 'Fornecedor',
    entityNamePlural: 'Fornecedores',
    queryKey: ['suppliers'],
    crud,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.email?.toLowerCase().includes(q) ?? false) ||
        (item.cnpj?.toLowerCase().includes(q) ?? false)
      );
    },
  });

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Supplier, isSelected: boolean) => {
    return (
      <UniversalCard
        id={item.id}
        variant="grid"
        title={item.name}
        subtitle={item.email || item.cnpj}
        icon={Building2}
        iconBgColor="bg-linear-to-br from-emerald-500 to-teal-600"
        badges={[
          {
            label: item.isActive ? 'Ativo' : 'Inativo',
            variant: item.isActive ? 'default' : 'secondary',
          },
        ]}
        metadata={
          <div className="flex items-center gap-4 text-xs">
            {item.country && <span>{item.country}</span>}
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
        onDoubleClick={e => page.handlers.handleItemDoubleClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={true}
      />
    );
  };

  const renderListCard = (item: Supplier, isSelected: boolean) => {
    return (
      <UniversalCard
        id={item.id}
        variant="list"
        title={item.name}
        subtitle={item.email || item.cnpj}
        icon={Building2}
        iconBgColor="bg-linear-to-br from-emerald-500 to-teal-600"
        badges={[
          {
            label: item.isActive ? 'Ativo' : 'Inativo',
            variant: item.isActive ? 'default' : 'secondary',
          },
        ]}
        metadata={
          <>{item.country && <span className="text-xs">{item.country}</span>}</>
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
        onDoubleClick={e => page.handlers.handleItemDoubleClick(item)}
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Fornecedores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os fornecedores
          </p>
        </div>
        <Button onClick={() => page.modals.open('create')} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={suppliersConfig.display.labels.searchPlaceholder}
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
          <p className="text-destructive">Erro ao carregar fornecedores</p>
        </Card>
      ) : (
        <EntityGrid
          config={suppliersConfig}
          items={page.filteredItems}
          renderGridItem={renderGridCard}
          renderListItem={renderListCard}
          isLoading={page.isLoading}
          isSearching={!!page.searchQuery}
          onItemClick={(item, e) => page.handlers.handleItemClick(item, e)}
          onItemDoubleClick={item => page.handlers.handleItemDoubleClick(item)}
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
            <DialogTitle>Novo Fornecedor</DialogTitle>
          </DialogHeader>
          <EntityForm
            config={suppliersConfig.form!}
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

      {/* Edit Modal */}
      <Dialog
        open={page.modals.isOpen('edit')}
        onOpenChange={open => !open && page.modals.close('edit')}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          {page.modals.editingItem && (
            <EntityForm
              config={suppliersConfig.form!}
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
        title="Excluir Fornecedor"
        description={
          page.modals.itemsToDelete.length === 1
            ? 'Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.'
            : `Tem certeza que deseja excluir ${page.modals.itemsToDelete.length} fornecedores? Esta ação não pode ser desfeita.`
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
        title="Duplicar Fornecedor"
        description={
          page.modals.itemsToDuplicate.length === 1
            ? 'Tem certeza que deseja duplicar este fornecedor?'
            : `Tem certeza que deseja duplicar ${page.modals.itemsToDuplicate.length} fornecedores?`
        }
        onConfirm={page.handlers.handleDuplicateConfirm}
        confirmLabel="Duplicar"
        cancelLabel="Cancelar"
        isLoading={crud.isDuplicating}
      />
    </div>
  );
}
