/**
 * OpenSea OS - Tags Page
 * Página de gerenciamento de tags usando o novo sistema OpenSea OS
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
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { tagsService } from '@/services/stock';
import type { Tag } from '@/types/stock';
import { ArrowLeft, Plus, Tag as TagIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  CreateModal,
  DeleteConfirmModal,
  EditModal,
  tagsConfig,
  ViewModal,
} from './src';

export default function TagsPage() {
  const router = useRouter();

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Tag>({
    entityName: 'Tag',
    entityNamePlural: 'Tags',
    queryKey: ['tags'],
    baseUrl: '/v1/tags',
    listFn: async () => {
      const response = await tagsService.listTags();
      return response.tags || [];
    },
    getFn: async (id: string) => {
      const response = await tagsService.getTag(id);
      return response.tag;
    },
    createFn: async (data: Partial<Tag>) => {
      const response = await tagsService.createTag(
        data as Parameters<typeof tagsService.createTag>[0]
      );
      return response.tag || response;
    },
    updateFn: async (id: string, data: Partial<Tag>) => {
      const response = await tagsService.updateTag(
        id,
        data as Parameters<typeof tagsService.updateTag>[1]
      );
      return response.tag || response;
    },
    deleteFn: async (id: string) => {
      await tagsService.deleteTag(id);
    },
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Tag>({
    entityName: 'Tag',
    entityNamePlural: 'Tags',
    queryKey: ['tags'],
    crud,
    viewRoute: id => `/stock/tags/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.color?.toLowerCase().includes(q) ||
        false
      );
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) => {
    page.handlers.handleItemsView(ids);
  };

  const handleContextEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/tags/${ids[0]}`);
    }
  };

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.close('view');
    page.modals.open('delete');
  };

  const handleDoubleClick = (itemId: string) => {
    const item = page.filteredItems.find(i => i.id === itemId);
    if (item) {
      page.modals.setViewingItem(item);
      page.modals.open('view');
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Tag, isSelected: boolean) => {
    const isActive = !item.deletedAt;
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="grid"
          title={item.name}
          subtitle={item.description || 'Sem descrição'}
          icon={TagIcon}
          iconBgColor="bg-linear-to-br from-purple-500 to-pink-600"
          badges={[
            {
              label: isActive ? 'Ativa' : 'Inativa',
              variant: isActive ? 'default' : 'secondary',
            },
          ]}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: Tag, isSelected: boolean) => {
    const isActive = !item.deletedAt;
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="list"
          title={item.name}
          subtitle={item.description || 'Sem descrição'}
          icon={TagIcon}
          iconBgColor="bg-linear-to-br from-purple-500 to-pink-600"
          badges={[
            {
              label: isActive ? 'Ativa' : 'Inativa',
              variant: isActive ? 'default' : 'secondary',
            },
          ]}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        />
      </EntityContextMenu>
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
        id: 'create-tag',
        title: 'Nova Tag',
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
        namespace: 'tags',
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
            title="Tags"
            description="Gerencie as etiquetas para categorizar seus produtos"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            value={page.searchQuery}
            placeholder={tagsConfig.display.labels.searchPlaceholder}
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
              title="Erro ao carregar tags"
              message="Ocorreu um erro ao tentar carregar as tags. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={tagsConfig}
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
                delete: true,
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
                onEdit: page.handlers.handleItemsEdit,
                onDelete: page.handlers.handleItemsDelete,
              }}
            />
          )}

          {/* Create Modal */}
          <CreateModal
            isOpen={page.modals.isOpen('create')}
            onClose={() => page.modals.close('create')}
            onSubmit={async data => {
              await page.handlers.handleQuickCreate(data);
            }}
          />

          {/* View Modal */}
          <ViewModal
            isOpen={page.modals.isOpen('view')}
            onClose={() => page.modals.close('view')}
            tag={page.modals.viewingItem}
            onEdit={() => {
              if (page.modals.viewingItem) {
                page.modals.setEditingItem(page.modals.viewingItem);
                page.modals.close('view');
                page.modals.open('edit');
              }
            }}
            onDelete={() => {
              if (page.modals.viewingItem) {
                handleContextDelete([page.modals.viewingItem.id]);
              }
            }}
          />

          {/* Edit Modal */}
          <EditModal
            isOpen={page.modals.isOpen('edit')}
            onClose={() => page.modals.close('edit')}
            tag={page.modals.editingItem}
            onSubmit={async (id, data) => {
              await crud.update(id, data);
              page.modals.close('edit');
            }}
          />

          {/* Delete Confirmation */}
          <DeleteConfirmModal
            isOpen={page.modals.isOpen('delete')}
            onClose={() => page.modals.close('delete')}
            onConfirm={page.handlers.handleDeleteConfirm}
            count={page.modals.itemsToDelete.length}
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
