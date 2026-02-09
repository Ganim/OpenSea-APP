/**
 * OpenSea OS - Users Page
 * Página de gerenciamento de usuários seguindo o padrão padronizado do OS
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
import { ForcePasswordResetModal } from '@/components/modals/force-password-reset-modal';
import { AccessDenied } from '@/components/rbac/access-denied';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CoreProvider,
  EntityCard,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  useEntityCrud,
  useEntityPage,
  type ContextMenuAction,
} from '@/core';
import { usePermissions } from '@/hooks/use-permissions';
import { logger } from '@/lib/logger';
import { usersService } from '@/services/auth/users.service';
import * as rbacService from '@/services/rbac/rbac.service';
import type { User } from '@/types/auth';
import type { GroupWithExpiration, PermissionGroup } from '@/types/rbac';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
  Plus,
  Upload,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  CreateModal,
  createUser,
  deleteUser,
  DetailModal,
  listUsers,
  ManageGroupsModal,
  usersConfig,
} from './src';

export default function UsersPage() {
  const router = useRouter();
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();

  // Verificar se o usuário tem permissão para gerenciar usuários
  const canManageUsers =
    hasPermission(ADMIN_PERMISSIONS.USERS.MANAGE) ||
    hasPermission(ADMIN_PERMISSIONS.USERS.LIST);

  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [manageGroupsOpen, setManageGroupsOpen] = useState(false);
  const [forcePasswordResetOpen, setForcePasswordResetOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
    null
  );
  const [newUser, setNewUser] = useState<{
    username: string;
    email: string;
    password: string;
  }>({
    username: '',
    email: '',
    password: '',
  });

  // ============================================================================
  // CRUD SETUP
  // ============================================================================

  const crud = useEntityCrud<User>({
    entityName: 'Usuário',
    entityNamePlural: 'Usuários',
    queryKey: ['users'],
    baseUrl: '/api/v1/users',
    listFn: listUsers,
    getFn: async (id: string) => {
      const response = await usersService.getUser(id);
      return response.user;
    },
    createFn: async (data: Record<string, unknown>) => {
      return createUser(data as Parameters<typeof createUser>[0]);
    },
    updateFn: async id => {
      // Profile updates handled separately
      const response = await usersService.getUser(id);
      return response.user;
    },
    deleteFn: deleteUser,
  });

  // ============================================================================
  // PAGE SETUP
  // ============================================================================

  const page = useEntityPage<User>({
    entityName: 'Usuário',
    entityNamePlural: 'Usuários',
    queryKey: ['users'],
    crud,
    viewRoute: id => `/admin/users/${id}`,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      return Boolean(
        item.username?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.profile?.name?.toLowerCase().includes(q) ||
          item.profile?.surname?.toLowerCase().includes(q)
      );
    },
  });

  // ============================================================================
  // RBAC QUERIES
  // ============================================================================

  const { data: userGroups = [], refetch: refetchGroups } = useQuery<
    GroupWithExpiration[]
  >({
    queryKey: ['user-groups', selectedUser?.id],
    queryFn: () =>
      selectedUser
        ? rbacService.listUserGroups(selectedUser.id)
        : Promise.resolve([]),
    enabled: !!selectedUser && manageGroupsOpen,
  });

  const { data: availableGroups = [] } = useQuery<PermissionGroup[]>({
    queryKey: ['available-groups'],
    queryFn: async () => {
      return await rbacService.listPermissionGroups({
        isActive: true,
      });
    },
    enabled: manageGroupsOpen,
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

  const handleContextDelete = (ids: string[]) => {
    page.modals.setItemsToDelete(ids);
    page.modals.open('delete');
  };

  const handleForcePasswordReset = (user: User) => {
    setUserToResetPassword(user);
    setForcePasswordResetOpen(true);
  };

  const handleDoubleClick = (itemId: string) => {
    router.push(`/admin/users/${itemId}`);
  };

  const handleManageGroups = (user: User) => {
    setSelectedUser(user);
    setManageGroupsOpen(true);
  };

  const handleAssignGroup = async (groupId: string) => {
    if (!selectedUser) return;
    try {
      await rbacService.assignGroupToUser(selectedUser.id, { groupId });
      refetchGroups();
    } catch (error) {
      logger.error(
        'Erro ao atribuir grupo',
        error instanceof Error ? error : undefined
      );
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    if (!selectedUser) return;
    try {
      await rbacService.removeGroupFromUser(selectedUser.id, groupId);
      refetchGroups();
    } catch (error) {
      logger.error(
        'Erro ao remover grupo',
        error instanceof Error ? error : undefined
      );
    }
  };

  const handleCreateUser = async () => {
    try {
      await crud.create(newUser);
      // Reset form
      setNewUser({
        username: '',
        email: '',
        password: '',
      });
      page.modals.close('create');
    } catch (error) {
      logger.error(
        'Erro ao criar usuário',
        error instanceof Error ? error : undefined
      );
    }
  };

  // ============================================================================
  // CUSTOM ACTIONS
  // ============================================================================

  const customActions: ContextMenuAction[] = [
    {
      id: 'force-password-reset',
      label: 'Resetar Senha',
      icon: Lock,
      onClick: (ids: string[]) => {
        // Pegar o primeiro usuário (já que ação é por item)
        const user = page.items?.find(u => u.id === ids[0]);
        if (user) {
          handleForcePasswordReset(user);
        }
      },
      variant: 'default',
      separator: 'before',
    },
  ];

  // ============================================================================
  // SORT OPTIONS
  // ============================================================================

  const sortOptions = useMemo(
    () => [
      {
        field: 'name' as const,
        direction: 'asc' as const,
        label: 'Nome (A-Z)',
        icon: Users,
      },
      {
        field: 'name' as const,
        direction: 'desc' as const,
        label: 'Nome (Z-A)',
        icon: Users,
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
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: User, isSelected: boolean) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDelete={handleContextDelete}
        actions={customActions}
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={item.username || 'N/A'}
          subtitle={item.email || 'sem email'}
          icon={Users}
          iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
          metadata={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {item.profile?.name && (
                <span className="truncate">
                  {item.profile.name}
                  {item.profile.surname && ` ${item.profile.surname}`}
                </span>
              )}
              {item.lastLoginAt && (
                <span>
                  Último acesso:{' '}
                  {new Date(item.lastLoginAt).toLocaleDateString()}
                </span>
              )}
              {item.createdAt && (
                <span>
                  Criado: {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt ?? undefined}
          showStatusBadges={true}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: User, isSelected: boolean) => {
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDelete={handleContextDelete}
        actions={customActions}
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={item.username || 'N/A'}
          subtitle={item.email || 'sem email'}
          icon={Users}
          iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
          metadata={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {item.profile?.name && (
                <span className="truncate">
                  {item.profile.name}
                  {item.profile.surname && ` ${item.profile.surname}`}
                </span>
              )}
              {item.lastLoginAt && (
                <span>
                  Último acesso:{' '}
                  {new Date(item.lastLoginAt).toLocaleDateString()}
                </span>
              )}
              {item.createdAt && (
                <span>
                  Criado: {new Date(item.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt ?? undefined}
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

  const handleCreate = useCallback(() => {
    page.modals.open('create');
  }, [page.modals]);

  const actionButtons: HeaderButton[] = useMemo(() => {
    const buttons: HeaderButton[] = [];

    if (hasPermission(ADMIN_PERMISSIONS.USERS.CREATE)) {
      buttons.push({
        id: 'import-users',
        title: 'Importar',
        icon: Upload,
        onClick: () => router.push('/import/admin/users'),
        variant: 'outline',
      });
      buttons.push({
        id: 'create-user',
        title: 'Novo Usuário',
        icon: Plus,
        onClick: handleCreate,
        variant: 'default',
      });
    }

    return buttons;
  }, [hasPermission, handleCreate, router]);

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

  if (!canManageUsers) {
    return (
      <AccessDenied
        title="Acesso Restrito"
        message="Você não tem permissão para gerenciar usuários."
      />
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CoreProvider
      selection={{
        namespace: 'users',
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
            title="Usuários"
            description="Gerencie usuários e suas permissões"
          />
        </PageHeader>

        <PageBody>
          {/* Search Bar */}
          <SearchBar
            value={page.searchQuery}
            placeholder={usersConfig.display.labels.searchPlaceholder}
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
              title="Erro ao carregar usuários"
              message="Ocorreu um erro ao tentar carregar os usuários. Por favor, tente novamente."
              action={{
                label: 'Tentar Novamente',
                onClick: () => crud.refetch(),
              }}
            />
          ) : (
            <EntityGrid
              config={usersConfig}
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
                edit: hasPermission(ADMIN_PERMISSIONS.USERS.UPDATE),
                delete: hasPermission(ADMIN_PERMISSIONS.USERS.DELETE),
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
            isOpen={page.modals.isOpen('view')}
            onOpenChange={open => {
              if (!open) page.modals.close('view');
            }}
            selectedUser={page.modals.viewingItem}
            onManageGroups={handleManageGroups}
          />

          {/* Create Modal */}
          <CreateModal
            isOpen={page.modals.isOpen('create')}
            onOpenChange={open => {
              if (!open) {
                page.modals.close('create');
                setNewUser({
                  username: '',
                  email: '',
                  password: '',
                });
              }
            }}
            onCreateUser={handleCreateUser}
            newUser={newUser}
            setNewUser={setNewUser}
          />

          {/* Edit Modal */}
          <DetailModal
            isOpen={page.modals.isOpen('edit')}
            onOpenChange={open => {
              if (!open) page.modals.close('edit');
            }}
            selectedUser={page.modals.editingItem}
            onManageGroups={handleManageGroups}
          />

          {/* Delete Confirmation */}
          {page.modals.isOpen('delete') && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <Card className="w-full max-w-md p-6">
                <h2 className="text-lg font-semibold mb-2">
                  Excluir Usuário(s)
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {`Tem certeza de que deseja excluir ${page.modals.itemsToDelete.length} usuário(s)? Esta ação não pode ser desfeita.`}
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

          {/* Manage Groups Modal */}
          <ManageGroupsModal
            isOpen={manageGroupsOpen}
            onOpenChange={setManageGroupsOpen}
            selectedUser={selectedUser}
            userGroups={userGroups}
            availableGroups={availableGroups}
            onAssignGroup={handleAssignGroup}
            onRemoveGroup={handleRemoveGroup}
          />

          {/* Force Password Reset Modal */}
          <ForcePasswordResetModal
            isOpen={forcePasswordResetOpen}
            onClose={() => {
              setForcePasswordResetOpen(false);
              setUserToResetPassword(null);
            }}
            user={userToResetPassword}
          />
        </PageBody>
      </PageLayout>
    </CoreProvider>
  );
}
