import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  RecurringConfig,
  CreateRecurringConfigRequest,
  UpdateRecurringConfigRequest,
  RecurringConfigsQuery,
} from '@/types/finance';
import type { PaginationMeta } from '@/types/pagination';

// P1-43: standard `{ data, meta }` shape with legacy `configs` alias
// kept during the migration window.
export interface RecurringConfigsResponse {
  data: RecurringConfig[];
  configs: RecurringConfig[];
  meta: PaginationMeta;
}

export interface RecurringConfigResponse {
  config: RecurringConfig;
}

export const financeRecurringService = {
  async list(
    params?: RecurringConfigsQuery
  ): Promise<RecurringConfigsResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 20),
    });

    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    // P1-43: tolerate both the new `data` key and the legacy `configs`.
    const raw = await apiClient.get<
      Partial<RecurringConfigsResponse> & {
        data?: RecurringConfig[];
        configs?: RecurringConfig[];
      }
    >(`${API_ENDPOINTS.FINANCE_RECURRING.LIST}?${query.toString()}`);
    const list = raw.data ?? raw.configs ?? [];
    return {
      data: list,
      configs: list,
      meta: raw.meta as PaginationMeta,
    };
  },

  async get(id: string): Promise<RecurringConfigResponse> {
    return apiClient.get<RecurringConfigResponse>(
      API_ENDPOINTS.FINANCE_RECURRING.GET(id)
    );
  },

  async create(
    data: CreateRecurringConfigRequest
  ): Promise<RecurringConfigResponse> {
    return apiClient.post<RecurringConfigResponse>(
      API_ENDPOINTS.FINANCE_RECURRING.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: UpdateRecurringConfigRequest
  ): Promise<RecurringConfigResponse> {
    return apiClient.patch<RecurringConfigResponse>(
      API_ENDPOINTS.FINANCE_RECURRING.UPDATE(id),
      data
    );
  },

  async pause(id: string): Promise<RecurringConfigResponse> {
    return apiClient.patch<RecurringConfigResponse>(
      API_ENDPOINTS.FINANCE_RECURRING.PAUSE(id),
      {}
    );
  },

  async resume(id: string): Promise<RecurringConfigResponse> {
    return apiClient.patch<RecurringConfigResponse>(
      API_ENDPOINTS.FINANCE_RECURRING.RESUME(id),
      {}
    );
  },

  async cancel(id: string): Promise<RecurringConfigResponse> {
    return apiClient.patch<RecurringConfigResponse>(
      API_ENDPOINTS.FINANCE_RECURRING.CANCEL(id),
      {}
    );
  },
};
