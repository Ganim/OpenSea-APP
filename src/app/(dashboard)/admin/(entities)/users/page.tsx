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
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { AccessDenied } from '@/components/rbac/access-denied';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
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
import {
  useForceAccessPinReset,
  useForceActionPinReset,
} from '@/hooks/use-pins';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { usersService } from '@/services/auth/users.service';
import { employeesService } from '@/services/hr/employees.service';
import * as rbacService from '@/services/rbac/rbac.service';
import type { User } from '@/types/auth';
import type { GroupWithExpiration, PermissionGroup } from '@/types/rbac';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Shield,
  ShieldAlert,
  Trash2,
  Unlink,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AssignEmployeeModal,
  ChangeUsernameModal,
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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
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
  const [assignEmployeeOpen, setAssignEmployeeOpen] = useState(false);
  const [userForAssign, setUserForAssign] = useState<User | null>(null);
  const [changeUsernameOpen, setChangeUsernameOpen] = useState(false);
  const [userForUsername, setUserForUsername] = useState<User | null>(null);
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
  // EMPLOYEE LINK MAP
  // ============================================================================

  // Carrega Map de userId → fullName do funcionário vinculado
  const { data: employeeMap = new Map<string, string>() } = useQuery({
    queryKey: ['user-employee-links'],
    queryFn: async () => {
      const response = await employeesService.listEmployees({ perPage: 100 });
      const map = new Map<string, string>();
      for (const emp of response.employees) {
        if (emp.userId) map.set(emp.userId, emp.fullName);
      }
      return map;
    },
    enabled: canManageUsers,
  });

  // ============================================================================
  // USER → GROUPS MAP
  // ============================================================================

  // Carrega Map de userId → array de grupos de permissão
  // O endpoint listPermissionGroups retorna users[] via toHTTPWithDetails (confirmado pelo Zod schema do backend)
  type GroupWithUsers = PermissionGroup & {
    users?: Array<{ id: string; username: string; email: string }>;
  };

  const {
    data: userGroupsMap = new Map<
      string,
      Array<{ id: string; name: string; color: string | null }>
    >(),
  } = useQuery({
    queryKey: ['all-user-groups-map'],
    queryFn: async () => {
      const groups = (await rbacService.listPermissionGroups({
        isActive: true,
        limit: 100,
      })) as GroupWithUsers[];

      const map = new Map<
        string,
        Array<{ id: string; name: string; color: string | null }>
      >();
      for (const group of groups) {
        const users = group.users || [];
        for (const user of users) {
          const existing = map.get(user.id) || [];
          existing.push({
            id: group.id,
            name: group.name,
            color: group.color,
          });
          map.set(user.id, existing);
        }
      }
      return map;
    },
    enabled: canManageUsers,
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
        limit: 100,
      });
    },
    enabled: canManageUsers,
  });

  // ============================================================================
  // FILTERS (URL-based)
  // ============================================================================

  const groupIds = useMemo(() => {
    const raw = searchParams.get('group');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const employeeFilter = useMemo(() => {
    const raw = searchParams.get('employee');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const accessFilter = useMemo(() => {
    const raw = searchParams.get('access');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const displayedUsers = useMemo(() => {
    let items = page.filteredItems;

    // Filter by group
    if (groupIds.length > 0) {
      const set = new Set(groupIds);
      items = items.filter(user => {
        const groups = userGroupsMap.get(user.id) || [];
        return groups.some(g => set.has(g.id));
      });
    }

    // Filter by employee link
    if (employeeFilter.length === 1) {
      if (employeeFilter[0] === 'linked') {
        items = items.filter(user => employeeMap.has(user.id));
      } else if (employeeFilter[0] === 'unlinked') {
        items = items.filter(user => !employeeMap.has(user.id));
      }
    }

    // Filter by last access
    if (accessFilter.length === 1) {
      const now = Date.now();
      if (accessFilter[0] === 'never') {
        items = items.filter(user => !user.lastLoginAt);
      } else if (accessFilter[0] === '24h') {
        items = items.filter(
          user =>
            user.lastLoginAt &&
            now - new Date(user.lastLoginAt).getTime() <= 24 * 60 * 60 * 1000
        );
      } else if (accessFilter[0] === '48h') {
        items = items.filter(
          user =>
            user.lastLoginAt &&
            now - new Date(user.lastLoginAt).getTime() <= 48 * 60 * 60 * 1000
        );
      } else if (accessFilter[0] === '72h') {
        items = items.filter(
          user =>
            user.lastLoginAt &&
            now - new Date(user.lastLoginAt).getTime() <= 72 * 60 * 60 * 1000
        );
      }
    }

    return items;
  }, [
    page.filteredItems,
    groupIds,
    employeeFilter,
    accessFilter,
    userGroupsMap,
    employeeMap,
  ]);

  const buildFilterUrl = useCallback(
    (params: { group?: string[]; employee?: string[]; access?: string[] }) => {
      const parts: string[] = [];
      const grp = params.group !== undefined ? params.group : groupIds;
      const emp =
        params.employee !== undefined ? params.employee : employeeFilter;
      const acc = params.access !== undefined ? params.access : accessFilter;

      if (grp.length > 0) parts.push(`group=${grp.join(',')}`);
      if (emp.length > 0) parts.push(`employee=${emp.join(',')}`);
      if (acc.length > 0) parts.push(`access=${acc.join(',')}`);

      return parts.length > 0
        ? `/admin/users?${parts.join('&')}`
        : '/admin/users';
    },
    [groupIds, employeeFilter, accessFilter]
  );

  const setGroupFilter = useCallback(
    (ids: string[]) => router.push(buildFilterUrl({ group: ids })),
    [router, buildFilterUrl]
  );

  const setEmployeeFilter = useCallback(
    (ids: string[]) => router.push(buildFilterUrl({ employee: ids })),
    [router, buildFilterUrl]
  );

  const setAccessFilter = useCallback(
    (ids: string[]) => router.push(buildFilterUrl({ access: ids })),
    [router, buildFilterUrl]
  );

  const groupFilterOptions = useMemo(
    () => availableGroups.map(g => ({ id: g.id, label: g.name })),
    [availableGroups]
  );

  const employeeFilterOptions = useMemo(
    () => [
      { id: 'linked', label: 'Vinculado a funcionário' },
      { id: 'unlinked', label: 'Sem vínculo' },
    ],
    []
  );

  const accessFilterOptions = useMemo(
    () => [
      { id: '24h', label: 'Últimas 24 horas' },
      { id: '48h', label: 'Últimas 48 horas' },
      { id: '72h', label: 'Últimas 72 horas' },
      { id: 'never', label: 'Nunca acessou' },
    ],
    []
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContextView = (ids: string[]) => {
    page.handlers.handleItemsView(ids);
  };

  const handleContextEdit = (ids: string[]) => {
    if (ids.length === 1) {
      router.push(`/admin/users/${ids[0]}/edit`);
    }
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
      // Invalidar cache do mapa de grupos para exibir o chip do novo usuário
      queryClient.invalidateQueries({ queryKey: ['all-user-groups-map'] });
    } catch (error) {
      logger.error(
        'Erro ao criar usuário',
        error instanceof Error ? error : undefined
      );
    }
  };

  const forceAccessPinReset = useForceAccessPinReset();
  const forceActionPinReset = useForceActionPinReset();

  const handleForceAccessPinReset = async (user: User) => {
    try {
      await forceAccessPinReset.mutateAsync(user.id);
      toast.success(`PIN de Acesso resetado para ${user.email}`);
    } catch {
      toast.error('Erro ao resetar PIN de Acesso');
    }
  };

  const handleForceActionPinReset = async (user: User) => {
    try {
      await forceActionPinReset.mutateAsync(user.id);
      toast.success(`PIN de Ação resetado para ${user.email}`);
    } catch {
      toast.error('Erro ao resetar PIN de Ação');
    }
  };

  const handleAssignEmployee = (user: User) => {
    setUserForAssign(user);
    setAssignEmployeeOpen(true);
  };

  const handleUnlinkEmployee = async (user: User) => {
    try {
      const response = await employeesService.getEmployeeByUserId(user.id);
      await employeesService.unlinkUserFromEmployee(response.employee.id);
      toast.success('Funcionário desvinculado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-employee-links'] });
    } catch {
      toast.error('Erro ao desvincular funcionário');
    }
  };

  // ============================================================================
  // CUSTOM ACTIONS
  // ============================================================================

  const contextActions: ContextMenuAction[] = useMemo(() => {
    const actions: ContextMenuAction[] = [];

    // Custom group (separator before first item in group)
    const canUpdate = hasPermission(ADMIN_PERMISSIONS.USERS.UPDATE);
    if (canUpdate) {
      actions.push({
        id: 'change-username',
        label: 'Alterar Username',
        icon: Pencil,
        onClick: (ids: string[]) => {
          const user = page.items?.find(u => u.id === ids[0]);
          if (user) {
            setUserForUsername(user);
            setChangeUsernameOpen(true);
          }
        },
        separator: 'before',
      });
    }
    actions.push({
      id: 'force-password-reset',
      label: 'Resetar Senha',
      icon: Lock,
      onClick: (ids: string[]) => {
        const user = page.items?.find(u => u.id === ids[0]);
        if (user) handleForcePasswordReset(user);
      },
      ...(!canUpdate && { separator: 'before' as const }),
    });
    actions.push({
      id: 'reset-access-pin',
      label: 'Resetar PIN de Acesso',
      icon: KeyRound,
      onClick: (ids: string[]) => {
        const user = page.items?.find(u => u.id === ids[0]);
        if (user) handleForceAccessPinReset(user);
      },
    });
    actions.push({
      id: 'reset-action-pin',
      label: 'Resetar PIN de Ação',
      icon: ShieldAlert,
      onClick: (ids: string[]) => {
        const user = page.items?.find(u => u.id === ids[0]);
        if (user) handleForceActionPinReset(user);
      },
    });
    actions.push({
      id: 'assign-employee',
      label: 'Vincular Funcionário',
      icon: UserCheck,
      onClick: (ids: string[]) => {
        const user = page.items?.find(u => u.id === ids[0]);
        if (user) handleAssignEmployee(user);
      },
      hidden: (ids: string[]) => ids.length !== 1 || employeeMap.has(ids[0]),
    });
    actions.push({
      id: 'unlink-employee',
      label: 'Desvincular Funcionário',
      icon: Unlink,
      onClick: (ids: string[]) => {
        const user = page.items?.find(u => u.id === ids[0]);
        if (user) handleUnlinkEmployee(user);
      },
      variant: 'destructive',
      hidden: (ids: string[]) => ids.length !== 1 || !employeeMap.has(ids[0]),
    });

    // Destructive group
    if (hasPermission(ADMIN_PERMISSIONS.USERS.DELETE)) {
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
  }, [page.items, employeeMap]);

  // ============================================================================
  // SORT OPTIONS
  // ============================================================================

  const sortOptions = useMemo(
    () => [
      {
        field: 'custom' as const,
        direction: 'asc' as const,
        label: 'Nome (A-Z)',
        icon: Users,
      },
      {
        field: 'custom' as const,
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

  const getFullName = useCallback((item: User) => {
    if (!item.profile?.name) return null;
    return `${item.profile.name}${item.profile.surname ? ` ${item.profile.surname}` : ''}`;
  }, []);

  const renderGroupChips = useCallback(
    (groups: Array<{ name: string; color: string | null }>) => {
      if (groups.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {groups.map(group => (
            <span
              key={group.name}
              className={cn(
                'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                !group.color && 'bg-muted text-muted-foreground'
              )}
              style={
                group.color
                  ? {
                      backgroundColor: `${group.color}20`,
                      color: group.color,
                    }
                  : undefined
              }
            >
              {group.name}
            </span>
          ))}
        </div>
      );
    },
    []
  );

  const renderLastAccess = useCallback(
    (item: User, compact = false) => (
      <div
        className={cn(
          'flex items-center gap-1.5',
          compact
            ? 'text-[11px]'
            : 'text-[11px] pt-1.5 border-t border-border/50'
        )}
      >
        <Clock className={cn('w-3.5 h-3.5 shrink-0', 'text-amber-500')} />
        {item.lastLoginAt ? (
          <span className="text-muted-foreground">
            {compact ? (
              new Date(item.lastLoginAt).toLocaleDateString('pt-BR')
            ) : (
              <>
                {new Date(item.lastLoginAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(item.lastLoginAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            )}
          </span>
        ) : (
          <span className="text-amber-500 italic">
            {compact ? 'Nunca acessou' : 'Nunca acessou o sistema.'}
          </span>
        )}
      </div>
    ),
    []
  );

  const renderGridCard = (item: User, isSelected: boolean) => {
    const fullName = getFullName(item);
    const employeeName = employeeMap.get(item.id);
    const groups = userGroupsMap.get(item.id) || [];

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        actions={contextActions}
        contentClassName="w-64"
      >
        <EntityCard
          id={item.id}
          variant="grid"
          title={fullName || 'Nome não informado'}
          subtitle={`@${item.username}`}
          icon={Users}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          metadata={
            <div className="space-y-2">
              {/* Email + Employee */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground/70">
                    E-mail:
                  </span>
                  <span className="truncate">{item.email}</span>
                </div>
                {employeeName ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground/70">
                      Funcionário:
                    </span>
                    <span className="truncate">{employeeName}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/60 italic text-xs">
                    Não vinculado a um funcionário
                  </span>
                )}
              </div>

              {/* Permission Group Chips */}
              {renderGroupChips(groups)}

              {/* Last Access */}
              {renderLastAccess(item)}
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
    const fullName = getFullName(item);
    const groups = userGroupsMap.get(item.id) || [];

    return (
      <EntityContextMenu
        itemId={item.id}
        onView={handleContextView}
        onEdit={handleContextEdit}
        actions={contextActions}
        contentClassName="w-64"
      >
        <EntityCard
          id={item.id}
          variant="list"
          title={fullName || 'Nome não informado'}
          subtitle={`@${item.username}`}
          icon={Users}
          iconBgColor="bg-linear-to-br from-blue-500 to-cyan-600"
          metadata={<span className="text-xs">{item.email}</span>}
          isSelected={isSelected}
          showSelection={false}
          clickable={false}
          onDoubleClick={() => handleDoubleClick(item.id)}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt ?? undefined}
          showStatusBadges={true}
        >
          {/* Groups + Last Access (right side in list variant) */}
          <div className="flex items-center gap-2">
            {renderGroupChips(groups)}
            {renderLastAccess(item, true)}
          </div>
        </EntityCard>
      </EntityContextMenu>
    );
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedIds = Array.from(page.selection?.state.selectedIds || []);
  const hasSelection = selectedIds.length > 0;

  const initialIds = useMemo(
    () => displayedUsers.map(i => i.id),
    [displayedUsers]
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
            breadcrumbItems={[
              { label: 'Administração', href: '/admin' },
              { label: 'Usuários', href: '/admin/users' },
            ]}
            buttons={actionButtons}
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
              items={displayedUsers}
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
                const nameA = (a.username || '').toLowerCase();
                const nameB = (b.username || '').toLowerCase();
                return nameA.localeCompare(nameB, 'pt-BR') * multiplier;
              }}
              toolbarStart={
                <>
                  <FilterDropdown
                    label="Grupo"
                    icon={Shield}
                    options={groupFilterOptions}
                    selected={groupIds}
                    onSelectionChange={setGroupFilter}
                    activeColor="violet"
                    searchPlaceholder="Buscar grupo..."
                    emptyText="Nenhum grupo encontrado."
                  />
                  <FilterDropdown
                    label="Funcionário"
                    icon={UserCheck}
                    options={employeeFilterOptions}
                    selected={employeeFilter}
                    onSelectionChange={setEmployeeFilter}
                    activeColor="cyan"
                    searchPlaceholder="Buscar..."
                    emptyText="Nenhuma opção encontrada."
                  />
                  <FilterDropdown
                    label="Último Acesso"
                    icon={Clock}
                    options={accessFilterOptions}
                    selected={accessFilter}
                    onSelectionChange={setAccessFilter}
                    activeColor="blue"
                    searchPlaceholder="Buscar..."
                    emptyText="Nenhuma opção encontrada."
                  />
                </>
              }
            />
          )}

          {/* Selection Toolbar */}
          {hasSelection && (
            <SelectionToolbar
              selectedIds={selectedIds}
              totalItems={displayedUsers.length}
              onClear={() => page.selection?.actions.clear()}
              onSelectAll={() => page.selection?.actions.selectAll()}
              defaultActions={{
                view: true,
                edit: hasPermission(ADMIN_PERMISSIONS.USERS.UPDATE),
                delete: hasPermission(ADMIN_PERMISSIONS.USERS.DELETE),
              }}
              handlers={{
                onView: page.handlers.handleItemsView,
                onEdit: (ids: string[]) => {
                  if (ids.length === 1) {
                    router.push(`/admin/users/${ids[0]}/edit`);
                  }
                },
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

          {/* Confirmação de exclusão via PIN de ação */}
          <VerifyActionPinModal
            isOpen={page.modals.isOpen('delete')}
            onClose={() => page.modals.close('delete')}
            onSuccess={() => page.handlers.handleDeleteConfirm()}
            title="Confirmar Exclusão"
            description={`Digite seu PIN de ação para excluir ${page.modals.itemsToDelete.length} usuário(s). Esta ação não pode ser desfeita.`}
          />

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

          {/* Assign Employee Modal */}
          <AssignEmployeeModal
            isOpen={assignEmployeeOpen}
            onOpenChange={setAssignEmployeeOpen}
            selectedUser={userForAssign}
          />

          {/* Change Username Modal */}
          <ChangeUsernameModal
            isOpen={changeUsernameOpen}
            onClose={() => {
              setChangeUsernameOpen(false);
              setUserForUsername(null);
            }}
            user={userForUsername}
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
