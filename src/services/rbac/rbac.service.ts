import { authConfig } from '@/config/api';
import type {
  AddPermissionToGroupDTO,
  AssignGroupToUserDTO,
  CreatePermissionDTO,
  CreatePermissionGroupDTO,
  EffectivePermission,
  GroupWithExpiration,
  ListPermissionGroupsQuery,
  ListPermissionsQuery,
  PaginatedResponse,
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3333';
const RBAC_BASE = '/v1/rbac';

// ============================================
// CUSTOM ERRORS
// ============================================

export class UnauthorizedError extends Error {
  constructor(
    message = 'Você não está autenticado. Faça login para continuar.'
  ) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Você não tem permissão para acessar este recurso.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// ============================================
// HELPERS
// ============================================

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(authConfig.tokenKey)
      : null;

  const url = `${API_BASE_URL}${RBAC_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Tratar erros de autenticação/autorização
      if (response.status === 401) {
        throw new UnauthorizedError();
      }

      if (response.status === 403) {
        const error = await response.json().catch(() => ({}));
        throw new ForbiddenError(
          error.message || 'Você não tem permissão para acessar este recurso.'
        );
      }

      const error = await response.json().catch(() => ({
        message: 'Erro desconhecido',
      }));
      throw new Error(error.message || `HTTP Error ${response.status}`);
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    console.error(`RBAC fetch error at ${url}:`, error);
    throw error;
  }
}

// ============================================
// PERMISSIONS
// ============================================

export async function createPermission(
  data: CreatePermissionDTO
): Promise<Permission> {
  const response = await fetchWithAuth<PermissionResponse>('/permissions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.permission;
}

export async function listPermissions(
  query?: ListPermissionsQuery
): Promise<PaginatedResponse<Permission>> {
  const params = new URLSearchParams();
  if (query?.module) params.append('module', query.module);
  if (query?.resource) params.append('resource', query.resource);
  if (query?.action) params.append('action', query.action);
  if (query?.isSystem !== undefined)
    params.append('isSystem', String(query.isSystem));
  if (query?.page) params.append('page', String(query.page));
  if (query?.limit) params.append('limit', String(query.limit));

  const queryString = params.toString();
  return fetchWithAuth<PaginatedResponse<Permission>>(
    `/permissions${queryString ? `?${queryString}` : ''}`
  );
}

export async function getPermissionByCode(code: string): Promise<Permission> {
  const response = await fetchWithAuth<PermissionResponse>(
    `/permissions/code/${code}`
  );
  return response.permission;
}

export async function getPermissionById(id: string): Promise<Permission> {
  const response = await fetchWithAuth<PermissionResponse>(
    `/permissions/${id}`
  );
  return response.permission;
}

export async function updatePermission(
  id: string,
  data: UpdatePermissionDTO
): Promise<Permission> {
  const response = await fetchWithAuth<PermissionResponse>(
    `/permissions/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.permission;
}

export async function deletePermission(id: string): Promise<void> {
  await fetchWithAuth<void>(`/permissions/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// PERMISSION GROUPS
// ============================================

export async function createPermissionGroup(
  data: CreatePermissionGroupDTO
): Promise<PermissionGroup> {
  const response = await fetchWithAuth<PermissionGroupResponse>(
    '/permission-groups',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.group;
}

export async function listPermissionGroups(
  query?: ListPermissionGroupsQuery
): Promise<PaginatedResponse<PermissionGroup>> {
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
  return fetchWithAuth<PaginatedResponse<PermissionGroup>>(
    `/permission-groups${queryString ? `?${queryString}` : ''}`
  );
}

export async function getPermissionGroupById(
  id: string
): Promise<PermissionGroup> {
  const response = await fetchWithAuth<PermissionGroupResponse>(
    `/permission-groups/${id}`
  );
  return response.group;
}

export async function updatePermissionGroup(
  id: string,
  data: UpdatePermissionGroupDTO
): Promise<PermissionGroup> {
  const response = await fetchWithAuth<PermissionGroupResponse>(
    `/permission-groups/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.group;
}

export async function deletePermissionGroup(
  id: string,
  force = false
): Promise<void> {
  await fetchWithAuth<void>(`/permission-groups/${id}?force=${force}`, {
    method: 'DELETE',
  });
}

// ============================================
// GROUP ↔ PERMISSIONS
// ============================================

export async function addPermissionToGroup(
  groupId: string,
  data: AddPermissionToGroupDTO
): Promise<boolean> {
  const response = await fetchWithAuth<SuccessResponse>(
    `/permission-groups/${groupId}/permissions`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.success;
}

export async function listGroupPermissions(
  groupId: string
): Promise<PermissionWithEffect[]> {
  const response = await fetchWithAuth<{ permissions: PermissionWithEffect[] }>(
    `/permission-groups/${groupId}/permissions`
  );
  return response.permissions;
}

export async function removePermissionFromGroup(
  groupId: string,
  permissionCode: string
): Promise<void> {
  await fetchWithAuth<void>(
    `/permission-groups/${groupId}/permissions/${permissionCode}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================
// USER ↔ GROUPS
// ============================================

export async function assignGroupToUser(
  userId: string,
  data: AssignGroupToUserDTO
): Promise<boolean> {
  const response = await fetchWithAuth<SuccessResponse>(
    `/users/${userId}/groups`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
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
  const response = await fetchWithAuth<{ groups: GroupWithExpiration[] }>(
    `/users/${userId}/groups${queryString ? `?${queryString}` : ''}`
  );
  return response.groups;
}

export async function listUserPermissions(
  userId: string
): Promise<EffectivePermission[]> {
  const response = await fetchWithAuth<{ permissions: EffectivePermission[] }>(
    `/users/${userId}/permissions`
  );
  return response.permissions;
}

export async function listUsersByGroup(
  groupId: string,
  includeExpired = false
): Promise<UserInGroup[]> {
  const params = new URLSearchParams();
  if (includeExpired) params.append('includeExpired', 'true');

  const queryString = params.toString();
  const response = await fetchWithAuth<{ users: UserInGroup[] }>(
    `/permission-groups/${groupId}/users${queryString ? `?${queryString}` : ''}`
  );
  return response.users;
}

export async function removeGroupFromUser(
  userId: string,
  groupId: string
): Promise<void> {
  await fetchWithAuth<void>(`/users/${userId}/groups/${groupId}`, {
    method: 'DELETE',
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Verifica se um usuário tem uma permissão específica
 */
export async function checkUserPermission(
  userId: string,
  permissionCode: string
): Promise<boolean> {
  const permissions = await listUserPermissions(userId);
  const permission = permissions.find(
    p => p.permission.code === permissionCode
  );
  return permission?.effect === 'allow';
}

/**
 * Cria um mapa de permissões para verificação rápida
 */
export function createPermissionMap(
  permissions: EffectivePermission[]
): Map<string, 'allow' | 'deny'> {
  const map = new Map<string, 'allow' | 'deny'>();
  permissions.forEach(p => {
    map.set(p.permission.code, p.effect);
  });
  return map;
}

/**
 * Verifica se uma permissão é negada (deny > allow)
 */
export function isPermissionDenied(
  permissionMap: Map<string, 'allow' | 'deny'>,
  code: string
): boolean {
  return permissionMap.get(code) === 'deny';
}

/**
 * Verifica se uma permissão é permitida
 */
export function isPermissionAllowed(
  permissionMap: Map<string, 'allow' | 'deny'>,
  code: string
): boolean {
  return permissionMap.get(code) === 'allow';
}
