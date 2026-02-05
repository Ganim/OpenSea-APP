/**
 * OpenSea OS - Manufacturers Page
 * Página de gerenciamento de fabricantes usando o novo sistema OpenSea OS
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import ItemCard from '@/core/components/item-card';
import type { BrasilAPICompanyData } from '@/types/brasilapi';
import type { Manufacturer } from '@/types/stock';
import { productsService } from '@/services/stock';
import type { Product } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Factory,
  Globe,
  Package,
  Plus,
  RefreshCcwDot,
  Star,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CNPJLookupModal,
  createManufacturer,
  CreateModal,
  deleteManufacturer,
  DeleteConfirmModal,
  duplicateManufacturer,
  DuplicateConfirmModal,
  manufacturersApi,
  manufacturersConfig,
  RenameModal,
  updateManufacturer,
  ViewModal,
} from './src';

const MAX_NAME_LENGTH = 18;

/**
 * Get the display name for a manufacturer
 * Returns uppercase and truncated version
 */
function getDisplayName(manufacturer: Manufacturer): {
  displayName: string;
  fullName: string;
  isTruncated: boolean;
} {
  const fullName = (manufacturer.name || '').toUpperCase();
  const isTruncated = fullName.length > MAX_NAME_LENGTH;
  const displayName = isTruncated
    ? `${fullName.slice(0, MAX_NAME_LENGTH)}...`
    : fullName;

  return { displayName, fullName, isTruncated };
}

export default function ManufacturersPage() {
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  const [cnpjLookupOpen, setCnpjLookupOpen] = useState(false);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<Manufacturer>({
    entityName: 'Manufacturer',
    entityNamePlural: 'Manufacturers',
    queryKey: ['manufacturers'],
    baseUrl: '/api/v1/manufacturers',
    listFn: async () => {
      try {
        const response = await manufacturersApi.list();
        console.log('[Manufacturers] API response:', response);

        let manufacturers = Array.isArray(response)
          ? response
          : response.manufacturers || [];

        manufacturers = manufacturers.filter(
          (manufacturer: Manufacturer) => !manufacturer.deletedAt
        );

        console.log(
          '[Manufacturers] Total manufacturers (after filter):',
          manufacturers.length
        );
        return manufacturers;
      } catch (error) {
        console.error('[Manufacturers] Error fetching manufacturers:', error);
        throw error;
      }
    },
    getFn: (id: string) => manufacturersApi.get(id),
    createFn: createManufacturer,
    updateFn: updateManufacturer,
    deleteFn: deleteManufacturer,
    duplicateFn: duplicateManufacturer,
    onDeleteSuccess: id => {
      console.log('[Manufacturers CRUD] Delete success callback for ID:', id);
    },
  });

  // ============================================================================
  // PRODUCT COUNTS
  // ============================================================================

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products-for-manufacturer-counts'],
    queryFn: async () => {
      const response = await productsService.listProducts();
      return response.products || [];
    },
  });

  const productCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      if (product.manufacturerId) {
        map.set(product.manufacturerId, (map.get(product.manufacturerId) || 0) + 1);
      }
    }
    return map;
  }, [products]);

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<Manufacturer>({
    entityName: 'Manufacturer',
    entityNamePlural: 'Manufacturers',
    queryKey: ['manufacturers'],
    crud,
    viewRoute: id => `/stock/manufacturers/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      const name = item.name?.toLowerCase() || '';
      const country = item.country?.toLowerCase() || '';
      const email = item.email?.toLowerCase() || '';
      return [name, country, email].some(value => value.includes(q));
    },
    duplicateConfig: {
      getNewName: item => `${item.name} (Cópia)`,
      getData: item => ({
        name: `${item.name} (Cópia)`,
        country: item.country,
        isActive: item.isActive,
      }),
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) =>
    page.handlers.handleItemsView(ids);

  const handleContextRename = (ids: string[]) =>
    page.handlers.handleItemsEdit(ids);

  const handleContextDuplicate = (ids: string[]) =>
    page.handlers.handleItemsDuplicate(ids);

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.open('delete');
  };

  // Handle CNPJ lookup import - cria diretamente
  const handleCnpjImport = useCallback(
    async (data: BrasilAPICompanyData) => {
      try {
        // Convert BrasilAPI data to Manufacturer format
        const manufacturerData: Partial<Manufacturer> = {
          name: data.nome_fantasia || data.razao_social,
          legalName: data.razao_social || undefined,
          cnpj: data.cnpj || undefined,
          email: data.email || undefined,
          phone: data.ddd_telefone_1 || undefined,
          website: undefined,
          addressLine1: `${data.descricao_tipo_de_logradouro} ${data.logradouro}, ${data.numero}`,
          addressLine2: data.complemento || undefined,
          city: data.municipio,
          state: data.uf,
          postalCode: data.cep,
          country: 'Brasil',
          isActive: true,
        };

        const manufacturer = await createManufacturer(manufacturerData);
        const displayName = manufacturer.name;
        toast.success(`Fabricante "${displayName}" criado com sucesso!`);

        // Fechar modal e atualizar listagem
        setCnpjLookupOpen(false);
        await crud.refetch();
        page.handlers.handleSearch('');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erro ao criar fabricante';
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
        label: 'Última atualização',
        icon: Clock,
      },
    ],
    []
  );

  const renderGridCard = (item: Manufacturer, isSelected: boolean) => {
    const { displayName, fullName, isTruncated } = getDisplayName(item);
    const productCount = productCountMap.get(item.id) || 0;

    const cardContent = (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextRename}
        labels={{ edit: 'Renomear' }}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <ItemCard
          id={item.id}
          variant="grid"
          title={displayName}
          subtitle={item.country || '—'}
          icon={Factory}
          iconBgColor="bg-linear-to-br from-violet-500 to-purple-600"
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
          footer={
            <Link href={`/stock/products?manufacturer=${item.id}`}>
              <button className="w-full flex items-center justify-between px-3 py-4 text-xs font-medium text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded-b-xl transition-colors cursor-pointer bg-emerald-600 hover:bg-emerald-700">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{productCount} {productCount === 1 ? 'produto' : 'produtos'}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
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

    // Wrap in tooltip if name is truncated
    if (isTruncated) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">{fullName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return cardContent;
  };

  const renderListCard = (item: Manufacturer, isSelected: boolean) => {
    const { displayName, fullName, isTruncated } = getDisplayName(item);
    const productCount = productCountMap.get(item.id) || 0;

    const cardContent = (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextRename}
        labels={{ edit: 'Renomear' }}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="list"
          title={displayName}
          subtitle={item.country || '—'}
          icon={Factory}
          iconBgColor="bg-linear-to-br from-violet-500 to-purple-600"
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
          footer={
            <Link href={`/stock/products?manufacturer=${item.id}`}>
              <button className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950 rounded transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{productCount} {productCount === 1 ? 'produto' : 'produtos'}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
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

    // Wrap in tooltip if name is truncated
    if (isTruncated) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">{fullName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return cardContent;
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
    router.push('/import/stock/manufacturers');
  }, [router]);

  const handleCreate = useCallback(() => {
    setCnpjLookupOpen(true);
  }, []);

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'import-manufacturers',
        title: 'Importar',
        icon: Upload,
        onClick: handleImport,
        variant: 'outline',
      },
      {
        id: 'create-manufacturer',
        title: 'Novo Fabricante',
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
        namespace: 'manufacturers',
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
            title="Fabricantes"
            description="Gerencie os fabricantes de produtos"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            value={page.searchQuery}
            placeholder={manufacturersConfig.display.labels.searchPlaceholder}
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
              title="Erro ao carregar fabricantes"
              message="Ocorreu um erro ao tentar carregar os fabricantes. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={manufacturersConfig}
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
                duplicate: true,
                delete: true,
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
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
            manufacturer={page.modals.viewingItem}
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

          {/* Rename Modal */}
          <RenameModal
            isOpen={page.modals.isOpen('edit')}
            onClose={() => page.modals.close('edit')}
            manufacturer={page.modals.editingItem}
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
