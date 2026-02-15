/**
 * OpenSea OS - Entity History Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { auditLogService } from '@/services/audit/audit-log.service';
import type {
  AuditEntity,
  HistoryResponse,
  RollbackPreviewResponse,
  ComparisonResponse,
} from '../types';
import { auditLogKeys } from './keys';

/* ===========================================
   GET ENTITY HISTORY
   =========================================== */

export type GetEntityHistoryOptions = Omit<
  UseQueryOptions<HistoryResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useEntityHistory(
  entity: AuditEntity | string,
  entityId: string,
  options?: GetEntityHistoryOptions
) {
  return useQuery({
    queryKey: auditLogKeys.history(entity, entityId),

    queryFn: async (): Promise<HistoryResponse> => {
      const response = await auditLogService.getEntityHistory(entity, entityId);
      return response;
    },

    enabled: !!entity && !!entityId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/* ===========================================
   GET ROLLBACK PREVIEW
   =========================================== */

export type GetRollbackPreviewOptions = Omit<
  UseQueryOptions<RollbackPreviewResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useRollbackPreview(
  entity: AuditEntity | string,
  entityId: string,
  options?: GetRollbackPreviewOptions
) {
  return useQuery({
    queryKey: auditLogKeys.rollbackPreview(entity, entityId),

    queryFn: async (): Promise<RollbackPreviewResponse> => {
      const response = await auditLogService.getRollbackPreview(
        entity,
        entityId
      );
      return response;
    },

    enabled: !!entity && !!entityId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/* ===========================================
   COMPARE VERSIONS
   =========================================== */

export interface CompareVersionsParams {
  entity: AuditEntity | string;
  entityId: string;
  v1: number;
  v2: number;
}

export type CompareVersionsOptions = Omit<
  UseQueryOptions<ComparisonResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useCompareVersions(
  params: CompareVersionsParams,
  options?: CompareVersionsOptions
) {
  const { entity, entityId, v1, v2 } = params;

  return useQuery({
    queryKey: auditLogKeys.comparison(entity, entityId, v1, v2),

    queryFn: async (): Promise<ComparisonResponse> => {
      const response = await auditLogService.compareVersions(
        entity,
        entityId,
        v1,
        v2
      );
      return response;
    },

    enabled: !!entity && !!entityId && v1 !== undefined && v2 !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes (comparisons don't change)
    ...options,
  });
}

export default useEntityHistory;
