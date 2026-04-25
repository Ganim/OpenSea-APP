import { apiClient } from '@/lib/api-client';
import type {
  ListConflictsParams,
  ListConflictsResponse,
  PosOrderConflictDetailed,
  ResolveConflictRequest,
  ResolveConflictResponse,
} from '@/types/sales';

/**
 * Service for the admin "POS Conflicts" panel (Emporion Fase 1).
 * Backed by `/v1/admin/pos/conflicts`.
 */
export const posConflictsService = {
  async list(params?: ListConflictsParams): Promise<ListConflictsResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.terminalId) search.set('terminalId', params.terminalId);
    if (params?.operatorEmployeeId)
      search.set('operatorEmployeeId', params.operatorEmployeeId);
    if (params?.status) {
      const values = Array.isArray(params.status)
        ? params.status
        : [params.status];
      values.forEach(v => search.append('status', v));
    }
    const query = search.toString();
    const url = query
      ? `/v1/admin/pos/conflicts?${query}`
      : `/v1/admin/pos/conflicts`;
    return apiClient.get<ListConflictsResponse>(url);
  },

  async get(id: string): Promise<{ conflict: PosOrderConflictDetailed }> {
    return apiClient.get<{ conflict: PosOrderConflictDetailed }>(
      `/v1/admin/pos/conflicts/${id}`
    );
  },

  async resolve(
    id: string,
    payload: ResolveConflictRequest
  ): Promise<ResolveConflictResponse> {
    return apiClient.post<ResolveConflictResponse>(
      `/v1/admin/pos/conflicts/${id}/resolve`,
      payload
    );
  },
};
