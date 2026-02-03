import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  InventoryCycle,
  InventoryCycleResponse,
  InventoryCyclesResponse,
  InventoryCount,
  InventoryCountsResponse,
  CreateInventoryCycleRequest,
  StartCycleRequest,
  CompleteCycleRequest,
  SubmitCountRequest,
  AdjustCountRequest,
  PaginatedQuery,
} from '@/types/stock';

function buildQueryString(query?: PaginatedQuery): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const inventoryService = {
  // ============================================
  // INVENTORY CYCLES
  // ============================================

  // GET /v1/inventory-cycles
  async listCycles(query?: PaginatedQuery): Promise<InventoryCyclesResponse> {
    const url = `${API_ENDPOINTS.INVENTORY.CYCLES_LIST}${buildQueryString(query)}`;
    return apiClient.get<InventoryCyclesResponse>(url);
  },

  // GET /v1/inventory-cycles/:id
  async getCycle(id: string): Promise<InventoryCycleResponse> {
    return apiClient.get<InventoryCycleResponse>(
      API_ENDPOINTS.INVENTORY.CYCLES_GET(id)
    );
  },

  // POST /v1/inventory-cycles
  async createCycle(
    data: CreateInventoryCycleRequest
  ): Promise<InventoryCycleResponse> {
    return apiClient.post<InventoryCycleResponse>(
      API_ENDPOINTS.INVENTORY.CYCLES_CREATE,
      data
    );
  },

  // POST /v1/inventory-cycles/:id/start
  async startCycle(
    id: string,
    data?: StartCycleRequest
  ): Promise<InventoryCycleResponse> {
    return apiClient.post<InventoryCycleResponse>(
      API_ENDPOINTS.INVENTORY.CYCLES_START(id),
      data || {}
    );
  },

  // POST /v1/inventory-cycles/:id/complete
  async completeCycle(
    id: string,
    data?: CompleteCycleRequest
  ): Promise<InventoryCycleResponse> {
    return apiClient.post<InventoryCycleResponse>(
      API_ENDPOINTS.INVENTORY.CYCLES_COMPLETE(id),
      data || {}
    );
  },

  // GET /v1/inventory-cycles/:id/counts
  async getCycleCounts(cycleId: string): Promise<InventoryCountsResponse> {
    return apiClient.get<InventoryCountsResponse>(
      API_ENDPOINTS.INVENTORY.CYCLES_COUNTS(cycleId)
    );
  },

  // ============================================
  // INVENTORY COUNTS
  // ============================================

  // POST /v1/inventory-counts/:countId/count
  async submitCount(
    countId: string,
    data: SubmitCountRequest
  ): Promise<{ count: InventoryCount }> {
    return apiClient.post<{ count: InventoryCount }>(
      API_ENDPOINTS.INVENTORY.COUNT_SUBMIT(countId),
      data
    );
  },

  // POST /v1/inventory-counts/:countId/adjust
  async adjustCount(
    countId: string,
    data: AdjustCountRequest
  ): Promise<{ count: InventoryCount }> {
    return apiClient.post<{ count: InventoryCount }>(
      API_ENDPOINTS.INVENTORY.COUNT_ADJUST(countId),
      data
    );
  },

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  // Get active cycles (IN_PROGRESS status)
  async getActiveCycles(): Promise<InventoryCyclesResponse> {
    return apiClient.get<InventoryCyclesResponse>(
      `${API_ENDPOINTS.INVENTORY.CYCLES_LIST}?status=IN_PROGRESS`
    );
  },

  // Get pending counts for a cycle
  async getPendingCounts(cycleId: string): Promise<InventoryCount[]> {
    const response = await this.getCycleCounts(cycleId);
    return response.counts.filter(c => c.status === 'PENDING');
  },

  // Get cycle progress
  async getCycleProgress(cycleId: string): Promise<{
    total: number;
    counted: number;
    adjusted: number;
    pending: number;
    percentage: number;
  }> {
    const cycle = await this.getCycle(cycleId);
    const total = cycle.cycle.totalBins || 0;
    const counted = cycle.cycle.countedBins || 0;
    const adjusted = cycle.cycle.adjustedBins || 0;
    const pending = total - counted;
    const percentage = total > 0 ? Math.round((counted / total) * 100) : 0;
    return { total, counted, adjusted, pending, percentage };
  },
};
