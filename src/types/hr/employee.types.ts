// Employee Types

import type { Company } from './company.types';
import type { Department, Position } from './department.types';

/**
 * ContractType
 * Tipos de contrato de trabalho
 */
export type ContractType = 'CLT' | 'PJ' | 'INTERN' | 'TEMPORARY' | 'APPRENTICE';

/**
 * WorkRegime
 * Regimes de trabalho
 */
export type WorkRegime =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'HOURLY'
  | 'SHIFT'
  | 'FLEXIBLE';

/**
 * Employee
 * Representa um funcionário na organização
 */
export interface Employee {
  id: string;
  registrationNumber: string;
  fullName: string;
  cpf: string;
  hireDate: string;
  baseSalary: number;
  contractType: ContractType;
  workRegime: WorkRegime;
  weeklyHours: number;
  companyId?: string | null;
  company?: Company | null;
  departmentId?: string | null;
  department?: Department | null;
  positionId?: string | null;
  position?: Position | null;
  supervisorId?: string | null;
  userId?: string | null;
  socialName?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  rg?: string | null;
  rgIssuer?: string | null;
  rgIssueDate?: string | null;
  pis?: string | null;
  ctpsNumber?: string | null;
  ctpsSeries?: string | null;
  ctpsState?: string | null;
  status?: string;
  terminationDate?: string | null;
  pendingIssues?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * CreateEmployeeData
 * Dados para criar um novo funcionário
 */
export interface CreateEmployeeData {
  registrationNumber: string;
  fullName: string;
  cpf: string;
  hireDate: string;
  baseSalary: number;
  contractType: ContractType;
  workRegime: WorkRegime;
  weeklyHours: number;
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
  companyId?: string | null;
  status?: string;
  terminationDate?: string;
}

/**
 * UpdateEmployeeData
 * Dados para atualizar um funcionário existente
 */
export interface UpdateEmployeeData {
  registrationNumber?: string;
  fullName?: string;
  cpf?: string;
  hireDate?: string;
  baseSalary?: number;
  contractType?: ContractType;
  workRegime?: WorkRegime;
  weeklyHours?: number;
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
  companyId?: string | null;
  status?: string;
  terminationDate?: string;
}

// ----------------------------------------------------------------------------
// Employee Label Data (for print queue / label system)
// ----------------------------------------------------------------------------

export interface EmployeeLabelData {
  employee: {
    id: string;
    registrationNumber: string;
    fullName: string;
    socialName: string | null;
    cpf: string;
    hireDate: string;
    status: string;
    photoUrl: string | null;
  };
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
  company: { id: string; name: string; cnpj: string | null } | null;
  tenant: { id: string; name: string };
}

export interface EmployeeLabelDataResponse {
  labelData: EmployeeLabelData[];
}
