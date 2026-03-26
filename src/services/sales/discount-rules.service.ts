import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface DiscountRulesQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DiscountRulesResponse {
  discountRules: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface DiscountRuleResponse {
  discountRule: Record<string, unknown>;
}

export const discountRulesService = {
  async list(params?: DiscountRulesQuery): Promise<DiscountRulesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.isActive !== undefined)
      searchParams.set('isActive', String(params.isActive));
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.DISCOUNT_RULES.LIST}?${query}`
      : API_ENDPOINTS.DISCOUNT_RULES.LIST;
    return apiClient.get<DiscountRulesResponse>(url);
  },

  async get(id: string): Promise<DiscountRuleResponse> {
    return apiClient.get<DiscountRuleResponse>(
      API_ENDPOINTS.DISCOUNT_RULES.GET(id)
    );
  },

  async create(data: Record<string, unknown>): Promise<DiscountRuleResponse> {
    return apiClient.post<DiscountRuleResponse>(
      API_ENDPOINTS.DISCOUNT_RULES.CREATE,
      data
    );
  },

  async update(
    id: string,
    data: Record<string, unknown>
  ): Promise<DiscountRuleResponse> {
    return apiClient.put<DiscountRuleResponse>(
      API_ENDPOINTS.DISCOUNT_RULES.UPDATE(id),
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.DISCOUNT_RULES.DELETE(id));
  },
};
