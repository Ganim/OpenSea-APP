/**
 * BrasilAPI Client
 * Integração com a API pública da BrasilAPI (https://brasilapi.com.br)
 */

import { logger } from '@/lib/logger';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class BrasilAPIClient {
  private baseURL = 'https://brasilapi.com.br/api';
  private timeout = 15000;

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  private async request<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const { params, ...restOptions } = options || {};

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        ...restOptions,
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let error: unknown;
        try {
          error = await response.json();
        } catch (jsonError) {
          error = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          };
        }

        const errorMessage =
          (error as any)?.message || `HTTP error! status: ${response.status}`;

        logger.error('[BrasilAPI] Error response', undefined, {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error,
        });

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('[BrasilAPI] Request timeout');
        throw new Error('Requisição expirou. Tente novamente.');
      }

      const errorInfo = {
        method: options?.method || 'GET',
        url: `${this.baseURL}${endpoint}`,
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
      };

      logger.error(
        '[BrasilAPI] Request failed',
        error instanceof Error ? error : undefined,
        errorInfo
      );
      throw error;
    }
  }
}

export const brasilApiClient = new BrasilAPIClient();
