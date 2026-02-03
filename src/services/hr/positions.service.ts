import { apiClient } from '@/lib/api-client';
import type { Position } from '@/types/hr';
import type { PaginationMeta } from '@/types/pagination';

export interface PositionsResponse {
  positions: Position[];
  // Backend pode retornar paginacao flat ou dentro de meta
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface PositionResponse {
  position: Position;
}

export interface CreatePositionRequest {
  name: string;
  code: string;
  description?: string;
  departmentId?: string | null;
  level?: number;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
}

export interface UpdatePositionRequest {
  name?: string;
  code?: string;
  description?: string;
  departmentId?: string | null;
  level?: number;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
}

export interface ListPositionsParams {
  page?: number;
  perPage?: number;
  search?: string;
  departmentId?: string;
  companyId?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export const positionsService = {
  // GET /v1/hr/positions
  async listPositions(
    params?: ListPositionsParams
  ): Promise<PositionsResponse> {
    const query = new URLSearchParams({
      populate: 'department,department.company',
    });

    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    if (params?.search) query.append('search', params.search);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.companyId) query.append('companyId', params.companyId);
    if (params?.isActive !== undefined)
      query.append('isActive', String(params.isActive));
    if (params?.includeDeleted !== undefined)
      query.append('includeDeleted', String(params.includeDeleted));

    return apiClient.get<PositionsResponse>(
      `/v1/hr/positions?${query.toString()}`
    );
  },

  // GET /v1/hr/positions/:id
  async getPosition(id: string): Promise<PositionResponse> {
    return apiClient.get<PositionResponse>(
      `/v1/hr/positions/${id}?populate=department,department.company`
    );
  },

  // POST /v1/hr/positions
  async createPosition(data: CreatePositionRequest): Promise<PositionResponse> {
    return apiClient.post<PositionResponse>('/v1/hr/positions', data);
  },

  // PUT /v1/hr/positions/:id
  async updatePosition(
    id: string,
    data: UpdatePositionRequest
  ): Promise<PositionResponse> {
    return apiClient.put<PositionResponse>(`/v1/hr/positions/${id}`, data);
  },

  // DELETE /v1/hr/positions/:id
  async deletePosition(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/positions/${id}`);
  },
};
