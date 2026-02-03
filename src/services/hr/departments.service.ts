import { apiClient } from '@/lib/api-client';
import type { Department } from '@/types/hr';
import type { PaginationMeta } from '@/types/pagination';

export interface DepartmentsResponse {
  departments: Department[];
  // Backend pode retornar paginacao flat ou dentro de meta
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface DepartmentResponse {
  department: Department;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  companyId: string;
  description?: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  companyId?: string;
  description?: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

export interface ListDepartmentsParams {
  page?: number;
  perPage?: number;
  search?: string;
  companyId?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export const departmentsService = {
  // GET /v1/hr/departments
  async listDepartments(
    params?: ListDepartmentsParams
  ): Promise<DepartmentsResponse> {
    const query = new URLSearchParams({
      populate: 'company',
    });

    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    if (params?.search) query.append('search', params.search);
    if (params?.companyId) query.append('companyId', params.companyId);
    if (params?.isActive !== undefined)
      query.append('isActive', String(params.isActive));
    if (params?.includeDeleted !== undefined)
      query.append('includeDeleted', String(params.includeDeleted));

    return apiClient.get<DepartmentsResponse>(
      `/v1/hr/departments?${query.toString()}`
    );
  },

  // GET /v1/hr/departments/:id
  async getDepartment(id: string): Promise<DepartmentResponse> {
    return apiClient.get<DepartmentResponse>(
      `/v1/hr/departments/${id}?populate=company`
    );
  },

  // POST /v1/hr/departments
  async createDepartment(
    data: CreateDepartmentRequest
  ): Promise<DepartmentResponse> {
    return apiClient.post<DepartmentResponse>('/v1/hr/departments', data);
  },

  // PUT /v1/hr/departments/:id
  async updateDepartment(
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<DepartmentResponse> {
    return apiClient.put<DepartmentResponse>(`/v1/hr/departments/${id}`, data);
  },

  // DELETE /v1/hr/departments/:id
  async deleteDepartment(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/departments/${id}`);
  },
};
