import { apiClient } from '@/lib/api-client';
import type {
  AssignTerminalOperatorResponse,
  ListTerminalOperatorsResponse,
} from '@/types/sales';

export interface ListTerminalOperatorsParams {
  page?: number;
  limit?: number;
  isActive?: 'true' | 'all';
}

/**
 * Service for `POS Terminal ↔ Employee operator` links (Emporion Fase 1).
 * Backed by `/v1/pos/terminals/:terminalId/operators`.
 */
export const posTerminalOperatorsService = {
  async list(
    terminalId: string,
    params?: ListTerminalOperatorsParams
  ): Promise<ListTerminalOperatorsResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.isActive) search.set('isActive', params.isActive);
    const query = search.toString();
    const url = query
      ? `/v1/pos/terminals/${terminalId}/operators?${query}`
      : `/v1/pos/terminals/${terminalId}/operators`;
    return apiClient.get<ListTerminalOperatorsResponse>(url);
  },

  async assign(
    terminalId: string,
    employeeId: string
  ): Promise<AssignTerminalOperatorResponse> {
    return apiClient.post<AssignTerminalOperatorResponse>(
      `/v1/pos/terminals/${terminalId}/operators`,
      { employeeId }
    );
  },

  async revoke(terminalId: string, employeeId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/pos/terminals/${terminalId}/operators/${employeeId}`
    );
  },
};
