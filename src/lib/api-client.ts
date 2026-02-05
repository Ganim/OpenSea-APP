import { API_ENDPOINTS, apiConfig, authConfig } from '@/config/api';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  skipRefresh?: boolean;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL = apiConfig.baseURL, timeout = apiConfig.timeout) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.tokenKey);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.refreshTokenKey);
  }

  private setTokens(token: string | null, refreshToken?: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(authConfig.tokenKey, token);
    } else {
      localStorage.removeItem(authConfig.tokenKey);
    }

    if (typeof refreshToken !== 'undefined') {
      if (refreshToken) {
        localStorage.setItem(authConfig.refreshTokenKey, refreshToken);
      } else {
        localStorage.removeItem(authConfig.refreshTokenKey);
      }
    }

    // Dispara evento customizado para notificar o AuthContext
    window.dispatchEvent(new CustomEvent('auth-token-change'));
  }

  private async refreshAccessToken(): Promise<string> {
    // Sistema de lock: se já existe uma tentativa de refresh em andamento, reutiliza ela
    // Isso evita múltiplas chamadas simultâneas ao endpoint (rate limit: 10/min)
    if (this.refreshPromise) {
      console.log('[API] Refresh já em andamento, aguardando...');
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      const error = new Error('No refresh token available');
      this.handleRefreshFailure();
      throw error;
    }

    // IMPORTANTE: Refresh token é SINGLE-USE
    // - Token antigo é revogado após uso bem-sucedido
    // - Backend retorna novo access token E novo refresh token
    // - Sempre salvar ambos os tokens retornados
    // Cria a promise de refresh e armazena para evitar chamadas simultâneas
    this.refreshPromise = this.performRefresh(refreshToken);

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      // Limpa o lock após conclusão (sucesso ou erro)
      this.refreshPromise = null;
    }
  }

  private async performRefresh(refreshToken: string): Promise<string> {
    console.log('[API] Iniciando refresh do token...');
    console.log(
      '[API] URL do refresh:',
      `${this.baseURL}${API_ENDPOINTS.SESSIONS.REFRESH}`
    );

    try {
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.SESSIONS.REFRESH}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
          // Backend não requer body, apenas Authorization header
          mode: 'cors',
          credentials: 'include',
        }
      ).catch(networkError => {
        // Captura erros de rede antes do response
        console.error('[API] Erro de rede no refresh:', networkError);
        throw new Error(
          `Falha de conexão com o servidor. Verifique se o backend está rodando em ${this.baseURL}`
        );
      });

      if (!response.ok) {
        let errorMessage = 'Failed to refresh token';
        let errorDetails = '';

        try {
          const errorData = await response.json();
          if (typeof errorData?.message === 'string') {
            errorMessage = errorData.message;
            errorDetails = errorData.message;
          }
        } catch (_) {
          // ignore JSON parse errors, keep default message
        }

        // Log detalhado baseado no tipo de erro do backend
        if (response.status === 401) {
          if (errorDetails.includes('required')) {
            console.error(
              '[API] Refresh falhou: Token não encontrado no header'
            );
          } else if (errorDetails.includes('Invalid')) {
            console.error('[API] Refresh falhou: Refresh token inválido');
          } else if (errorDetails.includes('expired')) {
            console.error('[API] Refresh falhou: Refresh token expirado');
          } else if (errorDetails.includes('revoked')) {
            console.error('[API] Refresh falhou: Refresh token revogado');
          } else {
            console.error('[API] Refresh falhou (401):', errorMessage);
          }
        } else if (response.status === 429) {
          console.error('[API] Rate limit excedido - aguarde 1 minuto');
        } else {
          console.error('[API] Refresh falhou:', errorMessage);
        }

        // Erro de autenticação, não de rede - redireciona para login
        this.handleRefreshFailure(false);
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as {
        token?: string;
        refreshToken?: string;
        tenant?: {
          id: string;
          name: string;
          slug: string;
        };
      };

      if (data.token) {
        console.log('[API] Refresh bem-sucedido, tokens atualizados');

        // CRÍTICO: Backend usa single-use tokens
        // Sempre salva o novo refresh token retornado
        if (!data.refreshToken) {
          console.warn(
            '[API] ⚠️ Novo refresh token não retornado! Token antigo foi revogado.'
          );
        }

        if (data.tenant?.id && typeof window !== 'undefined') {
          localStorage.setItem('selected_tenant_id', data.tenant.id);
          window.dispatchEvent(
            new CustomEvent('tenant-refreshed', { detail: data.tenant })
          );
        }

        this.setTokens(data.token, data.refreshToken ?? null);
        return data.token;
      }

      console.error('[API] Refresh retornou sem token');
      // Resposta inesperada do backend, não de rede - redireciona para login
      this.handleRefreshFailure(false);
      throw new Error('Failed to refresh token');
    } catch (error) {
      // Se já chamou handleRefreshFailure antes de throw, não chama novamente
      // Verifica pelo tipo de erro se é de rede
      const isNetworkError =
        error instanceof Error &&
        (error.message.includes('Falha de conexão') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError'));

      // Se for erro de rede que veio do .catch interno, já foi tratado acima
      // Só chama handleRefreshFailure se for um erro não esperado
      if (isNetworkError) {
        this.handleRefreshFailure(true);
      }
      // Se não for erro de rede, o handleRefreshFailure já foi chamado antes do throw
      throw error;
    }
  }

  private handleRefreshFailure(isNetworkError = false): void {
    console.log('[API] Limpando tokens...');
    this.setTokens(null, null);

    // Redirect para login apenas no browser
    // Não faz redirect automático em caso de erro de rede para evitar loops
    if (typeof window !== 'undefined' && !isNetworkError) {
      // Verifica se já não está na página de login
      const currentPath = window.location.pathname;
      const isLoginPage =
        currentPath === '/login' || currentPath === '/fast-login';

      if (!isLoginPage) {
        console.log('[API] Redirecionando para login...');
        // Usa setTimeout para garantir que a limpeza de tokens aconteça primeiro
        setTimeout(() => {
          window.location.href = '/fast-login?session=expired';
        }, 100);
      }
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...restOptions } = options;

    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const token = this.getToken();
    const hasBody = restOptions.body !== undefined;
    const defaultHeaders: HeadersInit = {
      ...(hasBody && apiConfig.headers),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        ...restOptions,
        headers: defaultHeaders,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      if (response.status === 401 && !options.skipRefresh) {
        console.log('[API] Recebido 401, tentando refresh...');

        // Primeiro tenta o refresh; se falhar, o próprio método já limpa tokens e redireciona
        let newToken: string;
        try {
          newToken = await this.refreshAccessToken();
        } catch (refreshError) {
          console.error(
            '[API] Falha no refresh, usuário será deslogado:',
            refreshError
          );
          throw refreshError;
        }

        console.log('[API] Refresh bem-sucedido, repetindo request...');

        // Depois repete a requisição; se falhar aqui, NÃO limpa tokens (pode ser CORS/offline)
        const retryHeaders = {
          ...defaultHeaders,
          Authorization: `Bearer ${newToken}`,
        };

        try {
          const retryResponse = await fetch(url.toString(), {
            ...restOptions,
            headers: retryHeaders,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'include',
          });

          if (!retryResponse.ok) {
            if (retryResponse.status === 401 || retryResponse.status === 403) {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('selected_tenant_id');
                localStorage.removeItem('user');
              }
              this.handleRefreshFailure(false);
            }

            const retryError = await retryResponse
              .json()
              .catch(() => ({ message: 'An error occurred' }));
            throw new Error(
              retryError.message ||
                `HTTP error! status: ${retryResponse.status}`
            );
          }

          if (retryResponse.status === 204) {
            return undefined as T;
          }

          console.log('[API] Request repetido com sucesso');
          return (await retryResponse.json()) as T;
        } catch (retryError) {
          console.error(
            '[API] Erro ao repetir request após refresh:',
            retryError
          );
          // Não limpamos tokens aqui; problema provavelmente é de rede/CORS
          throw retryError;
        }
      }

      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          };
        }

        const errorMessage =
          (typeof errorData?.message === 'string' ? errorData.message : null) ||
          (typeof errorData?.error === 'string' ? errorData.error : null) ||
          (typeof errorData?.details === 'string' ? errorData.details : null) ||
          `HTTP error! status: ${response.status}`;

        const maybeCode = (errorData as { code?: string })?.code;
        const isResetRequired =
          maybeCode === 'PASSWORD_RESET_REQUIRED' ||
          errorMessage.toLowerCase().includes('password reset is required');

        const isNotFoundError =
          response.status === 404 ||
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage
            .toLowerCase()
            .includes('company_stakeholders_not_found') ||
          errorMessage.toLowerCase().includes('fiscal settings not found');

        if (!isResetRequired) {
          if (isNotFoundError) {
            console.warn('[API] Resource not found:', {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
              error: errorData,
            });
          } else {
            console.error('[API] Error response:', {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
              headers: Object.fromEntries(response.headers.entries()),
              error: errorData,
            });
          }
        }

        const err = new Error(errorMessage) as Error & {
          status?: number;
          data?: Record<string, unknown>;
          code?: string;
        };

        err.status = response.status;
        err.data = errorData;
        if (maybeCode) {
          err.code = maybeCode;
        }

        throw err;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - O servidor não respondeu a tempo');
      }

      if (error instanceof Error && error.message === 'Failed to fetch') {
        console.error('[API] Erro de conexão:', {
          url: url.toString(),
          baseURL: this.baseURL,
          method: restOptions.method || 'GET',
        });
        throw new Error(
          'Falha na conexão - Possíveis causas:\n' +
            `1. Servidor backend não está rodando em ${this.baseURL}\n` +
            '2. Problema de CORS (servidor precisa permitir origem http://localhost:3000)\n' +
            '3. Firewall ou antivírus bloqueando a conexão\n' +
            '4. Problema de IPv4/IPv6 - tente reiniciar o servidor backend'
        );
      }

      throw error instanceof Error
        ? error
        : new Error('An unexpected error occurred');
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
