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
import { Badge } from '@/components/ui/badge';
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
} from '@/core';
import type { ContextMenuAction } from '@/core/components/entity-context-menu';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PPEItem } from '@/types/hr';
import {
  AlertTriangle,
  ExternalLink,
  HardHat,
  Loader2,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ppeConfig,
  useListPPEItems,
  useDeletePPEItem,
  getCategoryLabel,
  getStockVariant,
  PPE_CATEGORIES,
  PPE_CATEGORY_COLORS,
  type PPEItemFilters,
} from './src';

import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { HRSelectionToolbar } from '../../_shared/components/hr-selection-toolbar';

const CreatePPEItemModal = dynamic(
  () =>
    import('./src/modals/create-ppe-item-modal').then(m => ({
      default: m.CreatePPEItemModal,
    })),
  { ssr: false }
);

export default function PPEPage() {
  const router = useRouter();
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  // Permissions
  const canView = hasPermission(HR_PERMISSIONS.PPE.VIEW);
  const canCreate = hasPermission(HR_PERMISSIONS.PPE.CREATE);
  const canDelete = hasPermission(HR_PERMISSIONS.PPE.DELETE);

  // ============================================================================
  // FILTERS
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterLowStock, setFilterLowStock] = useState('');

  const queryParams = useMemo<PPEItemFilters>(() => {
    const params: PPEItemFilters = {};
    if (filterCategory) params.category = filterCategory;
    if (filterActive) params.isActive = filterActive;
    if (filterLowStock) params.lowStockOnly = filterLowStock;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [filterCategory, filterActive, filterLowStock, searchQuery]);

  // ============================================================================
  // DATA
  // ============================================================================

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListPPEItems(queryParams);
  const deleteMutation = useDeletePPEItem();

  const ppeItems = useMemo(
    () => data?.pages.flatMap(p => p.ppeItems ?? []) ?? [],
    [data]
  );

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ============================================================================
  // STATE
  // ============================================================================

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const initialIds = useMemo(() => ppeItems.map(i => i.id), [ppeItems]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDeleteRequest = useCallback((ids: string[]) => {
    if (ids.length > 0) {
      setDeleteTarget(ids[0]);
      setIsDeleteOpen(true);
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
      setIsDeleteOpen(false);
    } catch {
      // Toast handled by mutation
    }
  }, [deleteTarget, deleteMutation]);

  // ============================================================================
  // CONTEXT MENU ACTIONS
  // ============================================================================

  const contextActions: ContextMenuAction[] = useMemo(() => {
    const actions: ContextMenuAction[] = [];

    if (canView) {
      actions.push({
        id: 'open',
        label: 'Abrir',
        icon: ExternalLink,
        onClick: (ids: string[]) => {
          if (ids.length > 0) router.push(`/hr/ppe/${ids[0]}`);
        },
      });
    }

    if (canDelete) {
      actions.push({
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: handleDeleteRequest,
        variant: 'destructive',
        separator: 'before',
      });
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, canDelete]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderStockBadge = (item: PPEItem) => {
    const variant = getStockVariant(item.isLowStock, item.currentStock);
    return (
      <Badge variant={variant} className="text-xs">
        {item.currentStock <= 0 ? (
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Sem estoque
          </span>
        ) : item.isLowStock ? (
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Estoque baixo: {item.currentStock}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            Estoque: {item.currentStock}
          </span>
        )}
      </Badge>
    );
  };

  const renderGridCard = (item: PPEItem, isSelected: boolean) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={
          canView
            ? (ids: string[]) => {
                if (ids.length > 0) router.push(`/hr/ppe/${ids[0]}`);
              }
            : undefined
        }
        actions={contextActions}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.name}
          subtitle={item.caNumber ? `CA ${item.caNumber}` : undefined}
          icon={HardHat}
          iconBgColor="bg-linear-to-br from-sky-500 to-sky-600"
          badges={[
            {
              label: item.isActive ? 'Ativo' : 'Inativo',
              variant: item.isActive ? 'default' : 'secondary',
            },
          ]}
          metadata={
            <div className="flex flex-col gap-1.5">
              <span
                className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PPE_CATEGORY_COLORS[item.category]}`}
              >
                {getCategoryLabel(item.category)}
              </span>
              {renderStockBadge(item)}
              {item.manufacturer && (
                <span className="text-xs text-muted-foreground">
                  {item.manufacturer}
                  {item.model ? ` · ${item.model}` : ''}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={true}
          clickable
          onClick={() => router.push(`/hr/ppe/${item.id}`)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: PPEItem, isSelected: boolean) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={
          canView
            ? (ids: string[]) => {
                if (ids.length > 0) router.push(`/hr/ppe/${ids[0]}`);
              }
            : undefined
        }
        actions={contextActions}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.name}
          subtitle={item.caNumber ? `CA ${item.caNumber}` : undefined}
          icon={HardHat}
          iconBgColor="bg-linear-to-br from-sky-500 to-sky-600"
          badges={[
            {
              label: item.isActive ? 'Ativo' : 'Inativo',
              variant: item.isActive ? 'default' : 'secondary',
            },
          ]}
          metadata={
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PPE_CATEGORY_COLORS[item.category]}`}
              >
                {getCategoryLabel(item.category)}
              </span>
              {renderStockBadge(item)}
              {item.manufacturer && (
                <span className="text-xs text-muted-foreground">
                  {item.manufacturer}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={true}
          clickable
          onClick={() => router.push(`/hr/ppe/${item.id}`)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        />
      </EntityContextMenu>
    );
  };

  // ============================================================================
  // HEADER BUTTONS
  // ============================================================================

  const handleOpenCreate = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const actionButtons: HeaderButton[] = useMemo(() => {
    const buttons: HeaderButton[] = [];
    if (canCreate) {
      buttons.push({
        id: 'create-ppe',
        title: 'Novo EPI',
        icon: Plus,
        onClick: handleOpenCreate,
        variant: 'default',
      });
    }
    return buttons;
  }, [canCreate, handleOpenCreate]);

  // ============================================================================
  // FILTERS UI
  // ============================================================================

  const hasActiveFilters = filterCategory || filterActive || filterLowStock;

  const clearFilters = useCallback(() => {
    setFilterCategory('');
    setFilterActive('');
    setFilterLowStock('');
  }, []);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingPermissions) {
    return (
      <PageLayout>
        <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'ppe-items',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'EPI', href: '/hr/ppe' },
            ]}
            buttons={actionButtons}
          />

          <Header
            title="Equipamentos de Proteção Individual"
            description="Gerencie os EPIs, estoque e atribuições aos colaboradores"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            placeholder={ppeConfig.display.labels.searchPlaceholder}
            onSearch={value => setSearchQuery(value)}
            onClear={() => setSearchQuery('')}
            showClear={true}
            size="md"
          />

          {/* Grid */}
          {isLoading ? (
            <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
          ) : error ? (
            <GridError
              type="server"
              title="Erro ao carregar EPIs"
              message="Ocorreu um erro ao tentar carregar os equipamentos. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => {
                  refetch();
                },
              }}
            />
          ) : (
            <>
              <EntityGrid
                config={ppeConfig}
                items={ppeItems}
                renderGridItem={renderGridCard}
                renderListItem={renderListCard}
                isLoading={isLoading}
                isSearching={!!searchQuery}
                onItemDoubleClick={item => {
                  if (canView) {
                    router.push(`/hr/ppe/${item.id}`);
                  }
                }}
                showSorting={true}
                defaultSortField="name"
                defaultSortDirection="asc"
                toolbarStart={
                  <>
                    <Select
                      value={filterCategory || 'ALL'}
                      onValueChange={v =>
                        setFilterCategory(v === 'ALL' ? '' : v)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-52">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todas as Categorias</SelectItem>
                        {PPE_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {getCategoryLabel(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterActive || 'ALL'}
                      onValueChange={v => setFilterActive(v === 'ALL' ? '' : v)}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="true">Ativos</SelectItem>
                        <SelectItem value="false">Inativos</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterLowStock || 'ALL'}
                      onValueChange={v =>
                        setFilterLowStock(v === 'ALL' ? '' : v)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Estoque" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todo Estoque</SelectItem>
                        <SelectItem value="true">Estoque Baixo</SelectItem>
                      </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10"
                        onClick={clearFilters}
                      >
                        Limpar filtros
                      </Badge>
                    )}
                  </>
                }
              />
              <div ref={sentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          )}

          {/* Create Modal */}
          <CreatePPEItemModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
          />

          {/* Delete Confirmation */}
          <VerifyActionPinModal
            isOpen={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setDeleteTarget(null);
            }}
            onSuccess={handleDeleteConfirm}
            title="Excluir EPI"
            description="Digite seu PIN de ação para excluir este equipamento de proteção. Esta ação não pode ser desfeita."
          />

          <HRSelectionToolbar
            totalItems={ppeItems.length}
            defaultActions={{
              delete: canDelete,
            }}
            handlers={{
              onDelete: async (ids: string[]) => {
                for (const id of ids) {
                  await deleteMutation.mutateAsync(id);
                }
              },
            }}
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
