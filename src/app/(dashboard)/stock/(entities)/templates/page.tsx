/**
 * OpenSea OS - Templates Page
 * Página de gerenciamento de templates usando o novo sistema OpenSea OS
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
import { MultiViewModal } from '@/components/stock/multi-view-modal';
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  useEntityCrud,
  useEntityPage,
  type SortDirection,
} from '@/core';
import { usePermissions } from '@/hooks/use-permissions';
import { productsService, templatesService } from '@/services/stock';
import type { Template } from '@/types/stock';
import { Import, Package, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GrObjectGroup } from 'react-icons/gr';
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

type ActionButtonWithPermission = HeaderButton & {
  permission?: string;
};

export default function TemplatesPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  // ============================================================================
  // STATE
  // ============================================================================

  const [multiViewOpen, setMultiViewOpen] = useState(false);
  const [multiViewTemplates, setMultiViewTemplates] = useState<Template[]>([]);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [productsCountByTemplateId, setProductsCountByTemplateId] = useState<
    Record<string, number>
  >({});

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
    viewRoute: id => `/stock/templates/${id}`,
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

  // ==========================================================================
  // LOAD PRODUCTS COUNT FOR EACH TEMPLATE (guarded by stable id key)
  // ==========================================================================
  const templateIdsKey = useMemo(
    () =>
      page.filteredItems
        .map(item => item.id)
        .sort()
        .join('|'),
    [page.filteredItems]
  );

  useEffect(() => {
    let isMounted = true;
    async function loadCounts() {
      const entries = await Promise.all(
        page.filteredItems.map(async t => {
          try {
            const resp = await productsService.listProducts(t.id);
            return [t.id, resp.products?.length || 0] as const;
          } catch {
            return [t.id, 0] as const;
          }
        })
      );
      if (isMounted) {
        setProductsCountByTemplateId(prev => {
          const next = Object.fromEntries(entries);
          // Evita re-render desnecessário se nada mudou
          const same =
            Object.keys(next).length === Object.keys(prev).length &&
            Object.entries(next).every(([k, v]) => prev[k] === v);
          return same ? prev : next;
        });
      }
    }

    if (templateIdsKey) {
      loadCounts();
    } else {
      setProductsCountByTemplateId({});
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateIdsKey]);

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
    const productsCount = productsCountByTemplateId[item.id] ?? 0;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.name}
          subtitle={`${attributesCount} atributos definidos`}
          thumbnail={item.iconUrl}
          thumbnailFallback={<GrObjectGroup className="w-6 h-6 text-white" />}
          iconBgColor="bg-linear-to-br from-purple-500 to-pink-600"
          badges={[
            { label: getUnitLabel(item.unitOfMeasure), variant: 'default' },
          ]}
          footer={{
            type: 'single',
            button: {
              icon: Package,
              label: `${productsCount} produto${productsCount !== 1 ? 's' : ''}`,
              href: `/stock/products?template=${item.id}`,
              color: 'emerald',
            },
          }}
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
    const productsCount = productsCountByTemplateId[item.id] ?? 0;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.name}
          subtitle={`${attributesCount} atributos definidos`}
          thumbnail={item.iconUrl}
          thumbnailFallback={<GrObjectGroup className="w-5 h-5 text-white" />}
          iconBgColor="bg-linear-to-br from-purple-500 to-pink-600"
          badges={[
            { label: getUnitLabel(item.unitOfMeasure), variant: 'default' },
          ]}
          footer={{
            type: 'single',
            button: {
              icon: Package,
              label: `${productsCount} produto${productsCount !== 1 ? 's' : ''}`,
              href: `/stock/products?template=${item.id}`,
              color: 'emerald',
            },
          }}
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
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const handleCreate = useCallback(() => {
    page.modals.open('create');
  }, [page.modals]);

  const handleImport = useCallback(() => {
    router.push('/import/templates');
  }, [router]);

  const actionButtons = useMemo<ActionButtonWithPermission[]>(
    () => [
      {
        id: 'import-templates',
        title: 'Importar',
        icon: Import,
        onClick: handleImport,
        variant: 'ghost',
        permission: templatesConfig.permissions.import,
      },
      {
        id: 'create-template',
        title: 'Novo Template',
        icon: Plus,
        onClick: handleCreate,
        variant: 'default',
        permission: templatesConfig.permissions.create,
      },
    ],
    [handleImport, handleCreate]
  );

  const visibleActionButtons = useMemo<HeaderButton[]>(
    () =>
      actionButtons
        .filter(button =>
          button.permission ? hasPermission(button.permission) : true
        )
        .map(({ permission, ...button }) => button),
    [actionButtons, hasPermission]
  );

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
      <PageLayout>
        {/* Action Bar */}
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Templates', href: '/stock/templates' },
            ]}
            buttons={visibleActionButtons}
          />

          {/* Header */}
          <Header
            title="Templates"
            description="Gerencie os templates de produtos"
            buttons={[]}
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            value={page.searchQuery}
            placeholder={templatesConfig.display.labels.searchPlaceholder}
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
              title="Erro ao carregar templates"
              message="Ocorreu um erro ao tentar carregar os templates. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
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
            formKey={createFormKey}
            focusTrigger={createFormKey}
            onSubmit={async data => {
              await crud.create(data);
              // Após criar, reseta o formulário e mantém o modal aberto focando no primeiro campo
              setCreateFormKey(prev => prev + 1);
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
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
