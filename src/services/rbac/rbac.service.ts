import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import type {
  AddPermissionToGroupDTO,
  AssignGroupToUserDTO,
  CreatePermissionDTO,
  CreatePermissionGroupDTO,
  EffectivePermission,
  GroupWithExpiration,
  ListPermissionGroupsQuery,
  ListPermissionsQuery,
  Permission,
  PermissionGroup,
  PermissionGroupResponse,
  PermissionResponse,
  PermissionWithEffect,
  SuccessResponse,
  UpdatePermissionDTO,
  UpdatePermissionGroupDTO,
  UserInGroup,
} from '@/types/rbac';

// ============================================
// PERMISSIONS
// ============================================

export async function createPermission(
  data: CreatePermissionDTO
): Promise<Permission> {
  const response = await apiClient.post<PermissionResponse>(
    API_ENDPOINTS.RBAC.PERMISSIONS.CREATE,
    data
  );
  return response.permission;
}

export async function listPermissions(
  query?: ListPermissionsQuery
): Promise<Permission[]> {
  const params = new URLSearchParams();
  if (query?.module) params.append('module', query.module);
  if (query?.resource) params.append('resource', query.resource);
  if (query?.action) params.append('action', query.action);
  if (query?.isSystem !== undefined)
    params.append('isSystem', String(query.isSystem));
  if (query?.page) params.append('page', String(query.page));
  if (query?.limit) params.append('limit', String(query.limit));

  const queryString = params.toString();
  try {
    const response = await apiClient.get<{
      permissions: Permission[];
      total: number;
      totalPages: number;
    }>(
      `${API_ENDPOINTS.RBAC.PERMISSIONS.LIST}${queryString ? `?${queryString}` : ''}`
    );
    // Filter out permissions with invalid codes to prevent cascading errors
    return (response?.permissions || []).filter(p => {
      if (!p.code) return false;
      // Validate format: module.resource.action (at least 2 dots)
      const parts = p.code.split('.');
      return parts.length >= 3;
    });
  } catch (error) {
    logger.error(
      'Failed to fetch permissions',
      error instanceof Error ? error : new Error(String(error)),
      {
        context: 'listPermissions',
      }
    );
    return [];
  }
}

export async function listAllPermissions(): Promise<
  import('@/types/rbac').AllPermissionsResponse
> {
  try {
    const response = await apiClient.get<
      import('@/types/rbac').AllPermissionsResponse
    >(API_ENDPOINTS.RBAC.PERMISSIONS.LIST_ALL);
    return response;
  } catch (error) {
    logger.error(
      'Failed to fetch all permissions',
      error instanceof Error ? error : new Error(String(error)),
      {
        context: 'listAllPermissions',
      }
    );
    return {
      permissions: [],
      total: 0,
      modules: [],
    };
  }
}

export async function getPermissionByCode(code: string): Promise<Permission> {
  const response = await apiClient.get<PermissionResponse>(
    API_ENDPOINTS.RBAC.PERMISSIONS.GET_BY_CODE(code)
  );
  return response.permission;
}

export async function getPermissionById(id: string): Promise<Permission> {
  const response = await apiClient.get<PermissionResponse>(
    API_ENDPOINTS.RBAC.PERMISSIONS.GET(id)
  );
  return response.permission;
}

export async function updatePermission(
  id: string,
  data: UpdatePermissionDTO
): Promise<Permission> {
  const response = await apiClient.patch<PermissionResponse>(
    API_ENDPOINTS.RBAC.PERMISSIONS.UPDATE(id),
    data
  );
  return response.permission;
}

export async function deletePermission(id: string): Promise<void> {
  await apiClient.delete<void>(API_ENDPOINTS.RBAC.PERMISSIONS.DELETE(id));
}

// ============================================
// PERMISSION GROUPS
// ============================================

export async function createPermissionGroup(
  data: CreatePermissionGroupDTO
): Promise<PermissionGroup> {
  const response = await apiClient.post<PermissionGroupResponse>(
    API_ENDPOINTS.RBAC.GROUPS.CREATE,
    data
  );
  return response.group;
}

export async function listPermissionGroups(
  query?: ListPermissionGroupsQuery
): Promise<PermissionGroup[]> {
  const params = new URLSearchParams();
  if (query?.isActive !== undefined)
    params.append('isActive', String(query.isActive));
  if (query?.isSystem !== undefined)
    params.append('isSystem', String(query.isSystem));
  if (query?.includeDeleted !== undefined)
    params.append('includeDeleted', String(query.includeDeleted));
  if (query?.page) params.append('page', String(query.page));
  if (query?.limit) params.append('limit', String(query.limit));

  const queryString = params.toString();
  const response = await apiClient.get<{
    groups: PermissionGroup[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(
    `${API_ENDPOINTS.RBAC.GROUPS.LIST}${queryString ? `?${queryString}` : ''}`
  );
  return response.groups;
}

export async function getPermissionGroupById(
  id: string
): Promise<PermissionGroup> {
  const response = await apiClient.get<PermissionGroupResponse>(
    API_ENDPOINTS.RBAC.GROUPS.GET(id)
  );
  return response.group;
}

export async function getPermissionGroupDetails(id: string): Promise<{
  group: PermissionGroup;
  permissions: PermissionWithEffect[];
  users: UserInGroup[];
}> {
  const response = await apiClient.get<{
    group: PermissionGroup & {
      permissions?: PermissionWithEffect[];
      users?: UserInGroup[];
    };
    permissions?: PermissionWithEffect[];
    users?: UserInGroup[];
  }>(API_ENDPOINTS.RBAC.GROUPS.GET(id));

  // A API pode retornar de duas formas:
  // 1. { group: {..., permissions: [...], users: [...]} } (nested)
  // 2. { group: {...}, permissions: [...], users: [...] } (flat)
  const permissions = response.permissions || response.group.permissions || [];
  const users = response.users || response.group.users || [];

  return {
    group: response.group,
    permissions,
    users,
  };
}

export async function updatePermissionGroup(
  id: string,
  data: UpdatePermissionGroupDTO
): Promise<PermissionGroup> {
  const response = await apiClient.patch<PermissionGroupResponse>(
    API_ENDPOINTS.RBAC.GROUPS.UPDATE(id),
    data
  );
  return response.group;
}

export async function deletePermissionGroup(
  id: string,
  force = false
): Promise<void> {
  await apiClient.delete<void>(
    `${API_ENDPOINTS.RBAC.GROUPS.DELETE(id)}?force=${force}`
  );
}

// ============================================
// GROUP <-> PERMISSIONS
// ============================================

export async function addPermissionToGroup(
  groupId: string,
  data: AddPermissionToGroupDTO
): Promise<boolean> {
  const response = await apiClient.post<SuccessResponse>(
    API_ENDPOINTS.RBAC.GROUPS.PERMISSIONS(groupId),
    data
  );
  return response.success;
}

export async function addPermissionsToGroupBulk(
  groupId: string,
  permissions: AddPermissionToGroupDTO[]
): Promise<{
  success: boolean;
  added: number;
  skipped: number;
  errors: unknown[];
}> {
  const response = await apiClient.post<{
    success: boolean;
    added: number;
    skipped: number;
    errors: unknown[];
  }>(API_ENDPOINTS.RBAC.GROUPS.PERMISSIONS_BULK(groupId), { permissions });
  return response;
}

export async function listGroupPermissions(
  groupId: string
): Promise<PermissionWithEffect[]> {
  try {
    const response = await apiClient.get<
      { permissions: PermissionWithEffect[] } | PermissionWithEffect[]
    >(API_ENDPOINTS.RBAC.GROUPS.PERMISSIONS(groupId));

    // Handle both response formats
    if (Array.isArray(response)) {
      return response;
    }

    return response?.permissions || [];
  } catch (error) {
    logger.error(
      'Failed to fetch group permissions',
      error instanceof Error ? error : new Error(String(error)),
      {
        groupId,
      }
    );
    return [];
  }
}

export async function removePermissionFromGroup(
  groupId: string,
  permissionCode: string
): Promise<void> {
  await apiClient.delete<void>(
    API_ENDPOINTS.RBAC.GROUPS.REMOVE_PERMISSION(groupId, permissionCode)
  );
}

// ============================================
// USER <-> GROUPS
// ============================================

export async function assignGroupToUser(
  userId: string,
  data: AssignGroupToUserDTO
): Promise<boolean> {
  const response = await apiClient.post<SuccessResponse>(
    API_ENDPOINTS.RBAC.USERS.GROUPS(userId),
    data
  );
  return response.success;
}

export async function listUserGroups(
  userId: string,
  includeExpired = false,
  includeInactive = false
): Promise<GroupWithExpiration[]> {
  const params = new URLSearchParams();
  if (includeExpired) params.append('includeExpired', 'true');
  if (includeInactive) params.append('includeInactive', 'true');

  const queryString = params.toString();
  const response = await apiClient.get<{ groups: GroupWithExpiration[] }>(
    `${API_ENDPOINTS.RBAC.USERS.GROUPS(userId)}${queryString ? `?${queryString}` : ''}`
  );
  return response.groups;
}

export async function listUserPermissions(
  userId: string
): Promise<EffectivePermission[]> {
  try {
    const response = await apiClient.get<
      { permissions: EffectivePermission[] } | EffectivePermission[]
    >(API_ENDPOINTS.RBAC.USERS.PERMISSIONS(userId));

    // API pode retornar { permissions: [...] } ou diretamente [...]
    if (Array.isArray(response)) {
      return response;
    }

    return response?.permissions || [];
  } catch (error) {
    // Se for erro 403 (usuario nao tem rbac.associations.read), silenciar
    const err = error as { status?: number };
    if (err.status === 403) {
      logger.debug('User lacks permission to read their own permissions', {
        userId,
        permissionCode: 'rbac.associations.read',
      });
      return [];
    }
    logger.error(
      'Failed to fetch user permissions',
      error instanceof Error ? error : new Error(String(error)),
      {
        userId,
      }
    );
    return [];
  }
}

/**
 * Lista as permissoes do usuario autenticado (proprias permissoes)
 * Usa a rota /v1/me/permissions que nao requer permissao especial
 */
export async function listMyPermissions(): Promise<EffectivePermission[]> {
  try {
    const data = await apiClient.get<
      { permissions: EffectivePermission[] } | EffectivePermission[]
    >(API_ENDPOINTS.ME.PERMISSIONS);

    // API pode retornar { permissions: [...] } ou diretamente [...]
    let permissions: EffectivePermission[] = [];
    if (Array.isArray(data)) {
      permissions = data;
    } else if (data?.permissions) {
      permissions = data.permissions;
    }

    // Filtrar permissoes com codigo invalido para evitar erros cascata
    return permissions.filter(p => {
      const code =
        p?.permission?.code || (p as unknown as { code?: string })?.code;
      if (!code) return false;
      // Codigo deve ter entre 2 e 4 partes:
      // - 2 partes: module.action (ex: notifications.send)
      // - 3 partes: module.resource.action (ex: stock.products.create)
      // - 4 partes: module.resource.action.scope (ex: hr.employees.list.all)
      const parts = code.split('.');
      if (parts.length < 2 || parts.length > 4) {
        logger.debug('Ignoring invalid permission code', {
          code,
          parts: parts.length,
        });
        return false;
      }
      return true;
    });
  } catch (error) {
    logger.error(
      'Failed to fetch my permissions',
      error instanceof Error ? error : new Error(String(error)),
      {
        context: 'listMyPermissions',
      }
    );
    return [];
  }
}

export async function listUsersByGroup(
  groupId: string,
  includeExpired = false
): Promise<UserInGroup[]> {
  try {
    const params = new URLSearchParams();
    if (includeExpired) params.append('includeExpired', 'true');

    const queryString = params.toString();
    const response = await apiClient.get<
      | { users: UserInGroup[] }
      | UserInGroup[]
      | { data: UserInGroup[] }
      | { userIds: string[] }
    >(
      `${API_ENDPOINTS.RBAC.GROUPS.USERS(groupId)}${queryString ? `?${queryString}` : ''}`
    );

    // Handle { userIds: [...] } format (API returns only IDs, need to fetch user details)
    if (response && 'userIds' in response && Array.isArray(response.userIds)) {
      if (response.userIds.length === 0) {
        return [];
      }

      // Fetch user details for each ID
      const userDetailsPromises = response.userIds.map(
        async (userId: string) => {
          try {
            const userResponse = await apiClient.get<{ user: UserInGroup }>(
              API_ENDPOINTS.USERS.GET(userId)
            );
            const user = (userResponse as { user: UserInGroup }).user;
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              assignedAt: new Date().toISOString(),
              expiresAt: null,
            } as UserInGroup;
          } catch (error) {
            logger.error(
              'Failed to fetch user details',
              error instanceof Error ? error : new Error(String(error)),
              {
                userId,
              }
            );
            return null;
          }
        }
      );

      const users = await Promise.all(userDetailsPromises);
      return users.filter((u): u is UserInGroup => u !== null);
    }

    // Handle multiple response formats
    if (Array.isArray(response)) {
      return response;
    }

    if (response && 'users' in response && Array.isArray(response.users)) {
      return response.users;
    }

    if (
      response &&
      'data' in response &&
      Array.isArray((response as { data: UserInGroup[] }).data)
    ) {
      return (response as { data: UserInGroup[] }).data;
    }

    logger.debug('Unexpected response format from listUsersByGroup', {
      responseKeys: response ? Object.keys(response) : null,
    });
    return [];
  } catch (error) {
    logger.error(
      'Failed to fetch users for group',
      error instanceof Error ? error : new Error(String(error)),
      {
        groupId,
      }
    );
    throw error;
  }
}

export async function removeGroupFromUser(
  userId: string,
  groupId: string
): Promise<void> {
  await apiClient.delete<void>(
    API_ENDPOINTS.RBAC.USERS.REMOVE_GROUP(userId, groupId)
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Verifica se um usuario tem uma permissao especifica
 */
export async function checkUserPermission(
  userId: string,
  permissionCode: string
): Promise<boolean> {
  const permissions = await listUserPermissions(userId);
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }
  const permission = permissions.find(p => {
    // Formato 1: { permission: { code } }
    if (p?.permission?.code === permissionCode) return true;
    // Formato 2: { code } direto
    if ((p as unknown as { code?: string })?.code === permissionCode)
      return true;
    return false;
  });
  if (!permission) return false;
  // Formato 1: { effect: 'allow' }
  if (permission.effect) return permission.effect === 'allow';
  // Formato 2: assume 'allow' se nao tem effect
  return true;
}

/**
 * Cria um mapa de permissoes para verificacao rapida
 * Suporta dois formatos de resposta da API:
 * 1. { permission: { code: '...' }, effect: 'allow' }
 * 2. { code: '...', effect: 'allow' } ou { code: '...' } (assume 'allow')
 */
export function createPermissionMap(
  permissions: EffectivePermission[] | undefined | null
): Map<string, 'allow' | 'deny'> {
  const map = new Map<string, 'allow' | 'deny'>();
  if (!permissions || !Array.isArray(permissions)) {
    return map;
  }
  permissions.forEach(p => {
    // Formato 1: { permission: { code }, effect }
    if (p?.permission?.code && p?.effect) {
      map.set(p.permission.code, p.effect);
    }
    // Formato 2: { code, effect } ou { code } (permissao direta, assume 'allow')
    else if ((p as unknown as { code?: string })?.code) {
      const directPermission = p as unknown as {
        code: string;
        effect?: 'allow' | 'deny';
      };
      map.set(directPermission.code, directPermission.effect || 'allow');
    }
  });
  return map;
}

/**
 * Verifica se uma permissao e negada (deny > allow)
 */
export function isPermissionDenied(
  permissionMap: Map<string, 'allow' | 'deny'>,
  code: string
): boolean {
  if (permissionMap.get(code) === 'deny') {
    return true;
  }
  return false;
}

/**
 * Verifica se uma permissao e permitida
 * Suporta wildcards:
 * - '*.*.*' = acesso total (super admin)
 * - 'module.*.*' = acesso a todo o modulo
 * - 'module.resource.*' = acesso a todas as acoes do recurso
 * - 'module.resource.manage' = implica acesso a todas as acoes do recurso
 */
export function isPermissionAllowed(
  permissionMap: Map<string, 'allow' | 'deny'>,
  code: string
): boolean {
  // Se a permissao especifica esta negada, retorna false
  if (permissionMap.get(code) === 'deny') {
    return false;
  }

  // Se tem a permissao especifica, retorna true
  if (permissionMap.get(code) === 'allow') {
    return true;
  }

  // Verifica wildcard total (super admin)
  if (permissionMap.get('*.*.*') === 'allow') {
    return true;
  }

  // Parse do codigo: module.resource.action
  const parts = code.split('.');
  if (parts.length >= 3) {
    const [module, resource] = parts;

    // Verifica wildcard de modulo: module.*.*
    if (permissionMap.get(`${module}.*.*`) === 'allow') {
      return true;
    }

    // Verifica wildcard de recurso: module.resource.*
    if (permissionMap.get(`${module}.${resource}.*`) === 'allow') {
      return true;
    }

    // Verifica se tem 'manage' no mesmo recurso (manage implica em todas as acoes)
    if (permissionMap.get(`${module}.${resource}.manage`) === 'allow') {
      return true;
    }
  }

  return false;
}

/**
 * Lista todos os usuarios do sistema
 */
export async function listAllUsers() {
  try {
    const response = await apiClient.get<unknown>(API_ENDPOINTS.USERS.LIST);
    return (
      (response as { users?: unknown[] }).users || (response as unknown[]) || []
    );
  } catch (error) {
    logger.error(
      'Failed to list all users',
      error instanceof Error ? error : new Error(String(error)),
      {
        context: 'listAllUsers',
      }
    );
    throw error;
  }
}
