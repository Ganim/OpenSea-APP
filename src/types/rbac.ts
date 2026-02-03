/**
 * OpenSea OS - RBAC Types
 * Tipos TypeScript para sistema de controle de acesso baseado em funções
 */

// ============================================
// PERMISSION
// ============================================

export interface Permission {
  id: string;
  code: string; // module.resource.action (ex: stock.products.create)
  name: string;
  description: string | null;
  module: string;
  resource: string;
  action: string;
  isSystem: boolean;
  metadata: Record<string, unknown>;
  createdAt: string; // ISO 8601
  updatedAt?: string;
}

export interface CreatePermissionDTO {
  code: string;
  name: string;
  description?: string | null;
  module: string;
  resource: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePermissionDTO {
  name?: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ListPermissionsQuery {
  module?: string;
  resource?: string;
  action?: string;
  isSystem?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// PERMISSION GROUP
// ============================================

export interface PermissionGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null; // hex color (#RRGGBB)
  priority: number;
  isActive: boolean;
  isSystem: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  usersCount?: number; // Novo campo da API
  permissionsCount?: number; // Novo campo da API
}

export interface PermissionGroupWithDetails extends PermissionGroup {
  users: UserInGroup[];
  usersCount: number;
  permissions: PermissionWithEffect[];
  permissionsCount: number;
}

export interface CreatePermissionGroupDTO {
  name: string;
  description?: string | null;
  color?: string; // #RRGGBB
  priority?: number; // default: 100
  parentId?: string | null;
}

export interface UpdatePermissionGroupDTO {
  name?: string;
  description?: string | null;
  color?: string | null;
  priority?: number;
  parentId?: string | null;
  isActive?: boolean;
}

export interface ListPermissionGroupsQuery {
  isActive?: boolean;
  isSystem?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// ASSOCIATIONS
// ============================================

export interface PermissionWithEffect extends Permission {
  effect: 'allow' | 'deny';
  conditions: Record<string, unknown> | null;
}

export interface AddPermissionToGroupDTO {
  permissionCode: string;
  effect?: 'allow' | 'deny'; // default: 'allow'
  conditions?: Record<string, unknown> | null;
}

export interface AssignGroupToUserDTO {
  groupId: string;
  expiresAt?: string | null; // ISO 8601
  grantedBy?: string | null;
}

export interface GroupWithExpiration {
  group: PermissionGroup;
  expiresAt: string | null;
  grantedAt: string;
}

export interface EffectivePermission {
  permission: Permission;
  effect: 'allow' | 'deny';
  source: 'direct' | 'inherited';
  groupIds: string[];
}

export interface UserInGroup {
  id: string;
  username: string;
  email: string;
  assignedAt: string;
  expiresAt: string | null;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PermissionResponse {
  permission: Permission;
}

export interface PermissionGroupResponse {
  group: PermissionGroup;
}

export interface SuccessResponse {
  success: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

export type PermissionEffect = 'allow' | 'deny';

export type PermissionModule =
  | 'core'
  | 'stock'
  | 'sales'
  | 'hr'
  | 'rbac'
  | 'audit'
  | 'admin'
  | 'self'
  | 'requests'
  | 'notifications'
  | 'settings'
  | 'reports'
  | 'data'
  | 'ui';

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export'
  | 'import';

// ============================================
// UI HELPERS
// ============================================

export interface PermissionGroupWithChildren extends PermissionGroup {
  children?: PermissionGroup[];
  permissions?: PermissionWithEffect[];
  users?: UserInGroup[];
  userCount?: number;
}

export interface PermissionGroupDetailResponse {
  group: PermissionGroup;
  permissions: PermissionWithEffect[];
  users: UserInGroup[];
}

export interface PermissionsByModule {
  [module: string]: {
    [resource: string]: Permission[];
  };
}

export interface AllPermissionsResponse {
  permissions: PermissionModuleGroup[];
  total: number;
  modules: string[];
}

export interface PermissionModuleGroup {
  module: string;
  description: string;
  resources: Record<string, PermissionResourceGroup>;
}

export interface PermissionResourceGroup {
  description: string;
  permissions: PermissionItemSimple[];
}

export interface PermissionItemSimple {
  id: string;
  code: string;
  name: string;
  action: string;
  isDeprecated: boolean;
}
