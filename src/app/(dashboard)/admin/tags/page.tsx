/**
 * OpenSea OS - Tags Page
 * Página de gerenciamento de tags usando o novo sistema OpenSea OS
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
import { tagsConfig } from '@/config/entities/tags.config';
import {
    ConfirmDialog,
    EntityForm,
    EntityGrid,
    SelectionToolbar,
    UniversalCard,
    useEntityCrud,
    useEntityPage,
} from '@/core';
import { tagsService } from '@/services/stock';
import type { Tag } from '@/types/stock';
import { Plus, Search, Tag as TagIcon } from 'lucide-react';

export default function TagsPage() {
  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Tag>({
    entityName: 'Tag',
    entityNamePlural: 'Tags',
    queryKey: ['tags'],
    baseUrl: '/api/v1/tags',
    listFn: async () => {
      const response = await tagsService.listTags();
      return response.tags;
    },
    getFn: (id: string) => tagsService.getTag(id).then(r => r.tag),
    createFn: (data: Partial<Tag>) =>
      tagsService.createTag(data as unknown as Tag).then(r => r.tag),
    updateFn: (id: string, data: Partial<Tag>) =>
      tagsService.updateTag(id, data as unknown as Tag).then(r => r.tag),
    deleteFn: id => tagsService.deleteTag(id),
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Tag>({
    entityName: 'Tag',
    entityNamePlural: 'Tags',
    queryKey: ['tags'],
    crud,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false)
      );
    },
  });

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Tag, isSelected: boolean) => {
    return (
      <UniversalCard
        id={item.id}
        variant="grid"
        title={item.name}
        subtitle={item.description}
        icon={TagIcon}
        iconBgColor="bg-linear-to-br from-pink-500 to-rose-600"
        badges={[]}
        metadata={
          <div className="flex items-center gap-4 text-xs">
            {item.color && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.color}</span>
              </div>
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
        onDoubleClick={() => page.handlers.handleItemDoubleClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={false}
      />
    );
  };

  const renderListCard = (item: Tag, isSelected: boolean) => {
    return (
      <UniversalCard
        id={item.id}
        variant="list"
        title={item.name}
        subtitle={item.description}
        icon={TagIcon}
        iconBgColor="bg-linear-to-br from-pink-500 to-rose-600"
        badges={[]}
        metadata={
          <>
            {item.color && (
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.color}</span>
              </div>
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
        onDoubleClick={() => page.handlers.handleItemDoubleClick(item)}
        createdAt={item.createdAt}
        updatedAt={item.updatedAt}
        showStatusBadges={false}
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
            Tags
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie as tags
          </p>
        </div>
        <Button onClick={() => page.modals.open('create')} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Tag
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={tagsConfig.display.labels.searchPlaceholder}
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
          <p className="text-destructive">Erro ao carregar tags</p>
        </Card>
      ) : (
        <EntityGrid
          config={tagsConfig}
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
            <DialogTitle>Nova Tag</DialogTitle>
          </DialogHeader>
          <EntityForm
            config={tagsConfig.form!}
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
            <DialogTitle>Editar Tag</DialogTitle>
          </DialogHeader>
          {page.modals.editingItem && (
            <EntityForm
              config={tagsConfig.form!}
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
        title="Excluir Tag"
        description={
          page.modals.itemsToDelete.length === 1
            ? 'Tem certeza que deseja excluir esta tag? Esta ação não pode ser desfeita.'
            : `Tem certeza que deseja excluir ${page.modals.itemsToDelete.length} tags? Esta ação não pode ser desfeita.`
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
        title="Duplicar Tag"
        description={
          page.modals.itemsToDuplicate.length === 1
            ? 'Tem certeza que deseja duplicar esta tag?'
            : `Tem certeza que deseja duplicar ${page.modals.itemsToDuplicate.length} tags?`
        }
        onConfirm={page.handlers.handleDuplicateConfirm}
        confirmLabel="Duplicar"
        cancelLabel="Cancelar"
        isLoading={crud.isDuplicating}
      />
    </div>
  );
}
