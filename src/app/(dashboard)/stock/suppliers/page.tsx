/**
 * OpenSea OS - Suppliers Page
 * Listagem e gerenciamento dos fornecedores
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
import type { BrasilAPICompanyData } from '@/types/brasilapi';
import type { Supplier } from '@/types/stock';
import {
  ArrowDownAZ,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Globe,
  Plus,
  RefreshCcwDot,
  Star,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CNPJLookupModal,
  createSupplier,
  CreateModal,
  deleteSupplier,
  DeleteConfirmModal,
  duplicateSupplier,
  DuplicateConfirmModal,
  EditModal,
  suppliersApi,
  suppliersConfig,
  updateSupplier,
  ViewModal,
} from './src';

export default function SuppliersPage() {
  const router = useRouter();
  const [cnpjLookupOpen, setCnpjLookupOpen] = useState(false);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Supplier>({
    entityName: 'Supplier',
    entityNamePlural: 'Suppliers',
    queryKey: ['suppliers'],
    baseUrl: '/api/v1/suppliers',
    listFn: async () => {
      try {
        const response = await suppliersApi.list();

        let suppliers = Array.isArray(response)
          ? response
          : response.suppliers || [];

        suppliers = suppliers.filter(
          (supplier: Supplier) => !supplier.deletedAt
        );

        return suppliers;
      } catch (error) {
        throw error;
      }
    },
    getFn: (id: string) => suppliersApi.get(id),
    createFn: createSupplier,
    updateFn: updateSupplier,
    deleteFn: deleteSupplier,
    duplicateFn: duplicateSupplier,
    onDeleteSuccess: () => {
      // Deleted successfully
    },
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Supplier>({
    entityName: 'Supplier',
    entityNamePlural: 'Suppliers',
    queryKey: ['suppliers'],
    crud,
    viewRoute: id => `/stock/suppliers/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      const name = item.name?.toLowerCase() || '';
      const cnpj = item.cnpj?.toLowerCase() || '';
      const email = item.email?.toLowerCase() || '';
      return [name, cnpj, email].some(value => value.includes(q));
    },
    duplicateConfig: {
      getNewName: item => `${item.name} (Copia)`,
      getData: item => ({
        name: `${item.name} (Copia)`,
        country: item.country,
        isActive: item.isActive,
      }),
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const sortOptions = useMemo(
    () => [
      {
        field: 'custom' as const,
        direction: 'asc' as const,
        label: 'Nome (A-Z)',
        icon: ArrowDownAZ,
      },
      {
        field: 'custom' as const,
        direction: 'desc' as const,
        label: 'Nome (Z-A)',
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

  const handleCnpjImport = useCallback(
    async (data: BrasilAPICompanyData) => {
      try {
        const supplierData: Partial<Supplier> = {
          name: data.nome_fantasia || data.razao_social,
          cnpj: data.cnpj,
          email: data.email || undefined,
          phone: data.ddd_telefone_1 || undefined,
          addressLine1: `${data.descricao_tipo_de_logradouro} ${data.logradouro}, ${data.numero}`,
          addressLine2: data.complemento || undefined,
          city: data.municipio,
          state: data.uf,
          postalCode: data.cep,
          country: 'Brasil',
          isActive: true,
        };

        const supplier = await createSupplier(supplierData);
        toast.success(`Fornecedor "${supplier.name}" criado com sucesso!`);

        setCnpjLookupOpen(false);
        await crud.refetch();
        page.setSearchQuery('');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao criar fornecedor';
        toast.error(message);
      }
    },
    [crud, page]
  );

  const handleCreateManually = useCallback(() => {
    setCnpjLookupOpen(false);
    page.modals.open('create');
  }, [page.modals]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: Supplier, isSelected: boolean) => {
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
          subtitle={item.cnpj || '-'}
          icon={Truck}
          iconBgColor="bg-linear-to-br from-amber-500 to-orange-600"
          badges={[
            ...(item.rating
              ? [
                  {
                    label: `${item.rating}/5`,
                    variant: 'outline' as const,
                    icon: Star,
                  },
                ]
              : []),
            ...(item.website
              ? [
                  {
                    label: 'Website',
                    variant: 'secondary' as const,
                    icon: Globe,
                  },
                ]
              : []),
            ...(item.notes
              ? [
                  {
                    label: 'Notas',
                    variant: 'secondary' as const,
                    icon: FileText,
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

  const renderListCard = (item: Supplier, isSelected: boolean) => {
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
          subtitle={item.cnpj || '-'}
          icon={Truck}
          iconBgColor="bg-linear-to-br from-amber-500 to-orange-600"
          badges={[
            ...(item.rating
              ? [
                  {
                    label: `${item.rating}/5`,
                    variant: 'outline' as const,
                    icon: Star,
                  },
                ]
              : []),
            ...(item.website
              ? [
                  {
                    label: 'Website',
                    variant: 'secondary' as const,
                    icon: Globe,
                  },
                ]
              : []),
            ...(item.notes
              ? [
                  {
                    label: 'Notas',
                    variant: 'secondary' as const,
                    icon: FileText,
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

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'create-supplier',
        title: 'Novo Fornecedor',
        icon: Plus,
        onClick: () => setCnpjLookupOpen(true),
        variant: 'default',
      },
    ],
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'suppliers',
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
            title="Fornecedores"
            description="Gerencie os fornecedores de produtos"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            placeholder={suppliersConfig.display.labels.searchPlaceholder}
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
              title="Erro ao carregar fornecedores"
              message="Ocorreu um erro ao tentar carregar os fornecedores. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={suppliersConfig}
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
                const nameA = a.name?.toLowerCase() ?? '';
                const nameB = b.name?.toLowerCase() ?? '';
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

          {/* CNPJ Lookup Modal */}
          <CNPJLookupModal
            isOpen={cnpjLookupOpen}
            onClose={() => setCnpjLookupOpen(false)}
            onImport={handleCnpjImport}
            onCreateManually={handleCreateManually}
          />

          {/* View Modal */}
          <ViewModal
            isOpen={page.modals.isOpen('view')}
            onClose={() => page.modals.close('view')}
            supplier={page.modals.viewingItem}
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
            supplier={page.modals.editingItem}
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
