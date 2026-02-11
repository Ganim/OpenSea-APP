import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  FinanceCategory,
  FinanceCategoriesQuery,
  CreateFinanceCategoryData,
  UpdateFinanceCategoryData,
} from '@/types/finance';

export interface FinanceCategoriesResponse {
  categories: FinanceCategory[];
}

export interface FinanceCategoryResponse {
  category: FinanceCategory;
}

export const financeCategoriesService = {
  async list(
    params?: FinanceCategoriesQuery
  ): Promise<FinanceCategoriesResponse> {
    const query = new URLSearchParams();

    if (params?.type) query.append('type', params.type);
    if (params?.isActive !== undefined)
      query.append('isActive', String(params.isActive));
    if (params?.parentId) query.append('parentId', params.parentId);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<FinanceCategoriesResponse>(
      `${API_ENDPOINTS.FINANCE_CATEGORIES.LIST}${suffix}`
    );
  },

  async get(id: string): Promise<FinanceCategoryResponse> {
    return apiClient.get<FinanceCategoryResponse>(
      API_ENDPOINTS.FINANCE_CATEGORIES.GET(id)
    );
  },

  async create(
    data: CreateFinanceCategoryData
  ): Promise<FinanceCategoryResponse> {
    return apiClient.post<FinanceCategoryResponse>(
      API_ENDPOINTS.FINANCE_CATEGORIES.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: UpdateFinanceCategoryData
  ): Promise<FinanceCategoryResponse> {
    return apiClient.patch<FinanceCategoryResponse>(
      API_ENDPOINTS.FINANCE_CATEGORIES.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.FINANCE_CATEGORIES.DELETE(id));
  },
};
