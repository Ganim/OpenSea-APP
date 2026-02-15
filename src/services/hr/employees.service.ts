import { apiClient } from '@/lib/api-client';
import type { Employee, EmployeeLabelDataResponse } from '@/types/hr';
import type { PaginationMeta } from '@/types/pagination';

export interface EmployeesResponse {
  employees: Employee[];
  // Backend pode retornar paginacao flat ou dentro de meta
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface EmployeeResponse {
  employee: Employee;
}

export interface CreateEmployeeRequest {
  registrationNumber: string;
  fullName: string;
  cpf: string;
  hireDate: string;
  baseSalary: number;
  contractType: string;
  workRegime: string;
  weeklyHours: number;
  companyId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  supervisorId?: string | null;
  userId?: string | null;
  socialName?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  birthPlace?: string;
  rg?: string;
  rgIssuer?: string;
  rgIssueDate?: string;
  pis?: string;
  ctpsNumber?: string;
  ctpsSeries?: string;
  ctpsState?: string;
  status?: string;
  terminationDate?: string;
}

export interface UpdateEmployeeRequest {
  registrationNumber?: string;
  fullName?: string;
  cpf?: string;
  hireDate?: string;
  baseSalary?: number;
  contractType?: string;
  workRegime?: string;
  weeklyHours?: number;
  companyId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  supervisorId?: string | null;
  userId?: string | null;
  socialName?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  birthPlace?: string;
  rg?: string;
  rgIssuer?: string;
  rgIssueDate?: string;
  pis?: string;
  ctpsNumber?: string;
  ctpsSeries?: string;
  ctpsState?: string;
  status?: string;
  terminationDate?: string;
}

export interface ListEmployeesParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  departmentId?: string;
  positionId?: string;
  supervisorId?: string;
  companyId?: string;
  unlinked?: boolean;
  includeDeleted?: boolean;
}

export const employeesService = {
  // GET /v1/hr/employees
  async listEmployees(
    params?: ListEmployeesParams
  ): Promise<EmployeesResponse> {
    const query = new URLSearchParams({
      page: String(params?.page ?? 1),
      perPage: String(params?.perPage ?? 50),
      includeDeleted: String(params?.includeDeleted ?? false),
      populate: 'department,position,company',
    });

    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.positionId) query.append('positionId', params.positionId);
    if (params?.supervisorId) query.append('supervisorId', params.supervisorId);
    if (params?.companyId) query.append('companyId', params.companyId);
    if (params?.unlinked) query.append('unlinked', 'true');

    return apiClient.get<EmployeesResponse>(
      `/v1/hr/employees?${query.toString()}`
    );
  },

  // GET /v1/hr/employees/:id
  async getEmployee(id: string): Promise<EmployeeResponse> {
    return apiClient.get<EmployeeResponse>(
      `/v1/hr/employees/${id}?populate=department,position,company`
    );
  },

  // POST /v1/hr/employees
  async createEmployee(data: CreateEmployeeRequest): Promise<EmployeeResponse> {
    return apiClient.post<EmployeeResponse>('/v1/hr/employees', data);
  },

  // POST /v1/hr/employees-with-user
  async createEmployeeWithUser(
    data: CreateEmployeeRequest & {
      permissionGroupId?: string;
      userEmail?: string;
      userPassword?: string;
    }
  ): Promise<EmployeeResponse> {
    return apiClient.post<EmployeeResponse>('/v1/hr/employees-with-user', data);
  },

  // PUT /v1/hr/employees/:id
  async updateEmployee(
    id: string,
    data: UpdateEmployeeRequest
  ): Promise<EmployeeResponse> {
    return apiClient.put<EmployeeResponse>(`/v1/hr/employees/${id}`, data);
  },

  // DELETE /v1/hr/employees/:id
  async deleteEmployee(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/employees/${id}`);
  },

  // POST /v1/hr/employees/label-data
  async getLabelData(
    employeeIds: string[]
  ): Promise<EmployeeLabelDataResponse> {
    return apiClient.post<EmployeeLabelDataResponse>(
      '/v1/hr/employees/label-data',
      { employeeIds }
    );
  },

  // POST /v1/hr/employees/:id/create-user
  async createUserForEmployee(
    id: string,
    data: {
      email: string;
      password: string;
      permissionGroupId: string;
    }
  ): Promise<EmployeeResponse> {
    return apiClient.post<EmployeeResponse>(
      `/v1/hr/employees/${id}/create-user`,
      data
    );
  },

  // POST /v1/hr/employees/:id/link-user
  async linkUserToEmployee(
    employeeId: string,
    userId: string
  ): Promise<EmployeeResponse> {
    return apiClient.post<EmployeeResponse>(
      `/v1/hr/employees/${employeeId}/link-user`,
      { userId }
    );
  },

  // GET /v1/hr/employees/by-user/:userId
  async getEmployeeByUserId(userId: string): Promise<EmployeeResponse> {
    return apiClient.get<EmployeeResponse>(
      `/v1/hr/employees/by-user/${userId}`
    );
  },

  // POST /v1/hr/employees/:id/unlink-user
  async unlinkUserFromEmployee(employeeId: string): Promise<EmployeeResponse> {
    return apiClient.post<EmployeeResponse>(
      `/v1/hr/employees/${employeeId}/unlink-user`
    );
  },
};
