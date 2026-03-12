/**
 * Tasks Utility Tests
 * Tests para as funções utilitárias do módulo de tarefas
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatDateShort,
  formatDueDate,
  isOverdue,
  PRIORITY_HEX,
} from '@/components/tasks/_utils';

describe('Tasks _utils', () => {
  describe('isOverdue', () => {
    it('should return true for a date in the past', () => {
      const pastDate = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('should return false for a date in the future', () => {
      const futureDate = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('should return false for null dueDate', () => {
      expect(isOverdue(null)).toBe(false);
    });

    it('should return false for undefined dueDate', () => {
      expect(isOverdue(undefined)).toBe(false);
    });

    it('should return false if status is DONE', () => {
      const pastDate = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(isOverdue(pastDate, 'DONE')).toBe(false);
    });

    it('should return false if status is CANCELED', () => {
      const pastDate = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(isOverdue(pastDate, 'CANCELED')).toBe(false);
    });

    it('should return true if status is IN_PROGRESS and date is past', () => {
      const pastDate = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(isOverdue(pastDate, 'IN_PROGRESS')).toBe(true);
    });

    it('should return true if status is TODO and date is past', () => {
      const pastDate = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      expect(isOverdue(pastDate, 'TODO')).toBe(true);
    });

    it('should return false for an empty string dueDate', () => {
      expect(isOverdue('')).toBe(false);
    });
  });

  describe('formatDueDate', () => {
    beforeEach(() => {
      // Fix "now" to 2026-03-09T12:00:00Z so relative calculations are deterministic
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-09T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Hoje" for today\'s date', () => {
      // Use same time as faked "now" so diff rounds to 0
      const today = '2026-03-09T12:00:00Z';
      expect(formatDueDate(today)).toBe('Hoje');
    });

    it('should return "Amanhã" for tomorrow\'s date', () => {
      const tomorrow = '2026-03-10T12:00:00Z';
      expect(formatDueDate(tomorrow)).toBe('Amanhã');
    });

    it('should return "Ontem" for yesterday\'s date', () => {
      const yesterday = '2026-03-08T12:00:00Z';
      expect(formatDueDate(yesterday)).toBe('Ontem');
    });

    it('should return relative format like "2d atrás" for past dates', () => {
      const twoDaysAgo = '2026-03-07T12:00:00Z';
      expect(formatDueDate(twoDaysAgo)).toBe('2d atrás');
    });

    it('should return relative format like "5d atrás" for 5 days ago', () => {
      const fiveDaysAgo = '2026-03-04T12:00:00Z';
      expect(formatDueDate(fiveDaysAgo)).toBe('5d atrás');
    });

    it('should return relative days for future dates within 7 days', () => {
      const threeDaysLater = '2026-03-12T12:00:00Z';
      expect(formatDueDate(threeDaysLater)).toBe('3d');
    });

    it('should return short date for future dates beyond 7 days', () => {
      const farFuture = '2026-03-20T12:00:00Z';
      const result = formatDueDate(farFuture);
      // Should contain day and abbreviated month in PT-BR
      expect(result).toMatch(/20/);
      expect(result).toMatch(/mar/i);
    });
  });

  describe('formatDateShort', () => {
    it('should format a date as DD mon. YYYY in PT-BR locale', () => {
      // Use midday to avoid timezone-shift issues
      const result = formatDateShort('2026-01-15T12:00:00Z');
      // PT-BR: "15 de jan. de 2026" or similar format
      expect(result).toMatch(/15/);
      expect(result).toMatch(/jan/i);
      expect(result).toMatch(/2026/);
    });

    it('should format another date correctly', () => {
      const result = formatDateShort('2026-12-25T12:00:00Z');
      expect(result).toMatch(/25/);
      expect(result).toMatch(/dez/i);
      expect(result).toMatch(/2026/);
    });

    it('should handle ISO date strings without time', () => {
      const result = formatDateShort('2026-06-01');
      expect(result).toMatch(/2026/);
    });
  });

  describe('PRIORITY_HEX', () => {
    const allPriorities = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

    it('should have entries for all priorities', () => {
      for (const priority of allPriorities) {
        expect(PRIORITY_HEX).toHaveProperty(priority);
      }
    });

    it('should have exactly 5 entries', () => {
      expect(Object.keys(PRIORITY_HEX)).toHaveLength(5);
    });

    it('should have valid hex color values', () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      for (const priority of allPriorities) {
        expect(PRIORITY_HEX[priority]).toMatch(hexRegex);
      }
    });

    it('should map URGENT to red (#ef4444)', () => {
      expect(PRIORITY_HEX.URGENT).toBe('#ef4444');
    });

    it('should map HIGH to orange (#f97316)', () => {
      expect(PRIORITY_HEX.HIGH).toBe('#f97316');
    });

    it('should map MEDIUM to yellow (#eab308)', () => {
      expect(PRIORITY_HEX.MEDIUM).toBe('#eab308');
    });

    it('should map LOW to blue (#3b82f6)', () => {
      expect(PRIORITY_HEX.LOW).toBe('#3b82f6');
    });

    it('should map NONE to gray (#6b7280)', () => {
      expect(PRIORITY_HEX.NONE).toBe('#6b7280');
    });
  });
});
