import { apiClient } from '@/lib/api-client';
import type {
  PPEItem,
  PPEAssignment,
  CreatePPEItemData,
  UpdatePPEItemData,
  AdjustPPEItemStockData,
  AssignPPEData,
  ReturnPPEData,
} from '@/types/hr';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface PPEItemResponse {
  ppeItem: PPEItem;
}

export interface PPEItemsResponse {
  ppeItems: PPEItem[];
  total: number;
}

export interface PPEAssignmentResponse {
  assignment: PPEAssignment;
}

export interface PPEAssignmentsResponse {
  assignments: PPEAssignment[];
  total: number;
}

// ============================================================================
// PPE ITEMS SERVICE
// ============================================================================

export interface ListPPEItemsParams {
  category?: string;
  isActive?: string;
  lowStockOnly?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface ListPPEAssignmentsParams {
  employeeId?: string;
  ppeItemId?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export interface ListExpiringAssignmentsParams {
  daysAhead?: number;
  page?: number;
  perPage?: number;
}

export const ppeService = {
  // ============================================================================
  // PPE ITEMS
  // ============================================================================

  async listItems(params?: ListPPEItemsParams): Promise<PPEItemsResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.isActive) query.append('isActive', params.isActive);
    if (params?.lowStockOnly) query.append('lowStockOnly', params.lowStockOnly);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<PPEItemsResponse>(
      `/v1/hr/ppe-items${qs ? `?${qs}` : ''}`
    );
  },

  async getItem(id: string): Promise<PPEItemResponse> {
    return apiClient.get<PPEItemResponse>(`/v1/hr/ppe-items/${id}`);
  },

  async createItem(data: CreatePPEItemData): Promise<PPEItemResponse> {
    return apiClient.post<PPEItemResponse>('/v1/hr/ppe-items', data);
  },

  async updateItem(
    id: string,
    data: UpdatePPEItemData
  ): Promise<PPEItemResponse> {
    return apiClient.put<PPEItemResponse>(`/v1/hr/ppe-items/${id}`, data);
  },

  async deleteItem(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/ppe-items/${id}`);
  },

  async adjustStock(
    id: string,
    data: AdjustPPEItemStockData
  ): Promise<PPEItemResponse> {
    return apiClient.patch<PPEItemResponse>(
      `/v1/hr/ppe-items/${id}/stock`,
      data
    );
  },

  // ============================================================================
  // PPE ASSIGNMENTS
  // ============================================================================

  async listAssignments(
    params?: ListPPEAssignmentsParams
  ): Promise<PPEAssignmentsResponse> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.ppeItemId) query.append('ppeItemId', params.ppeItemId);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<PPEAssignmentsResponse>(
      `/v1/hr/ppe-assignments${qs ? `?${qs}` : ''}`
    );
  },

  async listExpiringAssignments(
    params?: ListExpiringAssignmentsParams
  ): Promise<PPEAssignmentsResponse> {
    const query = new URLSearchParams();
    if (params?.daysAhead) query.append('daysAhead', String(params.daysAhead));
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<PPEAssignmentsResponse>(
      `/v1/hr/ppe-assignments/expiring${qs ? `?${qs}` : ''}`
    );
  },

  async assignPPE(data: AssignPPEData): Promise<PPEAssignmentResponse> {
    return apiClient.post<PPEAssignmentResponse>(
      '/v1/hr/ppe-assignments',
      data
    );
  },

  async returnPPE(
    assignmentId: string,
    data: ReturnPPEData
  ): Promise<PPEAssignmentResponse> {
    return apiClient.patch<PPEAssignmentResponse>(
      `/v1/hr/ppe-assignments/${assignmentId}/return`,
      data
    );
  },
};
