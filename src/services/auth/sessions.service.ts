import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  RefreshTokenRequest,
  RefreshTokenResponse,
  SessionDateQuery,
  SessionsResponse,
} from '@/types/auth';
import { authService } from './auth.service';

export const sessionsService = {
  // GET /v1/sessions/user/:userId
  async listUserSessions(userId: string): Promise<SessionsResponse> {
    return apiClient.get<SessionsResponse>(
      API_ENDPOINTS.SESSIONS.LIST_USER(userId)
    );
  },

  // GET /v1/sessions/user/:userId/by-date
  async listUserSessionsByDate(
    userId: string,
    query?: SessionDateQuery
  ): Promise<SessionsResponse> {
    return apiClient.get<SessionsResponse>(
      API_ENDPOINTS.SESSIONS.LIST_USER_BY_DATE(userId),
      { params: query as Record<string, string> }
    );
  },

  // GET /v1/sessions
  async listMySessions(): Promise<SessionsResponse> {
    return apiClient.get<SessionsResponse>(API_ENDPOINTS.SESSIONS.LIST_MY);
  },

  // GET /v1/sessions/active
  async listActiveSessions(): Promise<SessionsResponse> {
    return apiClient.get<SessionsResponse>(API_ENDPOINTS.SESSIONS.LIST_ACTIVE);
  },

  // PATCH /v1/sessions/refresh
  async refreshToken(
    data?: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const refreshToken =
      data?.refreshToken || authService.getRefreshToken() || '';

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Backend requer apenas Authorization header, sem body
    // Refresh token é single-use: retorna novo access token E novo refresh token
    const response = await apiClient.patch<RefreshTokenResponse>(
      API_ENDPOINTS.SESSIONS.REFRESH,
      undefined,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    // IMPORTANTE: Sempre salvar ambos os tokens retornados (single-use)
    if (response.token) {
      authService.setToken(response.token);
    }
    if (response.refreshToken) {
      authService.setRefreshToken(response.refreshToken);
    }

    return response;
  },

  // PATCH /v1/sessions/logout
  // Backend retorna 204 No Content
  async logout(): Promise<void> {
    try {
      await apiClient.patch<void>(API_ENDPOINTS.SESSIONS.LOGOUT);
    } finally {
      authService.clearTokens();
    }
  },

  // PATCH /v1/sessions/:sessionId/revoke
  // Backend retorna 204 No Content
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.patch<void>(API_ENDPOINTS.SESSIONS.REVOKE(sessionId));
  },

  // PATCH /v1/sessions/:sessionId/expire
  // Backend retorna 204 No Content
  async expireSession(sessionId: string): Promise<void> {
    await apiClient.patch<void>(API_ENDPOINTS.SESSIONS.EXPIRE(sessionId));
  },
};
