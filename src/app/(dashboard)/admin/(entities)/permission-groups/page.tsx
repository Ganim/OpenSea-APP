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
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import type { ContextMenuAction } from '@/core/components/entity-context-menu';
import { usePermissions } from '@/hooks/use-permissions';
import { logger } from '@/lib/logger';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import type { PermissionGroup } from '@/types/rbac';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import {
  Calendar,
  Clock,
  Palette,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  ColorModal,
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
  ManagePermissionsModal,
  permissionGroupsConfig,
  RenameModal,
  updatePermissionGroup,
} from './src';

export default function PermissionGroupsPage() {
  const router = useRouter();
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  // Permissões granulares
  const canView = hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.VIEW);
  const canEdit = hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.UPDATE);
  const canCreate = hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.CREATE);
  const canDelete = hasPermission(ADMIN_PERMISSIONS.PERMISSION_GROUPS.DELETE);

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
  // MODAL STATE
  // ============================================================================

  const [renameGroup, setRenameGroup] = useState<PermissionGroup | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isRenameSubmitting, setIsRenameSubmitting] = useState(false);

  const [permissionsGroup, setPermissionsGroup] =
    useState<PermissionGroup | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  const [colorGroup, setColorGroup] = useState<PermissionGroup | null>(null);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isColorSubmitting, setIsColorSubmitting] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) => {
    page.handlers.handleItemsView(ids);
  };

  const handleContextRename = (ids: string[]) => {
    if (ids.length === 0) return;
    const group = page.filteredItems.find(item => item.id === ids[0]);
    if (group) {
      setRenameGroup(group);
      setIsRenameOpen(true);
    }
  };

  const handleRenameSubmit = async (
    id: string,
    data: Partial<PermissionGroup>
  ) => {
    setIsRenameSubmitting(true);
    try {
      await updatePermissionGroup(id, data);
      showSuccessToast('Grupo renomeado com sucesso');
      page.crud.refetch();
    } catch (error) {
      logger.error(
        'Erro ao renomear grupo',
        error instanceof Error ? error : undefined
      );
      showErrorToast({
        title: 'Erro ao renomear grupo',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsRenameSubmitting(false);
    }
  };

  const handleOpenPermissions = (ids: string[]) => {
    if (ids.length === 0) return;
    const group = page.filteredItems.find(item => item.id === ids[0]);
    if (group) {
      setPermissionsGroup(group);
      setIsPermissionsOpen(true);
    }
  };

  const handleOpenColor = (ids: string[]) => {
    if (ids.length === 0) return;
    const group = page.filteredItems.find(item => item.id === ids[0]);
    if (group) {
      setColorGroup(group);
      setIsColorOpen(true);
    }
  };

  const handleColorSubmit = async (
    id: string,
    data: Partial<PermissionGroup>
  ) => {
    setIsColorSubmitting(true);
    try {
      await updatePermissionGroup(id, data);
      showSuccessToast('Cor atualizada com sucesso');
      page.crud.refetch();
    } catch (error) {
      logger.error(
        'Erro ao mudar cor',
        error instanceof Error ? error : undefined
      );
      showErrorToast({
        title: 'Erro ao mudar cor',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsColorSubmitting(false);
    }
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
      logger.error(
        'Erro ao duplicar grupo',
        error instanceof Error ? error : undefined
      );
    }
  };

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.close('view');
    page.modals.open('delete');
  };

  const handleContextEditPage = (ids: string[]) => {
    if (ids.length > 0) {
      router.push(`/admin/permission-groups/${ids[0]}/edit`);
    }
  };

  const handleDoubleClick = (itemId: string) => {
    router.push(`/admin/permission-groups/${itemId}`);
  };

  // ============================================================================
  // CONTEXT MENU ACTIONS
  // ============================================================================

  const contextActions: ContextMenuAction[] = useMemo(() => {
    const actions: ContextMenuAction[] = [];

    if (canEdit) {
      actions.push({
        id: 'rename',
        label: 'Renomear',
        icon: Pencil,
        onClick: handleContextRename,
        separator: 'before',
      });
      actions.push({
        id: 'permissions',
        label: 'Permissões',
        icon: Shield,
        onClick: handleOpenPermissions,
      });
      actions.push({
        id: 'color',
        label: 'Mudar Cor',
        icon: Palette,
        onClick: handleOpenColor,
      });
    }

    if (canDelete) {
      actions.push({
        id: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: handleContextDelete,
        variant: 'destructive',
        separator: 'before',
      });
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, canDelete, page.filteredItems]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: PermissionGroup, isSelected: boolean) => {
    const usersCount = item.usersCount || 0;
    const permissionsCount = item.permissionsCount || 0;
    const iconStyle = item.color
      ? {
          background: `linear-gradient(to bottom right, ${item.color}, ${item.color}CC)`,
        }
      : undefined;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={canView ? handleContextView : undefined}
        onEdit={canEdit ? handleContextEditPage : undefined}
        onDuplicate={canCreate ? handleContextDuplicate : undefined}
        actions={contextActions}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.name || 'N/A'}
          subtitle={item.description || 'Sem descrição'}
          icon={Shield}
          iconBgColor={
            !item.color
              ? 'bg-linear-to-br from-purple-500 to-pink-600'
              : undefined
          }
          iconBgStyle={iconStyle}
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
    const iconStyle = item.color
      ? {
          background: `linear-gradient(to bottom right, ${item.color}, ${item.color}CC)`,
        }
      : undefined;

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={canView ? handleContextView : undefined}
        onEdit={canEdit ? handleContextEditPage : undefined}
        onDuplicate={canCreate ? handleContextDuplicate : undefined}
        actions={contextActions}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.name || 'N/A'}
          subtitle={item.description || 'Sem descrição'}
          icon={Shield}
          iconBgColor={
            !item.color
              ? 'bg-linear-to-br from-purple-500 to-pink-600'
              : undefined
          }
          iconBgStyle={iconStyle}
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
            breadcrumbItems={[
              { label: 'Administração', href: '/admin' },
              {
                label: 'Grupos de Permissões',
                href: '/admin/permission-groups',
              },
            ]}
            buttons={actionButtons}
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
                view: canView,
                edit: canEdit,
                delete: canDelete,
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

          {/* Rename Modal */}
          <RenameModal
            isOpen={isRenameOpen}
            onClose={() => setIsRenameOpen(false)}
            group={renameGroup}
            isSubmitting={isRenameSubmitting}
            onSubmit={handleRenameSubmit}
          />

          {/* Color Modal */}
          <ColorModal
            isOpen={isColorOpen}
            onClose={() => setIsColorOpen(false)}
            group={colorGroup}
            isSubmitting={isColorSubmitting}
            onSubmit={handleColorSubmit}
          />

          {/* Manage Permissions Modal */}
          <ManagePermissionsModal
            isOpen={isPermissionsOpen}
            onClose={() => setIsPermissionsOpen(false)}
            group={permissionsGroup}
            onSuccess={() => page.crud.refetch()}
          />

          {/* Confirmação de exclusão via PIN de ação */}
          <VerifyActionPinModal
            isOpen={page.modals.isOpen('delete')}
            onClose={() => page.modals.close('delete')}
            onSuccess={() => page.handlers.handleDeleteConfirm()}
            title="Confirmar Exclusão"
            description={`Digite seu PIN de ação para excluir ${page.modals.itemsToDelete.length} grupo(s). Esta ação não pode ser desfeita.`}
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
