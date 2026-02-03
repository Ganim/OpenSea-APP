import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/stock';

export const categoriesService = {
  // GET /v1/categories
  async listCategories(): Promise<CategoriesResponse> {
    return apiClient.get<CategoriesResponse>(API_ENDPOINTS.CATEGORIES.LIST);
  },

  // GET /v1/categories/:id
  async getCategory(id: string): Promise<CategoryResponse> {
    return apiClient.get<CategoryResponse>(API_ENDPOINTS.CATEGORIES.GET(id));
  },

  // POST /v1/categories
  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    return apiClient.post<CategoryResponse>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data
    );
  },

  // PUT /v1/categories/:id
  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse> {
    return apiClient.put<CategoryResponse>(
      API_ENDPOINTS.CATEGORIES.UPDATE(id),
      data
    );
  },

  // DELETE /v1/categories/:id
  async deleteCategory(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.CATEGORIES.DELETE(id));
  },

  // PATCH /v1/categories/reorder
  async reorderCategories(
    items: Array<{ id: string; displayOrder: number }>
  ): Promise<void> {
    return apiClient.patch<void>(API_ENDPOINTS.CATEGORIES.REORDER, { items });
  },
};
