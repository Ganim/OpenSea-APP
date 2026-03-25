import { apiClient } from '@/lib/api-client';
import type {
  EmployeeDependant,
  CreateDependantData,
  UpdateDependantData,
} from '@/types/hr';

export interface DependantResponse {
  dependant: EmployeeDependant;
}

export interface DependantsResponse {
  dependants: EmployeeDependant[];
}

export const dependantsService = {
  async list(employeeId: string): Promise<DependantsResponse> {
    return apiClient.get<DependantsResponse>(
      `/v1/hr/employees/${employeeId}/dependants`
    );
  },

  async get(
    employeeId: string,
    dependantId: string
  ): Promise<DependantResponse> {
    return apiClient.get<DependantResponse>(
      `/v1/hr/employees/${employeeId}/dependants/${dependantId}`
    );
  },

  async create(
    employeeId: string,
    data: CreateDependantData
  ): Promise<DependantResponse> {
    return apiClient.post<DependantResponse>(
      `/v1/hr/employees/${employeeId}/dependants`,
      data
    );
  },

  async update(
    employeeId: string,
    dependantId: string,
    data: UpdateDependantData
  ): Promise<DependantResponse> {
    return apiClient.patch<DependantResponse>(
      `/v1/hr/employees/${employeeId}/dependants/${dependantId}`,
      data
    );
  },

  async delete(employeeId: string, dependantId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/hr/employees/${employeeId}/dependants/${dependantId}`
    );
  },
};
