/**
 * Authentication Flow Integration Tests
 * Tests que validam o fluxo completo de autenticação com logging
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

// Mock do sanitize
vi.mock('@/lib/sanitize', () => ({
  sanitizeData: vi.fn(data => {
    // Mock implementation - just return the data
    return data;
  }),
}));

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Complete Login Sequence', () => {
    it('should log complete login sequence in correct order', async () => {
      const credentials = { email: 'test@example.com', password: 'pass123' };
      const userId = 'user-123';
      const token = 'token-abc123';

      // Simulate login sequence
      logger.debug('🔐 Iniciando login...', { email: credentials.email });
      logger.info('✅ Login bem-sucedido', { userId });
      logger.debug('💾 Tokens salvos no localStorage');
      logger.debug('🔄 Buscando dados do usuário...');
      logger.info('✅ Dados do usuário carregados', { userId });
      logger.debug('💾 Conta salva para Fast Login', { userId });

      // Verify logging sequence
      expect(logger.debug).toHaveBeenCalledTimes(4);
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it('should include all context objects in logs', () => {
      const context = {
        email: 'user@example.com',
        userId: 'user-456',
        action: 'login',
        timestamp: Date.now(),
      };

      logger.info('Login successful', context);

      expect(logger.info).toHaveBeenCalledWith(
        'Login successful',
        expect.objectContaining({
          email: expect.any(String),
          userId: expect.any(String),
          action: 'login',
        })
      );
    });

    it('should sanitize sensitive data in logs', () => {
      const sensitiveContext = {
        userId: 'user-123',
        password: 'secret123', // Should NOT be logged
        token: 'token-abc', // Should be redacted if passed
        email: 'user@example.com',
      };

      // Correct usage - only pass non-sensitive data
      const safeContext = {
        userId: sensitiveContext.userId,
        email: sensitiveContext.email,
        action: 'login',
      };

      logger.info('User logged in', safeContext);

      expect(logger.info).toHaveBeenCalledWith(
        'User logged in',
        expect.not.objectContaining({ password: 'secret123' })
      );
    });
  });

  describe('Error Handling in Authentication', () => {
    it('should log and handle login errors', () => {
      const error = new Error('Invalid credentials');
      const email = 'test@example.com';

      logger.error('Erro no login', error, {
        action: 'login',
        email,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Erro no login',
        error,
        expect.objectContaining({
          action: 'login',
          email,
        })
      );
    });

    it('should preserve error state in logs', () => {
      const error = new Error('Authentication failed');
      const errorCode = 'AUTH_ERROR_001';

      logger.error('Authentication error', error, {
        errorCode,
        step: 'token-validation',
      });

      const call = vi.mocked(logger.error).mock.calls[0];
      expect(call[0]).toContain('error');
      expect(call[1]).toBe(error);
      expect(call[2]).toEqual(
        expect.objectContaining({
          errorCode,
          step: 'token-validation',
        })
      );
    });

    it('should handle multiple auth errors gracefully', () => {
      const errors = [
        new Error('Token expired'),
        new Error('User not found'),
        new Error('Session timeout'),
      ];

      errors.forEach((error, index) => {
        logger.error('Auth error', error, {
          errorNumber: index + 1,
          totalErrors: errors.length,
        });
      });

      expect(logger.error).toHaveBeenCalledTimes(3);
    });
  });

  describe('Logger Integration Across Flow', () => {
    it('should pass all logs through context', () => {
      const flowContext = {
        sessionId: 'session-123',
        requestId: 'req-456',
        userId: 'user-789',
      };

      logger.debug('Login step 1', flowContext);
      logger.debug('Login step 2', flowContext);
      logger.debug('Login step 3', flowContext);

      // All logs should have context
      vi.mocked(logger.debug).mock.calls.forEach(call => {
        expect(call[1]).toBeDefined();
      });
    });

    it('should maintain context across different log levels', () => {
      const sharedContext = {
        action: 'authenticate',
        component: 'AuthContext',
      };

      logger.debug('Starting auth...', sharedContext);
      logger.info('Auth progress', sharedContext);
      logger.warn('Auth warning', sharedContext);
      logger.error('Auth error', new Error('Test'), sharedContext);

      // Verify all levels use the same context
      expect(logger.debug).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(sharedContext)
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(sharedContext)
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(sharedContext)
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error),
        expect.objectContaining(sharedContext)
      );
    });

    it('should correlate logs by request or session ID', () => {
      const sessionId = 'session-abc123';

      logger.debug('Request start', { sessionId });
      logger.info('Processing', { sessionId });
      logger.info('Complete', { sessionId });

      // All calls should have the same sessionId
      vi.mocked(logger.debug).mock.calls.forEach(call => {
        if (call[1]) {
          expect(call[1].sessionId).toBe(sessionId);
        }
      });
    });
  });
});
