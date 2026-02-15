/**
 * Audit Log Service
 * Servico para gerenciamento de logs de auditoria
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  AuditLogsResponse,
  AuditLogFilters,
  HistoryResponse,
  RollbackPreviewResponse,
  ComparisonResponse,
  AuditEntity,
} from '@/app/(dashboard)/admin/overview/audit-logs/src/types';

// ============================================
// LIST AUDIT LOGS
// ============================================

export async function listAuditLogs(
  filters?: AuditLogFilters
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.AUDIT.LIST}?${queryString}`
    : API_ENDPOINTS.AUDIT.LIST;
  const response = await apiClient.get<AuditLogsResponse>(url);
  return response;
}

// ============================================
// GET ENTITY HISTORY
// ============================================

export async function getEntityHistory(
  entity: AuditEntity | string,
  entityId: string
): Promise<HistoryResponse> {
  const response = await apiClient.get<HistoryResponse>(
    API_ENDPOINTS.AUDIT.HISTORY(entity, entityId)
  );
  return response;
}

// ============================================
// GET ROLLBACK PREVIEW
// ============================================

export async function getRollbackPreview(
  entity: AuditEntity | string,
  entityId: string
): Promise<RollbackPreviewResponse> {
  const response = await apiClient.get<RollbackPreviewResponse>(
    API_ENDPOINTS.AUDIT.ROLLBACK_PREVIEW(entity, entityId)
  );
  return response;
}

// ============================================
// COMPARE VERSIONS
// ============================================

export async function compareVersions(
  entity: AuditEntity | string,
  entityId: string,
  v1: number,
  v2: number
): Promise<ComparisonResponse> {
  const response = await apiClient.get<ComparisonResponse>(
    `${API_ENDPOINTS.AUDIT.COMPARE(entity, entityId)}?v1=${v1}&v2=${v2}`
  );
  return response;
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export const auditLogService = {
  listAuditLogs,
  getEntityHistory,
  getRollbackPreview,
  compareVersions,
};
