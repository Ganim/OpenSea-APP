import { API_ENDPOINTS, authConfig } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  AuthResponse,
  LoginCredentials,
  MessageResponse,
  RegisterData,
  RegisterResponse,
  ResetPasswordRequest,
  SendPasswordResetRequest,
} from '@/types/auth';

export const authService = {
  // POST /v1/auth/login/password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.token) {
      this.setToken(response.token);
      if (response.refreshToken) {
        this.setRefreshToken(response.refreshToken);
      }
    }

    return response;
  },

  // POST /v1/auth/register/password
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    return response;
  },

  // POST /v1/auth/send/password
  async sendPasswordReset(
    data: SendPasswordResetRequest
  ): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.SEND_PASSWORD_RESET,
      data
    );
  },

  // POST /v1/auth/reset/password
  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
  },

  // PATCH /v1/sessions/refresh
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // IMPORTANTE: Enviar refresh token no header Authorization, não no body
    const baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';
    const response = await fetch(
      `${baseURL}${API_ENDPOINTS.SESSIONS.REFRESH}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${refreshToken}`, // ⚠️ USA REFRESH TOKEN NO HEADER!
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    // IMPORTANTE: Substituir AMBOS os tokens pelos novos recebidos
    if (data.token && data.refreshToken) {
      this.setToken(data.token);
      this.setRefreshToken(data.refreshToken);
    }

    return data;
  },

  // Token Management
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(authConfig.tokenKey, token);
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.tokenKey);
  },

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(authConfig.refreshTokenKey, token);
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.refreshTokenKey);
  },

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(authConfig.tokenKey);
      localStorage.removeItem(authConfig.refreshTokenKey);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
