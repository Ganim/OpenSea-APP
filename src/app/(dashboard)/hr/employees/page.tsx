/**
 * OpenSea OS - Employees Page
 * Página de gerenciamento de funcionários usando o novo sistema OpenSea OS
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
import type { Employee } from '@/types/hr';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Factory,
  Plus,
  RefreshCcwDot,
  Upload,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  createEmployee,
  CreateModal,
  DeleteConfirmModal,
  deleteEmployee,
  DuplicateConfirmModal,
  duplicateEmployee,
  EditModal,
  employeesApi,
  employeesConfig,
  updateEmployee,
  ViewModal,
  type CreateEmployeeWithUserRequest,
} from './src';

export default function EmployeesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<HRFilters>({});

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const normalizeEmployees = (response: unknown): Employee[] => {
    const maybeEmployees = response as {
      employees?: Employee[];
      data?: Employee[];
    };

    const items = (
      Array.isArray(response)
        ? response
        : (maybeEmployees.employees ?? maybeEmployees.data ?? [])
    ) as Employee[];

    return items
      .filter(employee => !employee.deletedAt)
      .map(employee => ({
        ...employee,
        company: employee.company || employee.department?.company || null,
        department: employee.department || null,
        position: employee.position || null,
      }));
  };

  const crud = useEntityCrud<Employee>({
    entityName: 'Employee',
    entityNamePlural: 'Employees',
    queryKey: ['employees', JSON.stringify(filters)],
    baseUrl: '/api/v1/hr/employees',
    listFn: async () => {
      const response = await employeesApi.list({
        companyId: filters.companyId,
        departmentId: filters.departmentId,
        positionId: filters.positionId,
        includeDeleted: false,
      });
      return normalizeEmployees(response);
    },
    getFn: (id: string) => employeesApi.get(id),
    createFn: createEmployee,
    updateFn: updateEmployee,
    deleteFn: deleteEmployee,
    duplicateFn: duplicateEmployee,
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Employee>({
    entityName: 'Employee',
    entityNamePlural: 'Employees',
    queryKey: ['employees'],
    crud,
    viewRoute: id => `/hr/employees/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      const fullName = item.fullName?.toLowerCase() || '';
      const registration = item.registrationNumber?.toLowerCase() || '';
      const cpf = item.cpf || '';
      const department = item.department?.name?.toLowerCase() || '';
      const position = item.position?.name?.toLowerCase() || '';

      return [fullName, registration, cpf, department, position].some(value =>
        value.includes(q)
      );
    },
    duplicateConfig: {
      getNewName: item => `${item.fullName} (cópia)`,
      getData: item => ({
        fullName: `${item.fullName} (cópia)`,
        registrationNumber: `${item.registrationNumber}_COPY`,
        cpf: item.cpf,
        hireDate: new Date().toISOString(),
        baseSalary: item.baseSalary,
        contractType: item.contractType,
        workRegime: item.workRegime,
        weeklyHours: item.weeklyHours,
        departmentId: item.departmentId,
        positionId: item.positionId,
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

  const customSortByRegistration = (
    a: Employee,
    b: Employee,
    direction: SortDirection
  ) => {
    const regA = a.registrationNumber?.toLowerCase() ?? '';
    const regB = b.registrationNumber?.toLowerCase() ?? '';
    const sortResult = regA.localeCompare(regB, 'pt-BR');
    return direction === 'asc' ? sortResult : -sortResult;
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Employee, isSelected: boolean) => {
    const companyName = item.company?.tradeName || item.company?.legalName;

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
          title={item.fullName}
          subtitle={item.position?.name || 'Sem cargo definido'}
          icon={Users}
          iconBgColor="bg-linear-to-br from-emerald-500 to-teal-600"
          badges={[
            ...(item.position
              ? [
                  {
                    label: item.position.name,
                    variant: 'outline' as const,
                    icon: Briefcase,
                  },
                ]
              : []),
            ...(item.department
              ? [
                  {
                    label: item.department.name,
                    variant: 'outline' as const,
                    icon: Building2,
                  },
                ]
              : []),
            ...(companyName
              ? [
                  {
                    label: companyName,
                    variant: 'outline' as const,
                    icon: Factory,
                  },
                ]
              : []),
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

  const renderListCard = (item: Employee, isSelected: boolean) => {
    const companyName = item.company?.tradeName || item.company?.legalName;

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
          title={item.fullName}
          subtitle={item.position?.name || 'Sem cargo definido'}
          icon={Users}
          iconBgColor="bg-linear-to-br from-emerald-500 to-teal-600"
          badges={[
            ...(item.position
              ? [
                  {
                    label: item.position.name,
                    variant: 'outline' as const,
                    icon: Briefcase,
                  },
                ]
              : []),
            ...(item.department
              ? [
                  {
                    label: item.department.name,
                    variant: 'outline' as const,
                    icon: Building2,
                  },
                ]
              : []),
            ...(companyName
              ? [
                  {
                    label: companyName,
                    variant: 'outline' as const,
                    icon: Factory,
                  },
                ]
              : []),
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

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const handleImport = useCallback(() => {
    router.push('/import/hr/employees');
  }, [router]);

  const handleCreate = useCallback(() => {
    page.modals.open('create');
  }, [page.modals]);

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'import-employees',
        title: 'Importar',
        icon: Upload,
        onClick: handleImport,
        variant: 'outline',
      },
      {
        id: 'create-employee',
        title: 'Novo Funcionário',
        icon: Plus,
        onClick: handleCreate,
        variant: 'default',
      },
    ],
    [handleImport, handleCreate]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'employees',
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
            title="Funcionários"
            description="Gerencie os funcionários da organização"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            placeholder={employeesConfig.display.labels.searchPlaceholder}
            value={page.searchQuery}
            onSearch={value => page.setSearchQuery(value)}
            showClear={true}
            size="md"
          />

          {/* HR Filters */}
          <HRFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            showCompany={true}
            showDepartment={true}
            showPosition={true}
          />

          {/* Grid */}
          {page.isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : page.error ? (
            <GridError
              type="server"
              title="Erro ao carregar funcionários"
              message="Ocorreu um erro ao tentar carregar os funcionários. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={employeesConfig}
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
              customSortFn={customSortByRegistration}
              customSortLabel="Matrícula"
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
            employee={page.modals.viewingItem}
          />

          {/* Create Modal */}
          <CreateModal
            isOpen={page.modals.isOpen('create')}
            onClose={() => page.modals.close('create')}
            isSubmitting={crud.isCreating}
            onSubmit={async data => {
              try {
                // Extrair dados específicos do usuário
                const {
                  createUser,
                  permissionGroupId,
                  userEmail,
                  userPassword,
                  ...employeeData
                } = data;

                if (
                  createUser &&
                  permissionGroupId &&
                  userEmail &&
                  userPassword
                ) {
                  // Usar a nova rota que cria funcionário + usuário automaticamente
                  await employeesApi.createWithUser({
                    ...(employeeData as CreateEmployeeWithUserRequest),
                    permissionGroupId,
                    userEmail,
                    userPassword,
                  });
                  await crud.refetch();
                  toast.success('Funcionário e usuário criados com sucesso!', {
                    description:
                      'O usuário foi criado automaticamente com as permissões selecionadas.',
                    duration: 5000,
                  });
                } else {
                  // Criar apenas o funcionário
                  await crud.create(employeeData);
                  toast.success('Funcionário criado com sucesso!');
                }
              } catch (error) {
                console.error('Erro ao criar funcionário:', error);
                toast.error('Erro ao criar funcionário');
              }
            }}
          />

          {/* Edit Modal */}
          <EditModal
            isOpen={page.modals.isOpen('edit')}
            onClose={() => page.modals.close('edit')}
            employee={page.modals.editingItem}
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
