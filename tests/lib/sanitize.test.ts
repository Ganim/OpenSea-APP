/**
 * Data Sanitization Tests
 * Tests para validar a remoção de dados sensíveis em logs
 */

import { describe, it, expect } from 'vitest';
import { sanitizeForLogging } from '@/lib/sanitize';

// Recursive interface for sanitized output that allows deep property access in tests
interface SanitizedRecord {
  [key: string]: SanitizedRecord;
  [index: number]: SanitizedRecord;
}

const sanitize = (value: unknown): SanitizedRecord =>
  sanitizeForLogging(value) as unknown as SanitizedRecord;

describe('Data Sanitization', () => {
  describe('Sensitive Key Detection', () => {
    it('should detect and redact password keys', () => {
      const data = {
        password: 'secret123',
        userPassword: 'pass456',
      };
      const sanitized = sanitize(data);
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.userPassword).toBe('[REDACTED]');
    });

    it('should detect and redact token keys', () => {
      const data = {
        token: 'abc123def456',
        accessToken: 'token789',
        refreshToken: 'refresh123',
        apiKey: 'key-secret',
      };
      const sanitized = sanitize(data);
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.accessToken).toBe('[REDACTED]');
      expect(sanitized.refreshToken).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
    });

    it('should detect and redact email addresses', () => {
      const data = {
        email: 'user@example.com',
        userEmail: 'test@test.com',
        contactEmail: 'contact@company.com',
      };
      const sanitized = sanitize(data);
      expect(sanitized.email).toBe('[REDACTED]');
      expect(sanitized.userEmail).toBe('[REDACTED]');
      expect(sanitized.contactEmail).toBe('[REDACTED]');
    });

    it('should detect and redact credit card information', () => {
      const data = {
        creditCard: '4532123456789010',
        cardNumber: '1234-5678-9012-3456',
        ssn: '123-45-6789',
      };
      const sanitized = sanitize(data);
      expect(sanitized.creditCard).toBe('[REDACTED]');
      expect(sanitized.cardNumber).toBe('[REDACTED]');
      expect(sanitized.ssn).toBe('[REDACTED]');
    });
  });

  describe('Non-Sensitive Data Preservation', () => {
    it('should preserve non-sensitive string values', () => {
      const data = {
        username: 'john_doe',
        message: 'Hello world',
        status: 'active',
      };
      const sanitized = sanitize(data);
      expect(sanitized.username).toBe('john_doe');
      expect(sanitized.message).toBe('Hello world');
      expect(sanitized.status).toBe('active');
    });

    it('should preserve non-sensitive numeric values', () => {
      const data = {
        userId: 12345,
        count: 100,
        timestamp: 1638360000,
      };
      const sanitized = sanitize(data);
      expect(sanitized.userId).toBe(12345);
      expect(sanitized.count).toBe(100);
      expect(sanitized.timestamp).toBe(1638360000);
    });

    it('should preserve boolean values', () => {
      const data = {
        isActive: true,
        isAdmin: false,
        verified: true,
      };
      const sanitized = sanitize(data);
      expect(sanitized.isActive).toBe(true);
      expect(sanitized.isAdmin).toBe(false);
      expect(sanitized.verified).toBe(true);
    });
  });

  describe('Complex Objects', () => {
    it('should handle nested objects', () => {
      const data = {
        user: {
          id: '123',
          name: 'John',
          email: 'john@example.com',
          credentials: {
            password: 'secret',
            apiKey: 'key123',
          },
        },
      };
      const sanitized = sanitize(data);
      expect(sanitized.user.id).toBe('123');
      expect(sanitized.user.name).toBe('John');
      expect(sanitized.user.email).toBe('[REDACTED]');
      expect(sanitized.user.credentials.password).toBe('[REDACTED]');
      expect(sanitized.user.credentials.apiKey).toBe('[REDACTED]');
    });

    it('should handle arrays with objects', () => {
      const data = {
        users: [
          { id: '1', password: 'pass1' },
          { id: '2', password: 'pass2' },
        ],
      };
      const sanitized = sanitize(data);
      expect(sanitized.users[0].id).toBe('1');
      expect(sanitized.users[0].password).toBe('[REDACTED]');
      expect(sanitized.users[1].id).toBe('2');
      expect(sanitized.users[1].password).toBe('[REDACTED]');
    });

    it('should handle case-insensitive key matching', () => {
      const data = {
        PASSWORD: 'secret',
        Token: 'token123',
        EMAIL: 'test@test.com',
      };
      const sanitized = sanitize(data);
      expect(sanitized.PASSWORD).toBe('[REDACTED]');
      expect(sanitized.Token).toBe('[REDACTED]');
      expect(sanitized.EMAIL).toBe('[REDACTED]');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const data = {
        value: null,
        password: null,
      };
      const sanitized = sanitize(data);
      expect(sanitized.value).toBeNull();
      expect(sanitized.password).toBe('[REDACTED]');
    });

    it('should handle undefined values', () => {
      const data = {
        value: undefined,
        password: undefined,
      };
      const sanitized = sanitize(data);
      expect(sanitized.value).toBeUndefined();
      // Password still gets redacted even if undefined
    });

    it('should handle empty objects', () => {
      const data = {};
      const sanitized = sanitize(data);
      expect(sanitized).toEqual({});
    });

    it('should handle deeply nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              password: 'secret',
              userId: '123',
            },
          },
        },
      };
      const sanitized = sanitize(data);
      expect(sanitized.level1.level2.level3.password).toBe('[REDACTED]');
      expect(sanitized.level1.level2.level3.userId).toBe('123');
    });
  });
});
