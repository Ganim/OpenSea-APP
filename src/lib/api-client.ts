import { API_ENDPOINTS, apiConfig, authConfig } from '@/config/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  skipRefresh?: boolean; // Flag para evitar loop infinito no refresh
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.tokenKey);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.refreshTokenKey);
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(authConfig.tokenKey, token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(authConfig.refreshTokenKey, token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(authConfig.tokenKey);
      localStorage.removeItem(authConfig.refreshTokenKey);
    }
  }

  private async refreshAccessToken(): Promise<string> {
    // Se já está renovando, retorna a promise existente
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('[API] Renovando token de acesso...');

        // IMPORTANTE: Usar PATCH com refresh token no header Authorization
        const response = await fetch(
          `${this.baseURL}${API_ENDPOINTS.SESSIONS.REFRESH}`,
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

        // Backend retorna 200 com { token, refreshToken }
        const data = await response.json();

        if (data.token && data.refreshToken) {
          // IMPORTANTE: Substituir AMBOS os tokens pelos novos
          this.setToken(data.token);
          this.setRefreshToken(data.refreshToken);
          console.log('[API] Token renovado com sucesso');
          return data.token;
        }

        throw new Error('No tokens in refresh response');
      } catch (error) {
        console.error('[API] Erro ao renovar token:', error);
        // Se falhar, limpa os tokens e redireciona para login
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Verifica se o token está próximo de expirar (5 minutos)
  private isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false; // Se não tem token, não precisa renovar

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Converter para ms
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return expiresAt - now < fiveMinutes;
    } catch {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers, ...restOptions } = options;

    // RENOVAÇÃO PROATIVA: Verifica se o token está expirando e renova antes
    // Só tenta renovar se tiver refresh token disponível
    if (
      !options.skipRefresh &&
      this.getRefreshToken() &&
      this.isTokenExpiringSoon()
    ) {
      console.log('[API] Token expirando em breve, renovando proativamente...');
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('[API] Falha na renovação proativa:', error);
        // Continua com a requisição, se falhar com 401 tenta novamente
      }
    }

    // Build URL with query parameters
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.keys(params).forEach(key =>
        url.searchParams.append(key, params[key])
      );
    }

    // Add authorization header if token exists
    const token = this.getToken();

    // Só adiciona Content-Type: application/json se houver body
    const hasBody = restOptions.body !== undefined;
    const defaultHeaders: HeadersInit = {
      ...(hasBody && apiConfig.headers), // Só adiciona Content-Type se tiver body
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log('[API] Request:', {
        method: restOptions.method || 'GET',
        url: url.toString(),
        headers: defaultHeaders,
        body: restOptions.body,
      });

      const response = await fetch(url.toString(), {
        ...restOptions,
        headers: defaultHeaders,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      console.log('[API] Response:', {
        status: response.status,
        ok: response.ok,
      });

      // Se receber 401 e não for a rota de refresh, tenta renovar o token
      if (response.status === 401 && !options.skipRefresh) {
        console.log('[API] Token expirado, tentando renovar...');

        try {
          const newToken = await this.refreshAccessToken();

          // Refaz a requisição com o novo token
          console.log('[API] Refazendo requisição com novo token...');
          const retryHeaders = {
            ...defaultHeaders,
            Authorization: `Bearer ${newToken}`,
          };

          const retryResponse = await fetch(url.toString(), {
            ...restOptions,
            headers: retryHeaders,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'include',
          });

          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({
              message: 'An error occurred',
            }));
            throw new Error(
              error.message || `HTTP error! status: ${retryResponse.status}`
            );
          }

          // Se for 204 No Content, retorna undefined (sem tentar fazer parse JSON)
          if (retryResponse.status === 204) {
            return undefined as T;
          }

          return await retryResponse.json();
        } catch (refreshError) {
          console.error('[API] Falha ao renovar token:', refreshError);
          // Se falhar, deixa o erro 401 original continuar
        }
      }

      if (!response.ok) {
        let error: any;
        try {
          error = await response.json();
        } catch (jsonError) {
          // Se não conseguir fazer parse do JSON, cria um erro com informações da resposta
          error = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          };
        }

        const errorMessage =
          error.message || `HTTP error! status: ${response.status}`;

        console.error('[API] Error response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          error,
        });

        throw new Error(errorMessage);
      }

      // Se for 204 No Content, retorna undefined (sem tentar fazer parse JSON)
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Request failed:', {
        method: options?.method || 'GET',
        url: `${this.baseURL}${endpoint}`,
        error,
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - O servidor não respondeu a tempo');
        }
        if (error.message === 'Failed to fetch') {
          throw new Error(
            'Falha na conexão - Possíveis causas:\n' +
              '1. Servidor backend não está rodando em ' +
              this.baseURL +
              '\n' +
              '2. Problema de CORS (servidor precisa permitir origem http://localhost:3000)\n' +
              '3. Firewall ou antivírus bloqueando a conexão'
          );
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
