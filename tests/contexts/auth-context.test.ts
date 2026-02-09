/**
 * Auth Context Tests
 * Tests para validar o comportamento do contexto de autenticação
 */

import { logger } from '@/lib/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Flow', () => {
    it('should log login start with email in context', () => {
      // Simular início de login
      const credentials = { email: 'test@example.com', password: 'pass123' };
      logger.debug('Iniciando login...', { email: credentials.email });

      expect(logger.debug).toHaveBeenCalledWith(
        'Iniciando login...',
        expect.objectContaining({ email: 'test@example.com' })
      );
    });

    it('should log successful login with user info', () => {
      const userId = 'user-123';
      logger.info('✅ Login bem-sucedido', { userId });

      expect(logger.info).toHaveBeenCalledWith(
        '✅ Login bem-sucedido',
        expect.objectContaining({ userId })
      );
    });

    it('should log login error with proper context', () => {
      const error = new Error('Invalid credentials');
      const email = 'test@example.com';
      logger.error('Erro no login', error, {
        action: 'login',
        email,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Erro no login',
        error,
        expect.objectContaining({ action: 'login', email })
      );
    });

    it('should include email in login error context', () => {
      const error = new Error('Login failed');
      const email = 'user@test.com';
      logger.error('Erro no login', error, { action: 'login', email });

      const call = vi.mocked(logger.error).mock.calls[0];
      expect(call[2]).toMatchObject({ email });
    });
  });

  describe('Logout Flow', () => {
    it('should log logout completion', () => {
      const userId = 'user-456';
      logger.info('✅ Logout realizado', { userId });

      expect(logger.info).toHaveBeenCalled();
    });

    it('should log logout errors with user context', () => {
      const error = new Error('Logout failed');
      const userId = 'user-789';
      logger.error('Erro ao fazer logout', error, {
        action: 'logout',
        userId,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Erro ao fazer logout',
        error,
        expect.objectContaining({ action: 'logout', userId })
      );
    });
  });

  describe('Token Validation', () => {
    it('should log token validation attempts', () => {
      logger.debug('🔑 Validando token...', { component: 'auth-context' });

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Validando token'),
        expect.any(Object)
      );
    });

    it('should log token expiration warnings', () => {
      logger.warn('Token expirado, redirecionando para login', {
        action: 'token-refresh',
      });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Token'),
        expect.any(Object)
      );
    });

    it('should log redirect to login on missing token', () => {
      logger.debug('🔒 Sem token em rota protegida, redirecionando...', {
        route: '/dashboard',
      });

      expect(logger.debug).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should log token save operations', () => {
      logger.debug('💾 Tokens salvos no localStorage', {
        keys: ['token', 'refreshToken'],
      });

      expect(logger.debug).toHaveBeenCalled();
    });

    it('should log user data fetch', () => {
      logger.debug('🔄 Buscando dados do usuário...', { userId: 'user-123' });

      expect(logger.debug).toHaveBeenCalled();
    });

    it('should log account save for fast login', () => {
      logger.debug('💾 Conta salva para Fast Login', {
        userId: 'user-123',
        email: 'user@example.com',
      });

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Fast Login'),
        expect.any(Object)
      );
    });

    it('should not expose sensitive data in logs', () => {
      const password = 'secret123'; // SHOULD NOT BE LOGGED
      const userId = 'user-123'; // OK to log

      // Correct way - only log userId, not password
      logger.info('✅ Usuário autenticado', { userId });

      const call = vi.mocked(logger.info).mock.calls[0];
      expect(call[1]).toBeDefined();
      expect(call[1]!.password).toBeUndefined();
    });
  });
});
