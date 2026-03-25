import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  ComboResponse,
  CombosQuery,
  CreateComboRequest,
  PaginatedCombosResponse,
  UpdateComboRequest,
} from '@/types/sales';

export const combosService = {
  async list(query?: CombosQuery): Promise<PaginatedCombosResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query?.search) params.append('search', query.search);
    if (query?.type) params.append('type', query.type);
    if (query?.isActive) params.append('isActive', query.isActive);

    const url = params.toString()
      ? `${API_ENDPOINTS.COMBOS.LIST}?${params.toString()}`
      : API_ENDPOINTS.COMBOS.LIST;

    return apiClient.get<PaginatedCombosResponse>(url);
  },

  async get(id: string): Promise<ComboResponse> {
    return apiClient.get<ComboResponse>(API_ENDPOINTS.COMBOS.GET(id));
  },

  async create(data: CreateComboRequest): Promise<ComboResponse> {
    return apiClient.post<ComboResponse>(API_ENDPOINTS.COMBOS.CREATE, data);
  },

  async update(id: string, data: UpdateComboRequest): Promise<ComboResponse> {
    return apiClient.put<ComboResponse>(API_ENDPOINTS.COMBOS.UPDATE(id), data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.COMBOS.DELETE(id));
  },
};
