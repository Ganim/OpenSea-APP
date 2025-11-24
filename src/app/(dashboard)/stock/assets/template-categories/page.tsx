/**
 * Template Categories List Page
 * Página de listagem de categorias de templates
 */

'use client';

import { AlertCircle, CheckCircle, Folder, FolderTree } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  BatchProgressDialog,
  EntityGrid,
  PageHeader,
  PageHeaderConfig,
  SearchSection,
  StatsSection,
} from '@/components/shared';
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
import { useCategories, useDeleteCategory } from '@/hooks/stock/use-categories';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type { Category } from '@/types/stock';

function TemplateCategoriesContent() {
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
  const { data: categoriesResponse, isLoading } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();

  const allCategories = useMemo(
    () => categoriesResponse?.categories || [],
    [categoriesResponse]
  );

  // Filtrar apenas categorias de template
  const templateCategories = useMemo(
    () =>
      allCategories.filter(
        cat => !cat.parentId || cat.slug?.includes('template')
      ),
    [allCategories]
  );

  // Batch operations
  const batchDelete = useBatchOperation(
    async (id: string) => {
      await deleteCategoryMutation.mutateAsync(id);
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
              ? 'Categoria excluída com sucesso!'
              : `${succeeded} categorias excluídas com sucesso!`
          );
        } else {
          toast.error('Erro ao excluir algumas categorias');
        }
        clearSelection();
      },
    }
  );

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return templateCategories;
    return templateCategories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templateCategories, searchQuery]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryClick = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedId) {
      const allIds = filteredCategories.map(c => c.id);
      selectRange(lastSelectedId, id, allIds);
    } else {
      selectItem(id, event);
    }
  };

  const handleCategoryDoubleClick = (id: string) => {
    router.push(`/stock/assets/template-categories/${id}`);
  };

  const handleCategoriesView = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/template-categories/${ids[0]}`);
    } else {
      toast.info('Visualização múltipla em breve');
    }
  };

  const handleCategoriesEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/stock/assets/template-categories/${ids[0]}/edit`);
    } else {
      toast.info('Edição múltipla não disponível');
    }
  };

  const handleCategoriesDelete = (ids: string[]) => {
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
      label: 'Total de Categorias',
      value: templateCategories.length,
      icon: <Folder className="w-5 h-5" />,
    },
    {
      label: 'Ativas',
      value: templateCategories.filter(c => c.isActive).length,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: 'Inativas',
      value: templateCategories.filter(c => !c.isActive).length,
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      label: 'Com Subcategorias',
      value: templateCategories.filter(c =>
        allCategories.some(sub => sub.parentId === c.id)
      ).length,
      icon: <FolderTree className="w-5 h-5" />,
    },
  ];

  // Page Header Config
  const pageHeaderConfig: PageHeaderConfig = {
    title: 'Categorias de Templates',
    description: 'Gerencie as categorias dos seus templates de produtos',
    onAdd: () => router.push('/stock/assets/template-categories/new'),
    addLabel: 'Nova Categoria',
  };

  const renderGridItem = (category: Category, isSelected: boolean) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={e => handleCategoryClick(category.id, e)}
      onDoubleClick={() => handleCategoryDoubleClick(category.id)}
    >
      <div className="font-semibold">{category.name}</div>
      <div className="text-sm text-gray-500">{category.slug || 'Sem slug'}</div>
      <div className="text-sm text-gray-600 mt-1">
        {category.description || 'Sem descrição'}
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        <span
          className={`px-2 py-1 text-xs rounded ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {category.isActive ? 'Ativa' : 'Inativa'}
        </span>
        {category.parentId && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
            Subcategoria
          </span>
        )}
      </div>
    </div>
  );

  const renderListItem = (category: Category, isSelected: boolean) => (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={e => handleCategoryClick(category.id, e)}
      onDoubleClick={() => handleCategoryDoubleClick(category.id)}
    >
      <div className="flex-1">
        <div className="font-semibold">{category.name}</div>
        <div className="text-sm text-gray-500">
          {category.slug || 'Sem slug'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 text-xs rounded ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {category.isActive ? 'Ativa' : 'Inativa'}
        </span>
        <span className="text-sm text-gray-600">
          Ordem: {category.displayOrder || 0}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Carregando categorias...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col flex gap-4">
      <PageHeader config={pageHeaderConfig} />

      <SearchSection
        searchPlaceholder="Buscar categorias..."
        onSearch={handleSearch}
      />

      <StatsSection stats={stats} defaultExpanded />

      <EntityGrid
        items={filteredCategories}
        renderGridItem={renderGridItem}
        renderListItem={renderListItem}
        selectedIds={selectedIds}
        onItemClick={handleCategoryClick}
        onItemDoubleClick={handleCategoryDoubleClick}
        onItemsView={handleCategoriesView}
        onItemsEdit={handleCategoriesEdit}
        onItemsDelete={handleCategoriesDelete}
        emptyMessage="Nenhuma categoria de template cadastrada"
        isSearching={!!searchQuery.trim()}
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
                ? 'esta categoria'
                : `estas ${itemsToDelete.length} categorias`}
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
          itemName="categoria"
          onClose={() => {
            batchDelete.reset();
            setActiveOperation(null);
          }}
        />
      )}
    </div>
  );
}

export default function TemplateCategoriesPage() {
  return (
    <SelectionProvider>
      <TemplateCategoriesContent />
    </SelectionProvider>
  );
}
