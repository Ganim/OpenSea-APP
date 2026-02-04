import { z } from 'zod';
import type {
  TenantSettings,
  FeatureFlagMetadata,
  PlanSettings,
} from '@/types/settings';

/**
 * Schemas para validação de responses da API Admin
 * Garante type-safety e validação de dados do backend
 */

// =====================================
// ENUMS
// =====================================

export const TenantStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const PlanTierEnum = z.enum([
  'FREE',
  'STARTER',
  'PROFESSIONAL',
  'ENTERPRISE',
]);

export const AdminModulesEnum = z.enum([
  'CORE',
  'STOCK',
  'SALES',
  'HR',
  'PAYROLL',
  'REPORTS',
  'AUDIT',
  'REQUESTS',
]);

// =====================================
// ADMIN TENANT
// =====================================

export const AdminTenantSchema = z.object({
  id: z.string().uuid('TenantId deve ser um UUID válido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  logoUrl: z.string().url('Logo deve ser uma URL válida').nullable(),
  status: TenantStatusEnum,
  settings: z.custom<TenantSettings>().optional().default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AdminTenant = z.infer<typeof AdminTenantSchema>;

export const AdminTenantsListResponseSchema = z.object({
  tenants: z.array(AdminTenantSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    perPage: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type AdminTenantsListResponse = z.infer<
  typeof AdminTenantsListResponseSchema
>;

export const TenantDetailSchema = z.object({
  tenant: AdminTenantSchema,
  plan: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      tier: PlanTierEnum,
      description: z.string().nullable(),
      price: z.number().nonnegative(),
      isActive: z.boolean(),
      maxUsers: z.number().int().positive(),
      maxWarehouses: z.number().int().positive(),
      maxProducts: z.number().int().positive(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
    .nullable(),
  users: z.array(
    z.object({
      id: z.string().uuid(),
      tenantId: z.string().uuid(),
      userId: z.string().uuid(),
      role: z.string(),
      joinedAt: z.coerce.date(),
      user: z
        .object({
          id: z.string().uuid(),
          email: z.string().email(),
          username: z.string().optional(),
        })
        .optional(),
    })
  ),
  featureFlags: z.array(
    z.object({
      id: z.string().uuid(),
      tenantId: z.string().uuid(),
      flag: z.string(),
      enabled: z.boolean(),
      metadata: z.custom<FeatureFlagMetadata>().optional().default({}),
    })
  ),
});

export type TenantDetail = z.infer<typeof TenantDetailSchema>;

// =====================================
// ADMIN PLAN
// =====================================

export const AdminPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  tier: PlanTierEnum,
  description: z.string().nullable(),
  price: z.number().nonnegative(),
  isActive: z.boolean(),
  maxUsers: z.number().int().positive(),
  maxWarehouses: z.number().int().positive(),
  maxProducts: z.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AdminPlan = z.infer<typeof AdminPlanSchema>;

export const AdminPlansListResponseSchema = z.object({
  plans: z.array(AdminPlanSchema),
});

export type AdminPlansListResponse = z.infer<
  typeof AdminPlansListResponseSchema
>;

export const AdminPlanModuleSchema = z.object({
  id: z.string().uuid(),
  planId: z.string().uuid(),
  module: AdminModulesEnum,
});

export type AdminPlanModule = z.infer<typeof AdminPlanModuleSchema>;

export const AdminPlanDetailSchema = z.object({
  plan: AdminPlanSchema,
  modules: z.array(AdminPlanModuleSchema),
});

export type AdminPlanDetail = z.infer<typeof AdminPlanDetailSchema>;

// =====================================
// ADMIN TENANT USER
// =====================================

export const AdminTenantUserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.string().min(1),
  joinedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      username: z.string().optional(),
    })
    .optional(),
});

export type AdminTenantUser = z.infer<typeof AdminTenantUserSchema>;

export const AdminTenantUsersListResponseSchema = z.object({
  tenantUsers: z.array(AdminTenantUserSchema),
});

export type AdminTenantUsersListResponse = z.infer<
  typeof AdminTenantUsersListResponseSchema
>;

// =====================================
// ADMIN FEATURE FLAG
// =====================================

export const AdminFeatureFlagSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  flag: z.string().min(1),
  enabled: z.boolean(),
  metadata: z.custom<FeatureFlagMetadata>().optional().default({}),
});

export type AdminFeatureFlag = z.infer<typeof AdminFeatureFlagSchema>;

// =====================================
// DASHBOARD
// =====================================

export const DashboardStatsSchema = z.object({
  totalTenants: z.number().int().nonnegative(),
  totalPlans: z.number().int().nonnegative(),
  activePlans: z.number().int().nonnegative(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
