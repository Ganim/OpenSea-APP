import { apiClient } from '@/lib/api-client';

export interface AuthLinkDTO {
  id: string;
  userId: string;
  tenantId: string | null;
  provider: string;
  identifier: string;
  hasCredential: boolean;
  metadata: Record<string, unknown> | null;
  status: 'ACTIVE' | 'INACTIVE';
  linkedAt: string;
  unlinkedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface TenantAuthConfigDTO {
  id: string;
  tenantId: string;
  allowedMethods: string[];
  magicLinkEnabled: boolean;
  magicLinkExpiresIn: number;
  defaultMethod: string | null;
}

export const authLinksService = {
  // Self-service (current user)
  async listMine(): Promise<{ authLinks: AuthLinkDTO[] }> {
    return apiClient.get('/v1/me/auth-links');
  },

  async link(data: {
    provider: string;
    identifier: string;
    currentPassword: string;
  }): Promise<{ authLink: AuthLinkDTO }> {
    return apiClient.post('/v1/me/auth-links', data);
  },

  async toggleStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE'
  ): Promise<{ authLink: AuthLinkDTO }> {
    return apiClient.patch(`/v1/me/auth-links/${id}`, { status });
  },

  async unlink(id: string): Promise<void> {
    return apiClient.delete(`/v1/me/auth-links/${id}`);
  },

  // Admin (manage other users)
  async listForUser(userId: string): Promise<{ authLinks: AuthLinkDTO[] }> {
    return apiClient.get(`/v1/users/${userId}/auth-links`);
  },

  async adminLink(
    userId: string,
    data: { provider: string; identifier: string }
  ): Promise<{ authLink: AuthLinkDTO }> {
    return apiClient.post(`/v1/users/${userId}/auth-links`, data);
  },

  async adminToggle(
    userId: string,
    linkId: string,
    status: 'ACTIVE' | 'INACTIVE'
  ): Promise<{ authLink: AuthLinkDTO }> {
    return apiClient.patch(`/v1/users/${userId}/auth-links/${linkId}`, {
      status,
    });
  },

  async adminUnlink(userId: string, linkId: string): Promise<void> {
    return apiClient.delete(`/v1/users/${userId}/auth-links/${linkId}`);
  },

  // Tenant auth config
  async getTenantAuthConfig(): Promise<TenantAuthConfigDTO> {
    return apiClient.get('/v1/tenant-auth-config');
  },

  async updateTenantAuthConfig(
    data: Partial<TenantAuthConfigDTO>
  ): Promise<TenantAuthConfigDTO> {
    return apiClient.put('/v1/tenant-auth-config', data);
  },
};
