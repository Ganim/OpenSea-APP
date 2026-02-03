/**
 * OpenSea OS - Departments Page
 * Página de gerenciamento de departamentos usando o novo sistema OpenSea OS
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
import { HRFilterBar, type HRFilters } from '@/components/shared/filters';
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
import type { Department } from '@/types/hr';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Plus,
  RefreshCcwDot,
  Upload,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  createDepartment,
  CreateModal,
  DeleteConfirmModal,
  deleteDepartment,
  departmentsApi,
  departmentsConfig,
  DuplicateConfirmModal,
  duplicateDepartment,
  EditModal,
  updateDepartment,
  ViewModal,
} from './src';

export default function DepartmentsPage() {
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================
  const [filters, setFilters] = useState<HRFilters>({});

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Department>({
    entityName: 'Department',
    entityNamePlural: 'Departments',
    queryKey: ['departments', JSON.stringify(filters)],
    baseUrl: '/api/v1/hr/departments',
    listFn: async () => {
      const response = await departmentsApi.list({
        companyId: filters.companyId,
      });
      return response.departments;
    },
    getFn: (id: string) => departmentsApi.get(id),
    createFn: createDepartment,
    updateFn: updateDepartment,
    deleteFn: deleteDepartment,
    duplicateFn: duplicateDepartment,
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Department>({
    entityName: 'Department',
    entityNamePlural: 'Departments',
    queryKey: ['departments'],
    crud,
    viewRoute: id => `/hr/departments/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return Boolean(
        item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    },
    duplicateConfig: {
      getNewName: item => `${item.name} (cópia)`,
      getData: item => ({
        name: `${item.name} (cópia)`,
        code: `${item.code}_COPY`,
        description: item.description,
        parentId: item.parentId,
        managerId: item.managerId,
        isActive: item.isActive,
      }),
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) => {
    page.handlers.handleItemsView(ids);
  };

  const handleContextEdit = (ids: string[]) => {
    page.handlers.handleItemsEdit(ids);
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

  const renderGridCard = (item: Department, isSelected: boolean) => {
    const companyName = item.company?.tradeName || item.company?.legalName;
    const positionsCount = item._count?.positions ?? 0;
    const employeesCount = item._count?.employees ?? 0;

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
          subtitle={companyName || item.description || `Código: ${item.code}`}
          icon={Building2}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          badges={[
            ...(positionsCount > 0
              ? [
                  {
                    label: `${positionsCount} cargo${positionsCount > 1 ? 's' : ''}`,
                    variant: 'outline' as const,
                    icon: Briefcase,
                  },
                ]
              : []),
            ...(employeesCount > 0
              ? [
                  {
                    label: `${employeesCount} funcionário${employeesCount > 1 ? 's' : ''}`,
                    variant: 'secondary' as const,
                    icon: Users,
                  },
                ]
              : []),
            {
              label: item.isActive ? 'Ativo' : 'Inativo',
              variant: item.isActive ? 'default' : 'secondary',
            },
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

  const renderListCard = (item: Department, isSelected: boolean) => {
    const companyName = item.company?.tradeName || item.company?.legalName;
    const positionsCount = item._count?.positions ?? 0;
    const employeesCount = item._count?.employees ?? 0;

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
          subtitle={companyName || item.description || `Código: ${item.code}`}
          icon={Building2}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          badges={[
            ...(positionsCount > 0
              ? [
                  {
                    label: `${positionsCount} cargo${positionsCount > 1 ? 's' : ''}`,
                    variant: 'outline' as const,
                    icon: Briefcase,
                  },
                ]
              : []),
            ...(employeesCount > 0
              ? [
                  {
                    label: `${employeesCount} funcionário${employeesCount > 1 ? 's' : ''}`,
                    variant: 'secondary' as const,
                    icon: Users,
                  },
                ]
              : []),
            {
              label: item.isActive ? 'Ativo' : 'Inativo',
              variant: item.isActive ? 'default' : 'secondary',
            },
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

  // Função de ordenação customizada por código
  const customSortByCode = (
    a: Department,
    b: Department,
    direction: SortDirection
  ) => {
    const codeA = a.code?.toLowerCase() ?? '';
    const codeB = b.code?.toLowerCase() ?? '';
    const result = codeA.localeCompare(codeB, 'pt-BR');
    return direction === 'asc' ? result : -result;
  };

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const handleCreate = useCallback(() => {
    page.modals.open('create');
  }, [page.modals]);

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'import-departments',
        title: 'Importar',
        icon: Upload,
        onClick: () => router.push('/import/hr/departments'),
        variant: 'outline',
      },
      {
        id: 'create-department',
        title: 'Novo Departamento',
        icon: Plus,
        onClick: handleCreate,
        variant: 'default',
      },
    ],
    [handleCreate, router]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'departments',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            buttons={actionButtons}
            onBack={() => router.back()}
            backLabel="RH"
            backIcon={ArrowLeft}
          />

          <Header
            title="Departamentos"
            description="Gerencie os departamentos da organização"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            placeholder={departmentsConfig.display.labels.searchPlaceholder}
            value={page.searchQuery}
            onSearch={value => page.handlers.handleSearch(value)}
            onClear={() => page.handlers.handleSearch('')}
            showClear={true}
            size="md"
          />

          {/* HR Filters */}
          <HRFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            showCompany={true}
            showDepartment={false}
            showPosition={false}
          />

          {/* Grid */}
          {page.isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : page.error ? (
            <GridError
              type="server"
              title="Erro ao carregar departamentos"
              message="Ocorreu um erro ao tentar carregar os departamentos. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={departmentsConfig}
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
              customSortFn={customSortByCode}
              customSortLabel="Código"
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
            department={page.modals.viewingItem}
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
            department={page.modals.editingItem}
            isSubmitting={crud.isUpdating}
            onSubmit={async (id, data) => {
              await crud.update(id, data);
            }}
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
