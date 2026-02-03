/**
 * OpenSea OS - Companies Page
 * Listagem e gerenciamento das empresas
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
import { formatCNPJ } from '@/helpers/formatters';
import type { BrasilAPICompanyData } from '@/types/brasilapi';
import type { Company } from '@/types/hr';
import {
  ArrowDownAZ,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Plus,
  RefreshCcwDot,
  Upload,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CNPJLookupModal,
  companiesApi,
  companiesConfig,
  createCompany,
  CreateModal,
  deleteCompany,
  DeleteConfirmModal,
  duplicateCompany,
  DuplicateConfirmModal,
  EditModal,
  updateCompany,
  ViewModal,
} from './src';
import { createCompanyFromBrasilAPI } from './src/utils/create-from-brasilapi';

// Funcao auxiliar para truncar texto
const truncateText = (
  text: string | null | undefined,
  maxLength: number = 15
): string => {
  if (!text) return '—';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default function CompaniesPage() {
  const router = useRouter();
  const [isCnpjModalOpen, setIsCnpjModalOpen] = useState(false);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Company>({
    entityName: 'Company',
    entityNamePlural: 'Companies',
    queryKey: ['companies'],
    baseUrl: '/api/v1/hr/companies',
    listFn: async () => {
      try {
        const response = await companiesApi.list({
          perPage: 100,
          includeDeleted: false,
        });
        console.log('[Companies] API response:', response);

        // A resposta pode ser um array direto ou um objeto com propriedade 'companies'
        let companies = Array.isArray(response)
          ? response
          : response.companies || [];

        // Filtrar empresas deletadas no frontend como camada extra de seguranca
        companies = companies.filter((company: Company) => !company.deletedAt);

        console.log(
          '[Companies] Total companies (apos filtro):',
          companies.length
        );
        return companies;
      } catch (error) {
        console.error('[Companies] Error fetching companies:', error);
        throw error;
      }
    },
    getFn: (id: string) => companiesApi.get(id),
    createFn: createCompany,
    updateFn: updateCompany,
    deleteFn: deleteCompany,
    duplicateFn: duplicateCompany,
    onDeleteSuccess: id => {
      console.log('[Companies CRUD] Delete success callback for ID:', id);
    },
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Company>({
    entityName: 'Company',
    entityNamePlural: 'Companies',
    queryKey: ['companies'],
    crud,
    viewRoute: id => `/hr/companies/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      const legal = item.legalName?.toLowerCase() || '';
      const trade = item.tradeName?.toLowerCase() || '';
      const cnpj = item.cnpj?.toLowerCase() || '';
      return [legal, trade, cnpj].some(value => value.includes(q));
    },
    duplicateConfig: {
      getNewName: item => `${item.legalName} (Copia)`,
      getData: item => ({
        legalName: `${item.legalName} (Copia)`,
        tradeName: item.tradeName ? `${item.tradeName} (Copia)` : null,
        cnpj: item.cnpj,
        status: item.status,
      }),
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) =>
    page.handlers.handleItemsView(ids);
  const handleContextEdit = (ids: string[]) =>
    page.handlers.handleItemsEdit(ids);
  const handleContextDuplicate = (ids: string[]) =>
    page.handlers.handleItemsDuplicate(ids);
  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.open('delete');
  };

  // Opcoes customizadas de ordenacao
  const sortOptions = useMemo(
    () => [
      {
        field: 'custom' as const,
        direction: 'asc' as const,
        label: 'Razao Social (A-Z)',
        icon: ArrowDownAZ,
      },
      {
        field: 'custom' as const,
        direction: 'desc' as const,
        label: 'Razao Social (Z-A)',
        icon: ArrowDownAZ,
      },
      {
        field: 'createdAt' as const,
        direction: 'desc' as const,
        label: 'Mais recentes',
        icon: Calendar,
      },
      {
        field: 'createdAt' as const,
        direction: 'asc' as const,
        label: 'Mais antigos',
        icon: Calendar,
      },
      {
        field: 'updatedAt' as const,
        direction: 'desc' as const,
        label: 'Ultima atualizacao',
        icon: Clock,
      },
    ],
    []
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Company, isSelected: boolean) => {
    const departmentsCount = item._count?.departments ?? 0;
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
          title={truncateText(item.tradeName, 15)}
          subtitle={formatCNPJ(item.cnpj)}
          icon={Building2}
          iconBgColor="bg-linear-to-br from-emerald-500 to-teal-600"
          badges={[
            ...(departmentsCount > 0
              ? [
                  {
                    label: `${departmentsCount} departamento${departmentsCount > 1 ? 's' : ''}`,
                    variant: 'outline' as const,
                    icon: Building2,
                  },
                ]
              : []),
            ...(employeesCount > 0
              ? [
                  {
                    label: `${employeesCount} funcionario${employeesCount > 1 ? 's' : ''}`,
                    variant: 'secondary' as const,
                    icon: Users,
                  },
                ]
              : []),
            {
              label:
                item.status === 'ACTIVE'
                  ? 'Ativa'
                  : item.status === 'INACTIVE'
                    ? 'Inativa'
                    : 'Suspensa',
              variant: item.status === 'ACTIVE' ? 'default' : 'secondary',
            },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  Criada em {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <RefreshCcwDot className="h-3 w-3 text-yellow-500" />
                  Atualizada em {new Date(item.updatedAt).toLocaleDateString()}
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
        >
          {item.legalName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.legalName}
            </p>
          )}
        </UniversalCard>
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: Company, isSelected: boolean) => {
    const departmentsCount = item._count?.departments ?? 0;
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
          title={item.tradeName || '—'}
          subtitle={formatCNPJ(item.cnpj)}
          icon={Building2}
          iconBgColor="bg-linear-to-br from-emerald-500 to-teal-600"
          badges={[
            ...(departmentsCount > 0
              ? [
                  {
                    label: `${departmentsCount} departamento${departmentsCount > 1 ? 's' : ''}`,
                    variant: 'outline' as const,
                    icon: Building2,
                  },
                ]
              : []),
            ...(employeesCount > 0
              ? [
                  {
                    label: `${employeesCount} funcionario${employeesCount > 1 ? 's' : ''}`,
                    variant: 'secondary' as const,
                    icon: Users,
                  },
                ]
              : []),
            {
              label:
                item.status === 'ACTIVE'
                  ? 'Ativa'
                  : item.status === 'INACTIVE'
                    ? 'Inativa'
                    : 'Suspensa',
              variant: item.status === 'ACTIVE' ? 'default' : 'secondary',
            },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  Criada em {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <span className="flex items-center gap-1 ">
                  <RefreshCcwDot className="h-3 w-3 text-yellow-500" />
                  Atualizada em {new Date(item.updatedAt).toLocaleDateString()}
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
        >
          {item.legalName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.legalName}
            </p>
          )}
        </UniversalCard>
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
    setIsCnpjModalOpen(true);
  }, []);

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'import-companies',
        title: 'Importar',
        icon: Upload,
        onClick: () => router.push('/import/hr/companies'),
        variant: 'outline',
      },
      {
        id: 'create-company',
        title: 'Nova Empresa',
        icon: Plus,
        onClick: handleCreate,
        variant: 'default',
      },
    ],
    [router, handleCreate]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'companies',
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
            title="Empresas"
            description="Gerencie dados cadastrais das empresas"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            placeholder={companiesConfig.display.labels.searchPlaceholder}
            value={page.searchQuery}
            onSearch={value => page.setSearchQuery(value)}
            showClear={true}
            size="md"
          />

          {/* Grid */}
          {page.isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : page.error ? (
            <GridError
              type="server"
              title="Erro ao carregar empresas"
              message="Ocorreu um erro ao tentar carregar as empresas. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={companiesConfig}
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
              defaultSortField="custom"
              defaultSortDirection="asc"
              customSortOptions={sortOptions}
              customSortFn={(a, b, direction) => {
                const multiplier = direction === 'asc' ? 1 : -1;
                const nameA = a.legalName?.toLowerCase() ?? '';
                const nameB = b.legalName?.toLowerCase() ?? '';
                return nameA.localeCompare(nameB, 'pt-BR') * multiplier;
              }}
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
            company={page.modals.viewingItem}
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
            company={page.modals.editingItem}
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

          {/* CNPJ Lookup Modal */}
          <CNPJLookupModal
            isOpen={isCnpjModalOpen}
            onClose={() => setIsCnpjModalOpen(false)}
            onImport={async (brasilData: BrasilAPICompanyData) => {
              try {
                const company = await createCompanyFromBrasilAPI(brasilData);
                toast.success(
                  `Empresa "${company.legalName}" criada com sucesso!`
                );

                // Fechar modal e atualizar listagem
                setIsCnpjModalOpen(false);
                await crud.refetch();
                page.setSearchQuery(''); // Limpar busca para ver a nova empresa
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : 'Erro ao criar empresa';
                toast.error(message);
              }
            }}
            onCreateManually={() => {
              setIsCnpjModalOpen(false);
              page.modals.open('create');
            }}
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
