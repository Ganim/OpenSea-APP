import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import {
  AdminTenantSchema,
  AdminTenantsListResponseSchema,
  TenantDetailSchema,
  AdminPlanSchema,
  AdminPlansListResponseSchema,
  AdminPlanDetailSchema,
  AdminPlanModuleSchema,
  AdminTenantUserSchema,
  AdminTenantUsersListResponseSchema,
  AdminFeatureFlagSchema,
  DashboardStatsSchema,
  type AdminTenant,
  type AdminTenantsListResponse,
  type TenantDetail,
  type AdminPlan,
  type AdminPlansListResponse,
  type AdminPlanDetail,
  type AdminPlanModule,
  type AdminTenantUser,
  type AdminTenantUsersListResponse,
  type AdminFeatureFlag,
  type DashboardStats,
} from '@/schemas/admin.schemas';

// Re-export types for backward compatibility
export type {
  AdminTenant,
  AdminTenantsListResponse,
  TenantDetail,
  AdminPlan,
  AdminPlansListResponse,
  AdminPlanDetail,
  AdminPlanModule,
  AdminTenantUser,
  AdminTenantUsersListResponse,
  AdminFeatureFlag,
  DashboardStats,
};

// API functions
export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get<unknown>(
      API_ENDPOINTS.ADMIN.DASHBOARD
    );
    return DashboardStatsSchema.parse(response);
  },

  // Tenants
  listTenants: async (page = 1, limit = 20) => {
    const response = await apiClient.get<unknown>(
      `${API_ENDPOINTS.ADMIN.TENANTS.LIST}?page=${page}&limit=${limit}`
    );
    return AdminTenantsListResponseSchema.parse(response);
  },

  getTenantDetails: async (id: string) => {
    const response = await apiClient.get<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.GET(id)
    );
    return TenantDetailSchema.parse(response);
  },

  changeTenantStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.CHANGE_STATUS(id),
      { status }
    );
    return AdminTenantSchema.parse(
      (response as Record<string, unknown>).tenant
    );
  },

  changeTenantPlan: async (id: string, planId: string) => {
    const response = await apiClient.patch<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.CHANGE_PLAN(id),
      { planId }
    );
    return response;
  },

  manageFeatureFlags: async (id: string, flag: string, enabled: boolean) => {
    const response = await apiClient.patch<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.FEATURE_FLAGS(id),
      { flag, enabled }
    );
    return AdminFeatureFlagSchema.parse(
      (response as Record<string, unknown>).featureFlag
    );
  },

  createTenant: async (data: {
    name: string;
    slug?: string;
    logoUrl?: string | null;
    status?: string;
  }) => {
    const response = await apiClient.post<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.CREATE,
      data
    );
    return AdminTenantSchema.parse(
      (response as Record<string, unknown>).tenant
    );
  },

  updateTenant: async (
    id: string,
    data: {
      name?: string;
      slug?: string;
      logoUrl?: string | null;
      settings?: Record<string, unknown>;
    }
  ) => {
    const response = await apiClient.put<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.UPDATE(id),
      data
    );
    return AdminTenantSchema.parse(
      (response as Record<string, unknown>).tenant
    );
  },

  deleteTenant: async (id: string) => {
    const response = await apiClient.delete<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.DELETE(id)
    );
    return AdminTenantSchema.parse(
      (response as Record<string, unknown>).tenant
    );
  },

  listTenantUsers: async (id: string) => {
    const response = await apiClient.get<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.USERS(id)
    );
    return AdminTenantUsersListResponseSchema.parse(response);
  },

  createTenantUser: async (
    id: string,
    data: { email: string; password: string; username?: string; role?: string }
  ) => {
    const response = await apiClient.post<unknown>(
      API_ENDPOINTS.ADMIN.TENANTS.CREATE_USER(id),
      data
    );
    return {
      user: (response as Record<string, unknown>).user as Record<
        string,
        unknown
      >,
      tenantUser: AdminTenantUserSchema.parse(
        (response as Record<string, unknown>).tenantUser
      ),
    };
  },

  removeTenantUser: async (id: string, userId: string) => {
    await apiClient.delete<void>(
      API_ENDPOINTS.ADMIN.TENANTS.REMOVE_USER(id, userId)
    );
  },

  // Plans
  listPlans: async () => {
    const response = await apiClient.get<unknown>(
      API_ENDPOINTS.ADMIN.PLANS.LIST
    );
    return AdminPlansListResponseSchema.parse(response);
  },

  getPlan: async (id: string) => {
    const response = await apiClient.get<unknown>(
      API_ENDPOINTS.ADMIN.PLANS.GET(id)
    );
    return AdminPlanDetailSchema.parse(response);
  },

  createPlan: async (data: Partial<AdminPlan>) => {
    const response = await apiClient.post<unknown>(
      API_ENDPOINTS.ADMIN.PLANS.CREATE,
      data
    );
    return AdminPlanSchema.parse((response as Record<string, unknown>).plan);
  },

  updatePlan: async (id: string, data: Partial<AdminPlan>) => {
    const response = await apiClient.put<unknown>(
      API_ENDPOINTS.ADMIN.PLANS.UPDATE(id),
      data
    );
    return AdminPlanSchema.parse((response as Record<string, unknown>).plan);
  },

  deletePlan: async (id: string) => {
    const response = await apiClient.delete<unknown>(
      API_ENDPOINTS.ADMIN.PLANS.DELETE(id)
    );
    return AdminPlanSchema.parse((response as Record<string, unknown>).plan);
  },

  setPlanModules: async (id: string, modules: string[]) => {
    const response = await apiClient.put<unknown>(
      API_ENDPOINTS.ADMIN.PLANS.SET_MODULES(id),
      { modules }
    );
    return (response as Record<string, unknown>).modules as AdminPlanModule[];
  },
};
