import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  ItemMovementExtended,
  MovementHistoryQuery,
  MovementHistoryResponse,
  PendingApprovalsResponse,
  MovementApprovalRequest,
  MovementRejectionRequest,
  BatchApprovalRequest,
} from '@/types/stock';

function buildQueryString(query?: MovementHistoryQuery): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.productId) params.append('productId', query.productId);
  if (query.variantId) params.append('variantId', query.variantId);
  if (query.itemId) params.append('itemId', query.itemId);
  if (query.locationId) params.append('locationId', query.locationId);
  if (query.movementType) params.append('movementType', query.movementType);
  if (query.status) params.append('status', query.status);
  if (query.startDate) params.append('startDate', query.startDate);
  if (query.endDate) params.append('endDate', query.endDate);
  if (query.userId) params.append('userId', query.userId);
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const movementsService = {
  // GET /v1/item-movements (existing)
  async listMovements(
    query?: MovementHistoryQuery
  ): Promise<MovementHistoryResponse> {
    const url = `${API_ENDPOINTS.MOVEMENTS.LIST}${buildQueryString(query)}`;
    return apiClient.get<MovementHistoryResponse>(url);
  },

  // GET /v1/movements/history
  async getHistory(
    query?: MovementHistoryQuery
  ): Promise<MovementHistoryResponse> {
    const url = `${API_ENDPOINTS.MOVEMENTS.HISTORY}${buildQueryString(query)}`;
    return apiClient.get<MovementHistoryResponse>(url);
  },

  // GET /v1/products/:productId/movements
  async getProductMovements(
    productId: string,
    query?: MovementHistoryQuery
  ): Promise<MovementHistoryResponse> {
    const url = `${API_ENDPOINTS.MOVEMENTS.PRODUCT_HISTORY(productId)}${buildQueryString(query)}`;
    return apiClient.get<MovementHistoryResponse>(url);
  },

  // GET /v1/variants/:variantId/movements
  async getVariantMovements(
    variantId: string,
    query?: MovementHistoryQuery
  ): Promise<MovementHistoryResponse> {
    const url = `${API_ENDPOINTS.MOVEMENTS.VARIANT_HISTORY(variantId)}${buildQueryString(query)}`;
    return apiClient.get<MovementHistoryResponse>(url);
  },

  // GET /v1/bins/:binId/movements
  async getBinMovements(
    binId: string,
    query?: MovementHistoryQuery
  ): Promise<MovementHistoryResponse> {
    const url = `${API_ENDPOINTS.MOVEMENTS.BIN_HISTORY(binId)}${buildQueryString(query)}`;
    return apiClient.get<MovementHistoryResponse>(url);
  },

  // GET /v1/movements/pending-approval
  async getPendingApprovals(): Promise<PendingApprovalsResponse> {
    return apiClient.get<PendingApprovalsResponse>(
      API_ENDPOINTS.MOVEMENTS.PENDING_APPROVAL
    );
  },

  // POST /v1/movements/:id/approve
  async approveMovement(
    id: string,
    data?: { notes?: string }
  ): Promise<{ movement: ItemMovementExtended }> {
    return apiClient.post<{ movement: ItemMovementExtended }>(
      API_ENDPOINTS.MOVEMENTS.APPROVE(id),
      data || {}
    );
  },

  // POST /v1/movements/:id/reject
  async rejectMovement(
    id: string,
    data: { reason: string }
  ): Promise<{ movement: ItemMovementExtended }> {
    return apiClient.post<{ movement: ItemMovementExtended }>(
      API_ENDPOINTS.MOVEMENTS.REJECT(id),
      data
    );
  },

  // POST /v1/movements/approve/batch
  async approveBatch(
    data: BatchApprovalRequest
  ): Promise<{ approved: string[]; failed: string[] }> {
    return apiClient.post<{ approved: string[]; failed: string[] }>(
      API_ENDPOINTS.MOVEMENTS.APPROVE_BATCH,
      data
    );
  },
};
