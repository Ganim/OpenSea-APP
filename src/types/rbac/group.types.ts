import type { Permission, PermissionWithEffect } from './permission.types';

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
  tenantId: string | null;
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

export interface UserInGroup {
  id: string;
  username: string;
  email: string;
  assignedAt: string;
  expiresAt: string | null;
}

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

// ============================================
// API RESPONSES
// ============================================

export interface PermissionGroupResponse {
  group: PermissionGroup;
}

export interface SuccessResponse {
  success: boolean;
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
