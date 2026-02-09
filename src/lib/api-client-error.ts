/**
 * OpenSea OS - API Client Error Handling
 * Parsing e enriquecimento de erros HTTP
 */

import { logger } from '@/lib/logger';
import { ApiError, type ErrorResponse } from './api-client.types';

// =============================================================================
// ERROR PARSING
// =============================================================================

export async function parseErrorResponse(
  response: Response
): Promise<ErrorResponse> {
  try {
    return await response.json();
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    };
  }
}

export function extractErrorMessage(errorData: ErrorResponse): string {
  return (
    errorData.message ||
    errorData.error ||
    errorData.details ||
    `HTTP error! status: ${errorData.status}`
  );
}

export function createApiError(
  message: string,
  status?: number,
  data?: Record<string, unknown>,
  code?: string
): ApiError {
  const error = new ApiError(message, status, data, code);
  return error;
}

// =============================================================================
// ERROR LOGGING
// =============================================================================

export function logErrorResponse(
  response: Response,
  errorData: ErrorResponse
): void {
  const errorMessage = extractErrorMessage(errorData);
  const code = errorData.code;

  const isResetRequired =
    code === 'PASSWORD_RESET_REQUIRED' ||
    errorMessage.toLowerCase().includes('password reset is required');

  const isNotFoundError =
    response.status === 404 ||
    errorMessage.toLowerCase().includes('not found') ||
    errorMessage.toLowerCase().includes('company_stakeholders_not_found') ||
    errorMessage.toLowerCase().includes('fiscal settings not found');

  if (!isResetRequired) {
    if (isNotFoundError) {
      logger.warn('[API] Resource not found', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        error: errorData,
      });
    } else {
      logger.error('[API] Error response', undefined, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData,
      });
    }
  }
}

// =============================================================================
// NETWORK ERROR HANDLING
// =============================================================================

export function handleNetworkError(
  error: Error,
  url: string,
  baseURL: string,
  method: string = 'GET'
): Error {
  if (error.name === 'AbortError') {
    return new Error('Request timeout - O servidor não respondeu a tempo');
  }

  if (error.message === 'Failed to fetch') {
    logger.error('[API] Erro de conexão', error, {
      url,
      baseURL,
      method,
    });

    return new Error(
      'Falha na conexão - Possíveis causas:\n' +
        `1. Servidor backend não está rodando em ${baseURL}\n` +
        '2. Problema de CORS (servidor precisa permitir origem http://localhost:3000)\n' +
        '3. Firewall ou antivírus bloqueando a conexão\n' +
        '4. Problema de IPv4/IPv6 - tente reiniciar o servidor backend'
    );
  }

  return error;
}
