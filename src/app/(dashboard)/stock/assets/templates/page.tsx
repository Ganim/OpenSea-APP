/**
 * OpenSea OS - Templates Page
 * Página de gerenciamento de templates usando o novo sistema OpenSea OS
 */

'use client';

import { MultiViewModal } from '@/components/stock/multi-view-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
  type SortDirection,
} from '@/core';
import { templatesService } from '@/services/stock';
import type { Template } from '@/types/stock';
import {
  Calendar,
  LayoutTemplate,
  Plus,
  RefreshCcwDot,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CreateModal,
  createTemplate,
  DeleteConfirmModal,
  deleteTemplate,
  DuplicateConfirmModal,
  duplicateTemplate,
  EditModal,
  getUnitLabel,
  templatesConfig,
  updateTemplate,
  ViewModal,
} from './src';

export default function TemplatesPage() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [multiViewOpen, setMultiViewOpen] = useState(false);
  const [multiViewTemplates, setMultiViewTemplates] = useState<Template[]>([]);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Template>({
    entityName: 'Template',
    entityNamePlural: 'Templates',
    queryKey: ['templates'],
    baseUrl: '/api/v1/templates',
    listFn: async () => {
      const response = await templatesService.listTemplates();
      return response.templates;
    },
    getFn: (id: string) =>
      templatesService.getTemplate(id).then(r => r.template),
    createFn: createTemplate,
    updateFn: updateTemplate,
    deleteFn: deleteTemplate,
    duplicateFn: duplicateTemplate,
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Template>({
    entityName: 'Template',
    entityNamePlural: 'Templates',
    queryKey: ['templates'],
    crud,
    viewRoute: id => `/stock/assets/templates/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return item.name.toLowerCase().includes(q);
    },
    duplicateConfig: {
      getNewName: item => `${item.name} (cópia)`,
      getData: item => ({
        name: `${item.name} (cópia)`,
        unitOfMeasure: item.unitOfMeasure,
        productAttributes: item.productAttributes,
        variantAttributes: item.variantAttributes,
        itemAttributes: item.itemAttributes,
        careInstructions: item.careInstructions,
      }),
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Context menu handlers
  const handleContextView = (ids: string[]) => {
    if (ids.length > 1) {
      // Visualização múltipla - usar MultiViewModal
      const templates = page.filteredItems.filter(item =>
        ids.includes(item.id)
      );
      setMultiViewTemplates(templates);
      setMultiViewOpen(true);
    } else {
      // Visualização única - usar modal padrão
      page.handlers.handleItemsView(ids);
    }
  };

  const handleContextEdit = (ids: string[]) => {
    if (ids.length > 1) {
      // Edição múltipla - usar MultiViewModal com ?action=edit
      const templates = page.filteredItems.filter(item =>
        ids.includes(item.id)
      );
      setMultiViewTemplates(templates);
      setMultiViewOpen(true);
    } else {
      // Edição única - usar modal padrão ou navegar para página
      page.handlers.handleItemsEdit(ids);
    }
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

  const renderGridCard = (item: Template, isSelected: boolean) => {
    const attributesCount =
      (Object.keys(item.productAttributes || {}).length || 0) +
      (Object.keys(item.variantAttributes || {}).length || 0) +
      (Object.keys(item.itemAttributes || {}).length || 0);

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
          variant="grid"
          title={item.name}
          subtitle={`${attributesCount} atributos definidos`}
          icon={LayoutTemplate}
          iconBgColor="bg-gradient-to-br from-purple-500 to-pink-600"
          badges={[
            { label: getUnitLabel(item.unitOfMeasure), variant: 'default' },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  Criado em {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <RefreshCcwDot className="h-3 w-3 text-yellow-500" />
                  Atualizado em {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
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

  const renderListCard = (item: Template, isSelected: boolean) => {
    const attributesCount =
      (Object.keys(item.productAttributes || {}).length || 0) +
      (Object.keys(item.variantAttributes || {}).length || 0) +
      (Object.keys(item.itemAttributes || {}).length || 0);

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
          subtitle={`${attributesCount} atributos definidos`}
          icon={LayoutTemplate}
          iconBgColor="bg-gradient-to-br from-purple-500 to-pink-600"
          badges={[
            { label: getUnitLabel(item.unitOfMeasure), variant: 'default' },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  Criado em {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <RefreshCcwDot className="h-3 w-3 text-yellow-500" />
                  Atualizado em {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
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

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;

  const initialIds = useMemo(
    () => page.filteredItems.map(i => i.id),
    [page.filteredItems]
  );

  // Função de ordenação customizada por unidade de medida
  const customSortByUnit = (
    a: Template,
    b: Template,
    direction: SortDirection
  ) => {
    const unitA = a.unitOfMeasure?.toLowerCase() ?? '';
    const unitB = b.unitOfMeasure?.toLowerCase() ?? '';
    const result = unitA.localeCompare(unitB, 'pt-BR');
    return direction === 'asc' ? result : -result;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'templates',
        initialIds,
      }}
    >
      <div className="min-h-screen  from-purple-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
        <div className="max-w-8xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Templates
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie os templates de produtos
              </p>
            </div>
            <Button
              onClick={() => page.modals.open('create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Template
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="p-4 backdrop-blur-xl bg-white/40 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder={templatesConfig.display.labels.searchPlaceholder}
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
              <p className="text-destructive">Erro ao carregar templates</p>
            </Card>
          ) : (
            <EntityGrid
              config={templatesConfig}
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
              customSortFn={customSortByUnit}
              customSortLabel="Unidade de Medida"
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

          {/* View Modal */}
          <ViewModal
            isOpen={page.modals.isOpen('view')}
            onClose={() => page.modals.close('view')}
            template={page.modals.viewingItem}
          />

          {/* Create Modal */}
          <CreateModal
            isOpen={page.modals.isOpen('create')}
            onClose={() => page.modals.close('create')}
            isSubmitting={crud.isCreating}
            onSubmit={async data => {
              await crud.create(data);
            }}
          />

          {/* Edit Modal */}
          <EditModal
            isOpen={page.modals.isOpen('edit')}
            onClose={() => page.modals.close('edit')}
            template={page.modals.editingItem}
            isSubmitting={crud.isUpdating}
            onSubmit={async (id, data) => {
              await crud.update(id, data);
            }}
          />

          {/* Multi View Modal */}
          <MultiViewModal
            isOpen={multiViewOpen}
            onClose={() => setMultiViewOpen(false)}
            templates={multiViewTemplates}
            availableTemplates={page.filteredItems}
          />

          {/* Delete Confirmation */}
          <DeleteConfirmModal
            isOpen={page.modals.isOpen('delete')}
            onClose={() => page.modals.close('delete')}
            itemCount={page.modals.itemsToDelete.length}
            onConfirm={page.handlers.handleDeleteConfirm}
            isLoading={crud.isDeleting}
          />

          {/* Duplicate Confirmation */}
          <DuplicateConfirmModal
            isOpen={page.modals.isOpen('duplicate')}
            onClose={() => page.modals.close('duplicate')}
            itemCount={page.modals.itemsToDuplicate.length}
            onConfirm={page.handlers.handleDuplicateConfirm}
            isLoading={crud.isDuplicating}
          />
        </div>
      </div>
    </CoreProvider>
  );
}
