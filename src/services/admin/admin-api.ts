import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

// Types
export interface DashboardStats {
  totalTenants: number;
  totalPlans: number;
  activePlans: number;
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantDetail {
  tenant: AdminTenant;
  plan: AdminPlan | null;
  users: AdminTenantUser[];
  featureFlags: AdminFeatureFlag[];
}

export interface AdminPlan {
  id: string;
  name: string;
  tier: string;
  description: string | null;
  price: number;
  isActive: boolean;
  maxUsers: number;
  maxWarehouses: number;
  maxProducts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPlanModule {
  id: string;
  planId: string;
  module: string;
}

export interface AdminTenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface AdminFeatureFlag {
  id: string;
  tenantId: string;
  flag: string;
  enabled: boolean;
  metadata: Record<string, unknown>;
}

// API functions
export const adminApi = {
  // Dashboard
  getDashboardStats: () =>
    apiClient.get<DashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD),

  // Tenants
  listTenants: (page = 1, limit = 20) =>
    apiClient.get<{
      tenants: AdminTenant[];
      meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
      };
    }>(`${API_ENDPOINTS.ADMIN.TENANTS.LIST}?page=${page}&limit=${limit}`),

  getTenantDetails: (id: string) =>
    apiClient.get<TenantDetail>(API_ENDPOINTS.ADMIN.TENANTS.GET(id)),

  changeTenantStatus: (id: string, status: string) =>
    apiClient.patch<{ tenant: AdminTenant }>(
      API_ENDPOINTS.ADMIN.TENANTS.CHANGE_STATUS(id),
      { status }
    ),

  changeTenantPlan: (id: string, planId: string) =>
    apiClient.patch<{ tenantPlan: unknown }>(
      API_ENDPOINTS.ADMIN.TENANTS.CHANGE_PLAN(id),
      { planId }
    ),

  manageFeatureFlags: (id: string, flag: string, enabled: boolean) =>
    apiClient.patch<{ featureFlag: AdminFeatureFlag }>(
      API_ENDPOINTS.ADMIN.TENANTS.FEATURE_FLAGS(id),
      { flag, enabled }
    ),

  createTenant: (data: {
    name: string;
    slug?: string;
    logoUrl?: string | null;
    status?: string;
  }) =>
    apiClient.post<{ tenant: AdminTenant }>(
      API_ENDPOINTS.ADMIN.TENANTS.CREATE,
      data
    ),

  updateTenant: (
    id: string,
    data: {
      name?: string;
      slug?: string;
      logoUrl?: string | null;
      settings?: Record<string, unknown>;
    }
  ) =>
    apiClient.put<{ tenant: AdminTenant }>(
      API_ENDPOINTS.ADMIN.TENANTS.UPDATE(id),
      data
    ),

  deleteTenant: (id: string) =>
    apiClient.delete<{ tenant: AdminTenant }>(
      API_ENDPOINTS.ADMIN.TENANTS.DELETE(id)
    ),

  listTenantUsers: (id: string) =>
    apiClient.get<{ users: AdminTenantUser[] }>(
      API_ENDPOINTS.ADMIN.TENANTS.USERS(id)
    ),

  createTenantUser: (
    id: string,
    data: { email: string; password: string; username?: string; role?: string }
  ) =>
    apiClient.post<{
      user: { id: string; email: string; username: string; createdAt: Date };
      tenantUser: AdminTenantUser;
    }>(API_ENDPOINTS.ADMIN.TENANTS.CREATE_USER(id), data),

  removeTenantUser: (id: string, userId: string) =>
    apiClient.delete<void>(API_ENDPOINTS.ADMIN.TENANTS.REMOVE_USER(id, userId)),

  // Plans
  listPlans: () =>
    apiClient.get<{ plans: AdminPlan[] }>(API_ENDPOINTS.ADMIN.PLANS.LIST),

  getPlan: (id: string) =>
    apiClient.get<{ plan: AdminPlan; modules: AdminPlanModule[] }>(
      API_ENDPOINTS.ADMIN.PLANS.GET(id)
    ),

  createPlan: (data: Partial<AdminPlan>) =>
    apiClient.post<{ plan: AdminPlan }>(API_ENDPOINTS.ADMIN.PLANS.CREATE, data),

  updatePlan: (id: string, data: Partial<AdminPlan>) =>
    apiClient.put<{ plan: AdminPlan }>(
      API_ENDPOINTS.ADMIN.PLANS.UPDATE(id),
      data
    ),

  deletePlan: (id: string) =>
    apiClient.delete<{ plan: AdminPlan }>(API_ENDPOINTS.ADMIN.PLANS.DELETE(id)),

  setPlanModules: (id: string, modules: string[]) =>
    apiClient.put<{ modules: AdminPlanModule[] }>(
      API_ENDPOINTS.ADMIN.PLANS.SET_MODULES(id),
      { modules }
    ),
};
