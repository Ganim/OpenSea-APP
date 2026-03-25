/**
 * Dependants API - Employee nested resource
 */

import { dependantsService } from '@/services/hr/dependants.service';
import type {
  EmployeeDependant,
  CreateDependantData,
  UpdateDependantData,
} from '@/types/hr';

export const dependantsApi = {
  async list(employeeId: string): Promise<EmployeeDependant[]> {
    const response = await dependantsService.list(employeeId);
    return response.dependants;
  },

  async get(
    employeeId: string,
    dependantId: string
  ): Promise<EmployeeDependant> {
    const response = await dependantsService.get(employeeId, dependantId);
    return response.dependant;
  },

  async create(
    employeeId: string,
    data: CreateDependantData
  ): Promise<EmployeeDependant> {
    const response = await dependantsService.create(employeeId, data);
    return response.dependant;
  },

  async update(
    employeeId: string,
    dependantId: string,
    data: UpdateDependantData
  ): Promise<EmployeeDependant> {
    const response = await dependantsService.update(
      employeeId,
      dependantId,
      data
    );
    return response.dependant;
  },

  async delete(employeeId: string, dependantId: string): Promise<void> {
    await dependantsService.delete(employeeId, dependantId);
  },
};

export const dependantKeys = {
  all: (employeeId: string) => ['employees', employeeId, 'dependants'] as const,
  list: (employeeId: string) =>
    [...dependantKeys.all(employeeId), 'list'] as const,
  detail: (employeeId: string, dependantId: string) =>
    [...dependantKeys.all(employeeId), 'detail', dependantId] as const,
} as const;
