import { apiClient } from '@/lib/api-client';
import type {
  ActiveDelegationsResponse,
  ApprovalDelegationsResponse,
  CreateDelegationData,
  CreateDelegationResponse,
  DelegationScope,
  RevokeDelegationResponse,
} from '@/types/hr';

// ============================================================================
// List Params
// ============================================================================

export interface ListDelegationsParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// Helper: Build query string
// ============================================================================

function buildQuery(params?: object): string {
  if (!params) return '';
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(
    params as Record<string, unknown>,
  )) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================================
// Approval Delegations Service
// ============================================================================

export const approvalDelegationsService = {
  /** List outgoing delegations (created by the current user) */
  async listOutgoing(
    params?: ListDelegationsParams,
  ): Promise<ApprovalDelegationsResponse> {
    const response = await apiClient.get<ApprovalDelegationsResponse>(
      `/v1/hr/approval-delegations/outgoing${buildQuery(params)}`,
    );
    return response.data;
  },

  /** List incoming delegations (received by the current user) */
  async listIncoming(
    params?: ListDelegationsParams,
  ): Promise<ApprovalDelegationsResponse> {
    const response = await apiClient.get<ApprovalDelegationsResponse>(
      `/v1/hr/approval-delegations/incoming${buildQuery(params)}`,
    );
    return response.data;
  },

  /** Get currently active/effective delegations */
  async getActive(
    scope?: DelegationScope,
  ): Promise<ActiveDelegationsResponse> {
    const query = scope ? `?scope=${scope}` : '';
    const response = await apiClient.get<ActiveDelegationsResponse>(
      `/v1/hr/approval-delegations/active${query}`,
    );
    return response.data;
  },

  /** Create a new delegation */
  async create(
    data: CreateDelegationData,
  ): Promise<CreateDelegationResponse> {
    const response = await apiClient.post<CreateDelegationResponse>(
      '/v1/hr/approval-delegations',
      data,
    );
    return response.data;
  },

  /** Revoke a delegation */
  async revoke(delegationId: string): Promise<RevokeDelegationResponse> {
    const response = await apiClient.patch<RevokeDelegationResponse>(
      `/v1/hr/approval-delegations/${delegationId}/revoke`,
    );
    return response.data;
  },
};
