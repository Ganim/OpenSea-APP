/**
 * OpenSea OS - Product Categories Page
 * Página de gerenciamento de categorias de produtos
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { SearchBar } from '@/components/layout/search-bar';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { categoriesConfig } from '@/config/entities/categories.config';
import {
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { categoriesService } from '@/services/stock';
import type { Category } from '@/types/stock';
import { useReorderCategories } from '@/hooks/stock/use-categories';
import { ArrowUpDown, Check, Plus, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { PiFolderOpenDuotone } from 'react-icons/pi';
import {
  SortableCategoryList,
  type SortableCategoryListRef,
} from './src/components/sortable-category-list';
import {
  CreateModal,
  DeleteConfirmModal,
  EditModal,
  ViewModal,
} from './src/modals';

export default function ProductCategoriesPage() {
  const router = useRouter();
  const [isReorderMode, setIsReorderMode] = useState(false);
  const reorderMutation = useReorderCategories();
  const sortableRef = useRef<SortableCategoryListRef>(null);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Category>({
    entityName: 'Categoria',
    entityNamePlural: 'Categorias',
    queryKey: ['categories'],
    baseUrl: '/v1/categories',
    listFn: async () => {
      const response = await categoriesService.listCategories();
      return response.categories || [];
    },
    getFn: async (id: string) => {
      const response = await categoriesService.getCategory(id);
      return response.category;
    },
    createFn: async (data: Partial<Category>) => {
      const response = await categoriesService.createCategory(
        data as Parameters<typeof categoriesService.createCategory>[0]
      );
      return response.category || response;
    },
    updateFn: async (id: string, data: Partial<Category>) => {
      const response = await categoriesService.updateCategory(
        id,
        data as Parameters<typeof categoriesService.updateCategory>[1]
      );
      return response.category || response;
    },
    deleteFn: async (id: string) => {
      await categoriesService.deleteCategory(id);
    },
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Category>({
    entityName: 'Categoria',
    entityNamePlural: 'Categorias',
    queryKey: ['categories'],
    crud,
    viewRoute: id => `/stock/product-categories/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.slug?.toLowerCase().includes(q) ||
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
      const item = page.filteredItems.find(i => i.id === ids[0]);
      if (item) {
        page.modals.setEditingItem(item);
        page.modals.open('edit');
      }
    }
  };

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.close('view');
    page.modals.open('delete');
  };

  const handleDoubleClick = (itemId: string) => {
    router.push(`/stock/product-categories/${itemId}`);
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Category, isSelected: boolean) => {
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
          subtitle={`${item.childrenCount || 0} subcategorias · ${item.productCount || 0} produtos`}
          thumbnail={item.iconUrl || undefined}
          thumbnailFallback={
            <PiFolderOpenDuotone className="w-6 h-6 text-white" />
          }
          iconBgColor="bg-linear-to-br from-blue-500 to-purple-600"
          badges={[
            {
              label: item.isActive ? 'Ativa' : 'Inativa',
              variant: item.isActive ? 'default' : 'secondary',
            },
            {
              label: `#${item.displayOrder || 0}`,
              variant: 'outline',
            },
          ]}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10">
            {item.description || 'Sem descrição'}
          </p>
        </UniversalCard>
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: Category, isSelected: boolean) => {
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
          subtitle={`${item.childrenCount || 0} subcategorias · ${item.productCount || 0} produtos`}
          thumbnail={item.iconUrl || undefined}
          thumbnailFallback={
            <PiFolderOpenDuotone className="w-5 h-5 text-white" />
          }
          iconBgColor="bg-linear-to-br from-blue-500 to-purple-600"
          badges={[
            {
              label: item.isActive ? 'Ativa' : 'Inativa',
              variant: item.isActive ? 'default' : 'secondary',
            },
            {
              label: `#${item.displayOrder || 0}`,
              variant: 'outline',
            },
          ]}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.description || 'Sem descrição'}
          </p>
        </UniversalCard>
      </EntityContextMenu>
    );
  };

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;

  const headerButtons: HeaderButton[] = useMemo(
    () =>
      isReorderMode
        ? [
            {
              id: 'cancel-reorder',
              title: 'Cancelar',
              icon: X,
              onClick: () => setIsReorderMode(false),
              variant: 'outline' as const,
            },
            {
              id: 'finish-reorder',
              title: 'Concluir',
              icon: Check,
              onClick: () => {
                if (sortableRef.current) {
                  reorderMutation.mutate(
                    sortableRef.current.getReorderedItems()
                  );
                }
                setIsReorderMode(false);
              },
              variant: 'default' as const,
            },
          ]
        : [
            {
              id: 'reorder-categories',
              title: 'Reordenar',
              icon: ArrowUpDown,
              onClick: () => setIsReorderMode(true),
              variant: 'outline' as const,
            },
            {
              id: 'import-categories',
              title: 'Importar',
              icon: Upload,
              onClick: () => router.push('/import/stock/product-categories'),
              variant: 'outline' as const,
            },
            {
              id: 'create-category',
              title: 'Nova Categoria',
              icon: Plus,
              onClick: () => page.modals.open('create'),
              variant: 'default' as const,
            },
          ],
    [page.modals, router, isReorderMode, reorderMutation]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'categories',
        initialIds: Array.isArray(page.filteredItems)
          ? page.filteredItems.map(i => i.id)
          : [],
      }}
    >
      <PageLayout backgroundVariant="none" maxWidth="full" spacing="gap-8">
        <Header
          title="Categorias de Produtos"
          description="Gerencie as categorias dos seus produtos"
          buttons={headerButtons}
        />

        {!isReorderMode && (
          <SearchBar
            placeholder="Buscar categorias..."
            value={page.searchQuery}
            onSearch={value => page.setSearchQuery(value)}
            showClear={true}
            size="md"
          />
        )}

        {/* Grid/List View or Reorder Mode */}
        {isReorderMode ? (
          <SortableCategoryList ref={sortableRef} items={page.filteredItems} />
        ) : page.isLoading ? (
          <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
        ) : page.error ? (
          <GridError
            type="server"
            title="Erro ao carregar categorias"
            message="Ocorreu um erro ao tentar carregar as categorias. Por favor, tente novamente."
            action={{
              label: 'Tentar Novamente',
              onClick: () => crud.refetch(),
            }}
          />
        ) : (
          <EntityGrid
            config={categoriesConfig}
            items={page.filteredItems}
            renderGridItem={renderGridCard}
            renderListItem={renderListCard}
            isLoading={page.isLoading}
            isSearching={!!page.searchQuery}
            showSorting={true}
            defaultSortField="name"
            defaultSortDirection="asc"
          />
        )}

        {/* Selection Toolbar */}
        {!isReorderMode && hasSelection && (
          <SelectionToolbar
            selectedIds={selectedIds}
            totalItems={
              Array.isArray(page.filteredItems) ? page.filteredItems.length : 0
            }
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

        {/* Modals */}
        <CreateModal
          isOpen={page.modals.isOpen('create')}
          onClose={() => page.modals.close('create')}
          onSubmit={async data => {
            await page.handlers.handleQuickCreate(data);
          }}
        />

        <ViewModal
          isOpen={page.modals.isOpen('view')}
          onClose={() => page.modals.close('view')}
          category={page.modals.viewingItem}
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

        <EditModal
          isOpen={page.modals.isOpen('edit')}
          onClose={() => page.modals.close('edit')}
          category={page.modals.editingItem}
          onSubmit={async (id, data) => {
            await crud.update(id, data);
            page.modals.close('edit');
          }}
        />

        <DeleteConfirmModal
          isOpen={page.modals.isOpen('delete')}
          onClose={() => page.modals.close('delete')}
          onConfirm={page.handlers.handleDeleteConfirm}
          count={page.modals.itemsToDelete.length}
        />
      </PageLayout>
    </CoreProvider>
  );
}
