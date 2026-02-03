import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  AuditLogsQuery,
  AuditLogsResponse,
  GroupsResponse,
  MessageResponse,
  PermissionsResponse,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  UpdateUsernameRequest,
  UserResponse,
} from '@/types/auth';
import type { Employee } from '@/types/hr';

export interface EmployeeResponse {
  employee: Employee;
}

export const meService = {
  // GET /v1/me
  async getMe(): Promise<UserResponse> {
    return apiClient.get<UserResponse>(API_ENDPOINTS.ME.GET);
  },

  // PATCH /v1/me/profile
  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    // Backend expects { profile: { ... } } structure
    return apiClient.patch<UserResponse>(API_ENDPOINTS.ME.UPDATE, {
      profile: data,
    });
  },

  // PATCH /v1/me/email
  async updateEmail(data: UpdateEmailRequest): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(API_ENDPOINTS.ME.UPDATE_EMAIL, data);
  },

  // PATCH /v1/me/username
  async updateUsername(data: UpdateUsernameRequest): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(
      API_ENDPOINTS.ME.UPDATE_USERNAME,
      data
    );
  },

  // PATCH /v1/me/password
  async updatePassword(data: UpdatePasswordRequest): Promise<MessageResponse> {
    return apiClient.patch<MessageResponse>(
      API_ENDPOINTS.ME.UPDATE_PASSWORD,
      data
    );
  },

  // DELETE /v1/me
  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.ME.DELETE);
  },

  // GET /v1/me/employee
  async getMyEmployee(): Promise<EmployeeResponse> {
    return apiClient.get<EmployeeResponse>(API_ENDPOINTS.ME.EMPLOYEE);
  },

  // GET /v1/me/audit-logs
  async getMyAuditLogs(query?: AuditLogsQuery): Promise<AuditLogsResponse> {
    const params: Record<string, string> = {};
    if (query?.action) params.action = query.action;
    if (query?.entity) params.entity = query.entity;
    if (query?.module) params.module = query.module;
    if (query?.entityId) params.entityId = query.entityId;
    if (query?.startDate) params.startDate = query.startDate;
    if (query?.endDate) params.endDate = query.endDate;
    if (query?.page) params.page = String(query.page);
    if (query?.limit) params.limit = String(query.limit);

    return apiClient.get<AuditLogsResponse>(API_ENDPOINTS.ME.AUDIT_LOGS, {
      params,
    });
  },

  // GET /v1/me/permissions
  async getMyPermissions(): Promise<PermissionsResponse> {
    return apiClient.get<PermissionsResponse>(API_ENDPOINTS.ME.PERMISSIONS);
  },

  // GET /v1/me/groups
  async getMyGroups(): Promise<GroupsResponse> {
    return apiClient.get<GroupsResponse>(API_ENDPOINTS.ME.GROUPS);
  },
};
