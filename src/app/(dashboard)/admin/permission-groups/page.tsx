/**
 * OpenSea OS - Permission Groups Page
 * Página de gerenciamento de grupos de permissões usando o novo sistema OpenSea OS
 */

'use client';

import { ADMIN_PERMISSIONS } from '@/app/(dashboard)/admin/_shared/constants';
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
import { AccessDenied } from '@/components/rbac/access-denied';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { usePermissions } from '@/hooks/use-permissions';
import type { PermissionGroup } from '@/types/rbac';
import { ArrowLeft, Calendar, Clock, Plus, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  CreateModal,
  createPermissionGroup,
  deletePermissionGroup,
  DetailModal,
  getPermissionGroup,
  getStatusBadgeVariant,
  getStatusLabel,
  getTypeBadgeVariant,
  getTypeLabel,
  listPermissionGroups,
  permissionGroupsConfig,
  updatePermissionGroup,
} from './src';

export default function PermissionGroupsPage() {
  const router = useRouter();
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  // Verificar se o usuário tem permissão para gerenciar grupos de permissões
  const canManageGroups =
    hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.MANAGE) ||
    hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.LIST);

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<PermissionGroup>({
    entityName: 'Grupo de Permissões',
    entityNamePlural: 'Grupos de Permissões',
    queryKey: ['permission-groups'],
    baseUrl: '/v1/rbac/permission-groups',
    listFn: listPermissionGroups,
    getFn: getPermissionGroup,
    createFn: async (data: Record<string, unknown>) => {
      return createPermissionGroup(data as Partial<PermissionGroup>);
    },
    updateFn: async (id, data: Record<string, unknown>) => {
      return updatePermissionGroup(id, data as Partial<PermissionGroup>);
    },
    deleteFn: deletePermissionGroup,
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<PermissionGroup>({
    entityName: 'Grupo de Permissões',
    entityNamePlural: 'Grupos de Permissões',
    queryKey: ['permission-groups'],
    crud,
    viewRoute: id => `/admin/permission-groups/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return Boolean(
        item.name?.toLowerCase().includes(q) ||
          item.slug?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
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
    page.handlers.handleItemsEdit(ids);
  };

  const handleContextDuplicate = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      for (const id of ids) {
        const original = page.filteredItems.find(item => item.id === id);
        if (original) {
          await createPermissionGroup({
            name: `${original.name} (cópia)`,
            description: original.description,
            priority: original.priority,
            color: original.color,
            parentId: original.parentId,
          });
        }
      }
      page.crud.refetch();
    } catch (error) {
      console.error('Erro ao duplicar grupo:', error);
    }
  };

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.close('view');
    page.modals.open('delete');
  };

  const handleDoubleClick = (itemId: string) => {
    router.push(`/admin/permission-groups/${itemId}`);
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: PermissionGroup, isSelected: boolean) => {
    const usersCount = item.usersCount || 0;
    const permissionsCount = item.permissionsCount || 0;

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
          title={item.name || 'N/A'}
          subtitle={item.description || 'Sem descrição'}
          icon={Shield}
          iconBgColor={
            item.color || 'bg-linear-to-br from-purple-500 to-pink-600'
          }
          badges={[
            {
              label: getTypeLabel(item.isSystem),
              variant: getTypeBadgeVariant(item.isSystem),
            },
            {
              label: getStatusLabel(item.isActive),
              variant: getStatusBadgeVariant(item.isActive),
            },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {usersCount} usuário{usersCount !== 1 ? 's' : ''}
              </span>
              <span>
                {permissionsCount} permiss
                {permissionsCount !== 1 ? 'ões' : 'ão'}
              </span>
              {item.updatedAt && (
                <span>
                  Atualizado: {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
          showStatusBadges={true}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: PermissionGroup, isSelected: boolean) => {
    const usersCount = item.usersCount || 0;
    const permissionsCount = item.permissionsCount || 0;

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
          title={item.name || 'N/A'}
          subtitle={item.description || 'Sem descrição'}
          icon={Shield}
          iconBgColor={
            item.color || 'bg-linear-to-br from-purple-500 to-pink-600'
          }
          badges={[
            {
              label: getTypeLabel(item.isSystem),
              variant: getTypeBadgeVariant(item.isSystem),
            },
            {
              label: getStatusLabel(item.isActive),
              variant: getStatusBadgeVariant(item.isActive),
            },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {usersCount} usuário{usersCount !== 1 ? 's' : ''}
              </span>
              <span>
                {permissionsCount} permiss
                {permissionsCount !== 1 ? 'ões' : 'ão'}
              </span>
              {item.updatedAt && (
                <span>
                  Atualizado: {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
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

  const sortOptions = useMemo(
    () => [
      {
        field: 'name' as const,
        direction: 'asc' as const,
        label: 'Nome (A-Z)',
        icon: Shield,
      },
      {
        field: 'name' as const,
        direction: 'desc' as const,
        label: 'Nome (Z-A)',
        icon: Shield,
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

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const handleCreate = useCallback(() => {
    page.modals.open('create');
  }, [page.modals]);

  const actionButtons: HeaderButton[] = useMemo(
    () =>
      hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.CREATE)
        ? [
            {
              id: 'create-group',
              title: 'Novo Grupo',
              icon: Plus,
              onClick: handleCreate,
              variant: 'default',
            },
          ]
        : [],
    [handleCreate, hasPermission]
  );

  // ============================================================================
  // LOADING / ACCESS CHECK
  // ============================================================================

  if (isLoadingPermissions) {
    return (
      <PageLayout>
        <GridLoading count={9} layout="grid" size="md" gap="gap-4" />
      </PageLayout>
    );
  }

  if (!canManageGroups) {
    return (
      <AccessDenied
        title="Acesso Restrito"
        message="Você não tem permissão para gerenciar grupos de permissões."
      />
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'permission-groups',
        initialIds,
      }}
    >
      <PageLayout>
        <PageHeader>
          <PageActionBar
            buttons={actionButtons}
            onBack={() => router.back()}
            backLabel="Administração"
            backIcon={ArrowLeft}
          />

          <Header
            title="Grupos de Permissões"
            description="Gerencie grupos de permissões e suas atribuições"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            value={page.searchQuery}
            placeholder={
              permissionGroupsConfig.display.labels.searchPlaceholder
            }
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
              title="Erro ao carregar grupos"
              message="Ocorreu um erro ao tentar carregar os grupos de permissões. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={permissionGroupsConfig}
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
              customSortOptions={sortOptions}
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
                edit: hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.UPDATE),
                delete: hasPermission(
                  ADMIN_PERMISSIONS.PERMISSION_GROUPS.DELETE
                ),
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
                onEdit: page.handlers.handleItemsEdit,
                onDelete: page.handlers.handleItemsDelete,
              }}
            />
          )}

          {/* Detail Modal */}
          <DetailModal
            group={page.modals.viewingItem}
            open={page.modals.isOpen('view')}
            onOpenChange={open => {
              if (!open) page.modals.close('view');
            }}
          />

          {/* Create Modal */}
          <CreateModal
            open={page.modals.isOpen('create')}
            onOpenChange={() => page.modals.close('create')}
            onSuccess={() => {
              page.crud.refetch();
              page.modals.close('create');
            }}
          />

          {/* Delete Confirmation */}
          {page.modals.isOpen('delete') && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <Card className="w-full max-w-md p-6">
                <h2 className="text-lg font-semibold mb-2">Excluir Grupo(s)</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {`Tem certeza de que deseja excluir ${page.modals.itemsToDelete.length} grupo(s)? Esta ação não pode ser desfeita.`}
                </p>
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => page.modals.close('delete')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      page.handlers.handleDeleteConfirm();
                    }}
                    disabled={crud.isDeleting}
                  >
                    {crud.isDeleting ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
