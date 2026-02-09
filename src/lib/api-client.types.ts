/**
 * OpenSea OS - API Client Types
 * Tipos e interfaces para o cliente HTTP
 */

// =============================================================================
// REQUEST
// =============================================================================

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  skipRefresh?: boolean;
}

// =============================================================================
// RESPONSE
//=============================================================================

export interface ErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  code?: string;
  status?: number;
  statusText?: string;
  url?: string;
}

export class ApiError extends Error {
  status?: number;
  data?: Record<string, unknown>;
  code?: string;

  constructor(
    message: string,
    status?: number,
    data?: Record<string, unknown>,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

// =============================================================================
// REFRESH
// =============================================================================

export interface RefreshResponse {
  token?: string;
  refreshToken?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
}
