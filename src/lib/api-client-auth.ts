/**
 * OpenSea OS - API Client Auth
 * Gerenciamento de tokens e autenticação
 */

import { API_ENDPOINTS, apiConfig, authConfig } from '@/config/api';
import { logger } from '@/lib/logger';
import type { RefreshResponse } from './api-client.types';

// =============================================================================
// TOKEN MANAGER
// =============================================================================

export class TokenManager {
  private refreshPromise: Promise<string> | null = null;
  private baseURL: string;

  constructor(baseURL = apiConfig.baseURL) {
    this.baseURL = baseURL;
  }

  // =============================================================================
  // TOKEN GETTERS/SETTERS
  // =============================================================================

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.tokenKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(authConfig.refreshTokenKey);
  }

  setTokens(token: string | null, refreshToken?: string | null): void {
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

  clearTokens(): void {
    this.setTokens(null, null);
  }

  // =============================================================================
  // TOKEN REFRESH
  // =============================================================================

  async refreshAccessToken(): Promise<string> {
    // Sistema de lock: se já existe uma tentativa de refresh em andamento, reutiliza ela
    // Isso evita múltiplas chamadas simultâneas ao endpoint (rate limit: 10/min)
    if (this.refreshPromise) {
      logger.debug('[API] Refresh já em andamento, aguardando...');
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
    logger.debug('[API] Iniciando refresh do token...');
    logger.debug('[API] URL do refresh', {
      url: `${this.baseURL}${API_ENDPOINTS.SESSIONS.REFRESH}`,
    });

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
        logger.error(
          '[API] Erro de rede no refresh',
          networkError instanceof Error
            ? networkError
            : new Error(String(networkError))
        );
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
            logger.error(
              '[API] Refresh falhou: Token não encontrado no header'
            );
          } else if (errorDetails.includes('Invalid')) {
            logger.error('[API] Refresh falhou: Refresh token inválido');
          } else if (errorDetails.includes('expired')) {
            logger.error('[API] Refresh falhou: Refresh token expirado');
          } else if (errorDetails.includes('revoked')) {
            logger.error('[API] Refresh falhou: Refresh token revogado');
          } else {
            logger.error('[API] Refresh falhou (401)', undefined, {
              errorMessage,
            });
          }
        } else if (response.status === 429) {
          logger.error('[API] Rate limit excedido - aguarde 1 minuto');
        } else {
          logger.error('[API] Refresh falhou', undefined, { errorMessage });
        }

        // Erro de autenticação, não de rede - redireciona para login
        this.handleRefreshFailure(false);
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as RefreshResponse;

      if (data.token) {
        logger.debug('[API] Refresh bem-sucedido, tokens atualizados');

        // CRÍTICO: Backend usa single-use tokens
        // Sempre salva o novo refresh token retornado
        if (!data.refreshToken) {
          logger.warn(
            '[API] Novo refresh token não retornado! Token antigo foi revogado.'
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

      logger.error('[API] Refresh retornou sem token');
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

  handleRefreshFailure(isNetworkError = false): void {
    logger.debug('[API] Limpando tokens...');
    this.clearTokens();

    // Redirect para login apenas no browser
    // Não faz redirect automático em caso de erro de rede para evitar loops
    if (typeof window !== 'undefined' && !isNetworkError) {
      // Verifica se já não está na página de login
      const currentPath = window.location.pathname;
      const isLoginPage =
        currentPath === '/login' || currentPath === '/fast-login';

      if (!isLoginPage) {
        logger.debug('[API] Redirecionando para login...');
        // Usa setTimeout para garantir que a limpeza de tokens aconteça primeiro
        setTimeout(() => {
          window.location.href = '/fast-login?session=expired';
        }, 100);
      }
    }
  }
}
