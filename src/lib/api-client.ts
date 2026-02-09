/**
 * OpenSea OS - API Client
 * Cliente HTTP principal para comunicação com o backend
 */

import { apiConfig } from '@/config/api';
import { logger } from '@/lib/logger';
import { TokenManager } from './api-client-auth';
import {
  createApiError,
  extractErrorMessage,
  handleNetworkError,
  logErrorResponse,
  parseErrorResponse,
} from './api-client-error';
import type { RequestOptions } from './api-client.types';

// =============================================================================
// API CLIENT
// =============================================================================

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private tokenManager: TokenManager;

  constructor(baseURL = apiConfig.baseURL, timeout = apiConfig.timeout) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.tokenManager = new TokenManager(baseURL);
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...restOptions } = options;

    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const token = this.tokenManager.getToken();
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

      // Handle 401 - Token expirado
      if (response.status === 401 && !options.skipRefresh) {
        logger.debug('[API] Recebido 401, tentando refresh...');

        // Primeiro tenta o refresh
        let newToken: string;
        try {
          newToken = await this.tokenManager.refreshAccessToken();
        } catch (refreshError) {
          logger.error(
            '[API] Falha no refresh, usuário será deslogado',
            refreshError instanceof Error
              ? refreshError
              : new Error(String(refreshError))
          );
          throw refreshError;
        }

        logger.debug('[API] Refresh bem-sucedido, repetindo request...');

        // Repete a requisição com novo token
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
            if (
              retryResponse.status === 401 ||
              retryResponse.status === 403
            ) {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('selected_tenant_id');
                localStorage.removeItem('user');
              }
              this.tokenManager.handleRefreshFailure(false);
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

          logger.debug('[API] Request repetido com sucesso');
          return (await retryResponse.json()) as T;
        } catch (retryError) {
          logger.error(
            '[API] Erro ao repetir request após refresh',
            retryError instanceof Error
              ? retryError
              : new Error(String(retryError))
          );
          // Não limpamos tokens aqui; problema provavelmente é de rede/CORS
          throw retryError;
        }
      }

      // Handle outros erros HTTP
      if (!response.ok) {
        const errorData = await parseErrorResponse(response);
        const errorMessage = extractErrorMessage(errorData);

        logErrorResponse(response, errorData);

        throw createApiError(
          errorMessage,
          response.status,
          errorData as Record<string, unknown>,
          errorData.code
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error) {
        const networkError = handleNetworkError(
          error,
          url.toString(),
          this.baseURL,
          restOptions.method || 'GET'
        );
        
        if (networkError !== error) {
          throw networkError;
        }
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
