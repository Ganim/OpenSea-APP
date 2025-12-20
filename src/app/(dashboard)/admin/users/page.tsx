/**
 * OpenSea OS - Users Page
 * Página de gerenciamento de usuários seguindo o padrão do OS
 */

'use client';

import { AccessDenied } from '@/components/rbac/access-denied';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import {
  CoreProvider,
  EntityContextMenu,
  EntityGrid,
  SelectionToolbar,
  UniversalCard,
  useEntityCrud,
  useEntityPage,
} from '@/core';
import { usersService } from '@/services/auth/users.service';
import * as rbacService from '@/services/rbac/rbac.service';
import type { User } from '@/types/auth';
import type { GroupWithExpiration, PermissionGroup } from '@/types/rbac';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CreateModal,
  createUser,
  deleteUser,
  DetailModal,
  getRoleBadgeVariant,
  listUsers,
  ManageGroupsModal,
  updateUserRole,
  usersConfig,
} from './src';

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  // Verificar se o usuário é ADMIN
  const isAdmin = currentUser?.role === 'ADMIN';

  // ============================================================================
  // STATE
  // ============================================================================

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [manageGroupsOpen, setManageGroupsOpen] = useState(false);

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
    updateFn: async (id, data: Record<string, unknown>) => {
      // Update role if changed
      if (data.role) {
        return updateUserRole(id, data.role as 'USER' | 'MANAGER' | 'ADMIN');
      }
      // Return existing for now
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
      const response = await rbacService.listPermissionGroups({
        isActive: true,
      });
      return response.data;
    },
    enabled: manageGroupsOpen,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Context menu handlers
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
      console.error('Erro ao atribuir grupo:', error);
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    if (!selectedUser) return;
    try {
      await rbacService.removeGroupFromUser(selectedUser.id, groupId);
      refetchGroups();
    } catch (error) {
      console.error('Erro ao remover grupo:', error);
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGridCard = (item: User, isSelected: boolean) => {
    const roleLabel = getRoleBadgeVariant(item.role);
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="grid"
          title={item.username || 'N/A'}
          subtitle={item.email || 'sem email'}
          icon={Users}
          iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
          badges={[
            {
              label:
                roleLabel === 'destructive'
                  ? 'Admin'
                  : roleLabel === 'default'
                    ? 'Gerente'
                    : 'Usuário',
              variant: roleLabel as 'destructive' | 'default' | 'secondary',
            },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.profile?.name && (
                <span className="truncate text-muted-foreground">
                  {item.profile.name}
                  {item.profile.surname && ` ${item.profile.surname}`}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        />
      </EntityContextMenu>
    );
  };

  const renderListCard = (item: User, isSelected: boolean) => {
    const roleLabel = getRoleBadgeVariant(item.role);
    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        onDelete={handleContextDelete}
      >
        <UniversalCard
          id={item.id}
          variant="list"
          title={item.username || 'N/A'}
          subtitle={item.email || 'sem email'}
          icon={Users}
          iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
          badges={[
            {
              label:
                roleLabel === 'destructive'
                  ? 'Admin'
                  : roleLabel === 'default'
                    ? 'Gerente'
                    : 'Usuário',
              variant: roleLabel as 'destructive' | 'default' | 'secondary',
            },
          ]}
          metadata={
            <div className="flex items-center gap-4 text-xs">
              {item.profile?.name && (
                <span className="truncate text-muted-foreground">
                  {item.profile.name}
                  {item.profile.surname && ` ${item.profile.surname}`}
                </span>
              )}
            </div>
          }
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
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
  // LOADING / ACCESS CHECK
  // ============================================================================

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Acesso Restrito"
        message="Apenas administradores podem gerenciar usuários."
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
      <div className="min-h-screen from-blue-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6">
        <div className="max-w-8xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Usuários
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie usuários e suas permissões
              </p>
            </div>
            <Button
              onClick={() => page.modals.open('create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="p-4 backdrop-blur-xl bg-white/40 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Buscar usuários por nome, email ou username..."
                value={page.searchQuery}
                onChange={e => page.handlers.handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Grid */}
          {page.isLoading ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-gray-600 dark:text-white/60">Carregando...</p>
            </Card>
          ) : page.error ? (
            <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10">
              <p className="text-destructive">Erro ao carregar usuários</p>
            </Card>
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
              showSorting={false}
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
                delete: true,
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
            getRoleBadgeVariant={getRoleBadgeVariant}
          />

          {/* Create Modal */}
          <CreateModal
            isOpen={page.modals.isOpen('create')}
            onOpenChange={open => {
              if (!open) page.modals.close('create');
            }}
            onCreateUser={async () => {
              // This will be handled by the page.modals system
            }}
            newUser={{
              username: '',
              email: '',
              password: '',
              role: 'USER' as const,
            }}
            setNewUser={() => {
              // State is managed by page.modals
            }}
          />

          {/* Edit Modal */}
          <DetailModal
            isOpen={page.modals.isOpen('edit')}
            onOpenChange={open => {
              if (!open) page.modals.close('edit');
            }}
            selectedUser={page.modals.editingItem}
            onManageGroups={handleManageGroups}
            getRoleBadgeVariant={getRoleBadgeVariant}
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
        </div>
      </div>
    </CoreProvider>
  );
}
