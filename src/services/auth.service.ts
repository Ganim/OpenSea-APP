import { apiClient } from '@/lib/api-client';
import { authConfig } from '@/config/api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
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

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    if (response.token) {
      this.setToken(response.token);
      if (response.refreshToken) {
        this.setRefreshToken(response.refreshToken);
      }
    }

    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  },

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
