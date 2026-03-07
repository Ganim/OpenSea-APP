import { employeesService } from '@/services/hr';
import type {
  CreateEmployeeRequest,
  EmployeeResponse,
  EmployeesResponse,
  ListEmployeesParams,
  UpdateEmployeeRequest,
} from '@/services/hr/employees.service';
import type { Employee } from '@/types/hr';

export interface CreateEmployeeWithUserRequest extends CreateEmployeeRequest {
  permissionGroupId?: string;
  userEmail?: string;
  userPassword?: string;
}

export const employeesApi = {
  async list(params?: ListEmployeesParams): Promise<EmployeesResponse> {
    return employeesService.listEmployees(params);
  },

  async get(id: string): Promise<Employee> {
    const { employee } = await employeesService.getEmployee(id);
    return employee;
  },

  async create(data: CreateEmployeeRequest): Promise<Employee> {
    const { employee } = await employeesService.createEmployee(data);
    return employee;
  },

  async createWithUser(data: CreateEmployeeWithUserRequest): Promise<Employee> {
    const { employee } = await employeesService.createEmployeeWithUser(data);
    return employee;
  },

  async update(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
    const { employee } = await employeesService.updateEmployee(id, data);
    return employee;
  },

  async delete(id: string): Promise<void> {
    await employeesService.deleteEmployee(id);
  },

  async createUserForEmployee(
    id: string,
    data: {
      email: string;
      password: string;
      permissionGroupId: string;
    }
  ): Promise<Employee> {
    const { employee } = await employeesService.createUserForEmployee(id, data);
    return employee;
  },
};

export type { EmployeeResponse, EmployeesResponse, ListEmployeesParams };
