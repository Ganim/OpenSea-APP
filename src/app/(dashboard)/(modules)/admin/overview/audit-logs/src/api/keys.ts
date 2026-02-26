/**
 * OpenSea OS - Audit Logs Query Keys
 */

import type { AuditLogFilters } from '../types';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: AuditLogFilters) =>
    [...auditLogKeys.lists(), filters ?? {}] as const,

  // Entity history
  histories: () => [...auditLogKeys.all, 'history'] as const,
  history: (entity: string, entityId: string) =>
    [...auditLogKeys.histories(), entity, entityId] as const,

  // Rollback preview
  rollbackPreviews: () => [...auditLogKeys.all, 'rollback-preview'] as const,
  rollbackPreview: (entity: string, entityId: string) =>
    [...auditLogKeys.rollbackPreviews(), entity, entityId] as const,

  // Version comparison
  comparisons: () => [...auditLogKeys.all, 'comparison'] as const,
  comparison: (entity: string, entityId: string, v1: number, v2: number) =>
    [...auditLogKeys.comparisons(), entity, entityId, v1, v2] as const,
} as const;

type AuditLogKeyFunctions = {
  [K in keyof typeof auditLogKeys]: (typeof auditLogKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof auditLogKeys)[K];
};

export type AuditLogQueryKey = AuditLogKeyFunctions[keyof AuditLogKeyFunctions];

export default auditLogKeys;
