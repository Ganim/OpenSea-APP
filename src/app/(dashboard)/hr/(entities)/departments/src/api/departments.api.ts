import { departmentsService } from '@/services/hr';
import type {
  CreateDepartmentRequest,
  DepartmentResponse,
  DepartmentsResponse,
  ListDepartmentsParams,
  UpdateDepartmentRequest,
} from '@/services/hr/departments.service';
import type { Department } from '@/types/hr';

export const departmentsApi = {
  async list(params?: ListDepartmentsParams): Promise<DepartmentsResponse> {
    return departmentsService.listDepartments(params);
  },

  async get(id: string): Promise<Department> {
    const { department } = await departmentsService.getDepartment(id);
    return department;
  },

  async create(data: CreateDepartmentRequest): Promise<Department> {
    const { department } = await departmentsService.createDepartment(data);
    return department;
  },

  async update(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const { department } = await departmentsService.updateDepartment(id, data);
    return department;
  },

  async delete(id: string): Promise<void> {
    await departmentsService.deleteDepartment(id);
  },
};

export type { DepartmentResponse, DepartmentsResponse, ListDepartmentsParams };
