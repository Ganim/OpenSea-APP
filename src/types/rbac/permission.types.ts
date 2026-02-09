/**
 * OpenSea OS - RBAC Permission Types
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

export interface EffectivePermission {
  permission: Permission;
  effect: 'allow' | 'deny';
  source: 'direct' | 'inherited';
  groupIds: string[];
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

// ============================================
// API RESPONSES
// ============================================

export interface PermissionResponse {
  permission: Permission;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
