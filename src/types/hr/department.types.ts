// Department & Position Types

import type { Company } from './company.types';
import type { Employee } from './employee.types';

/**
 * Department
 * Representa um departamento na estrutura organizacional
 */
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  companyId: string;
  company?: Company | null;
  parentId?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Dados enriquecidos da API
  _count?: {
    positions?: number;
    employees?: number;
  };
  positions?: Position[];
  employees?: Employee[];
}

/**
 * CreateDepartmentData
 * Dados para criar um novo departamento
 */
export interface CreateDepartmentData {
  name: string;
  code: string;
  companyId: string;
  description?: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

/**
 * UpdateDepartmentData
 * Dados para atualizar um departamento existente
 */
export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  companyId?: string;
  description?: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

/**
 * Position
 * Representa um cargo na estrutura organizacional
 */
export interface Position {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  departmentId?: string | null;
  department?: Department | null;
  level: number;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Dados enriquecidos da API
  _count?: {
    employees?: number;
  };
  employees?: Employee[];
}

/**
 * CreatePositionData
 * Dados para criar um novo cargo
 */
export interface CreatePositionData {
  name: string;
  code: string;
  description?: string;
  departmentId?: string | null;
  level?: number;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
}

/**
 * UpdatePositionData
 * Dados para atualizar um cargo existente
 */
export interface UpdatePositionData {
  name?: string;
  code?: string;
  description?: string;
  departmentId?: string | null;
  level?: number;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
}
