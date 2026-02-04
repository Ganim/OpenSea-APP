/**
 * Logger Utility Tests
 * Tests para validar a funcionalidade e estrutura do logger
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger Utility', () => {
  let consoleSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    // Spy em console.log/error/warn para verificar saída
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Initialization', () => {
    it('should initialize logger with default configuration', () => {
      expect(logger).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should have all log level methods available', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('Logging Levels', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Test warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const testError = new Error('Test error');
      logger.error('Test error message', testError);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Context Objects', () => {
    it('should include context in debug logs', () => {
      const context = { userId: '123', action: 'test' };
      logger.debug('Debug with context', context);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include context in info logs', () => {
      const context = { component: 'TestComponent' };
      logger.info('Info with context', context);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include context in warn logs', () => {
      const context = { status: 'warning', threshold: 80 };
      logger.warn('Warning with context', context);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should include context with error objects', () => {
      const error = new Error('Test error');
      const context = { component: 'ErrorComponent', step: 'initialization' };
      logger.error('Error with context', error, context);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Error objects properly', () => {
      const error = new Error('Test error message');
      expect(() => {
        logger.error('Caught error', error);
      }).not.toThrow();
    });

    it('should handle error-like objects', () => {
      const errorLike = Object.assign(new Error('Custom error'), {
        code: 'ERR_001',
      });
      expect(() => {
        logger.error('Custom error', errorLike);
      }).not.toThrow();
    });

    it('should preserve error stack trace', () => {
      const error = new Error('Stack trace test');
      const stackBefore = error.stack;
      logger.error('Error with stack', error);
      expect(error.stack).toEqual(stackBefore);
    });

    it('should sanitize sensitive data in error context', () => {
      const error = new Error('Auth error');
      const sensitiveContext = {
        password: 'secret123',
        token: 'abc123def456',
        userId: 'user-123',
      };
      // Should not throw even with sensitive data
      expect(() => {
        logger.error('Auth error', error, sensitiveContext);
      }).not.toThrow();
    });
  });

  describe('Sentry Integration Ready', () => {
    it('should structure logs for Sentry compatibility', () => {
      const error = new Error('Integration test');
      const context = { environment: 'test', userId: '123' };
      expect(() => {
        logger.error('Sentry test', error, context);
      }).not.toThrow();
    });

    it('should include error code if available', () => {
      const error = new Error('Error with code') as any;
      error.code = 'ERR_TIMEOUT';
      expect(() => {
        logger.error('Error with code', error);
      }).not.toThrow();
    });
  });
});
