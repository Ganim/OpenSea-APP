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
 * EmergencyContactInfo
 * Dados de contato de emergência estruturados
 */
export interface EmergencyContactInfo {
  name?: string;
  phone?: string;
  relationship?: string;
}

/**
 * HealthCondition
 * Condição de saúde registrada
 */
export interface HealthCondition {
  description: string;
  requiresAttention: boolean;
}

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

  // Vínculo organizacional
  companyId?: string | null;
  company?: Company | null;
  departmentId?: string | null;
  department?: Department | null;
  positionId?: string | null;
  position?: Position | null;
  supervisorId?: string | null;
  userId?: string | null;

  // Dados pessoais
  socialName?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  pcd: boolean;
  maritalStatus?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  emergencyContactInfo?: EmergencyContactInfo | null;
  healthConditions?: HealthCondition[] | null;

  // Documentos
  rg?: string | null;
  rgIssuer?: string | null;
  rgIssueDate?: string | null;
  pis?: string | null;
  ctpsNumber?: string | null;
  ctpsSeries?: string | null;
  ctpsState?: string | null;
  voterTitle?: string | null;
  militaryDoc?: string | null;

  // Contato
  email?: string | null;
  personalEmail?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;

  // Endereço
  address?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country: string;

  // Dados bancários
  bankCode?: string | null;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  bankAccountType?: string | null;
  pixKey?: string | null;

  // Foto e metadados
  photoUrl?: string | null;
  metadata: Record<string, unknown>;

  // Status
  status?: string;
  terminationDate?: string | null;
  pendingIssues: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * CreateEmployeeData
 * Dados para criar um novo funcionário
 */
export interface CreateEmployeeData {
  // Obrigatórios
  registrationNumber: string;
  fullName: string;
  cpf: string;
  hireDate: string;
  baseSalary: number;
  contractType: ContractType;
  workRegime: WorkRegime;
  weeklyHours: number;

  // Vínculo organizacional
  departmentId?: string | null;
  positionId?: string | null;
  supervisorId?: string | null;
  companyId?: string | null;
  userId?: string;

  // Dados pessoais
  socialName?: string;
  birthDate?: string;
  gender?: string;
  pcd?: boolean;
  maritalStatus?: string;
  nationality?: string;
  birthPlace?: string;
  emergencyContactInfo?: EmergencyContactInfo;
  healthConditions?: HealthCondition[];

  // Documentos
  rg?: string;
  rgIssuer?: string;
  rgIssueDate?: string;
  pis?: string;
  ctpsNumber?: string;
  ctpsSeries?: string;
  ctpsState?: string;
  voterTitle?: string;
  militaryDoc?: string;

  // Contato
  email?: string;
  personalEmail?: string;
  phone?: string;
  mobilePhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Endereço
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Dados bancários
  bankCode?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankAccountType?: string;
  pixKey?: string;

  // Foto e metadados
  photoUrl?: string;
  metadata?: Record<string, unknown>;

  // Status
  status?: string;
  terminationDate?: string;
}

/**
 * UpdateEmployeeData
 * Dados para atualizar um funcionário existente (todos opcionais)
 */
export interface UpdateEmployeeData {
  // Dados base
  registrationNumber?: string;
  fullName?: string;
  cpf?: string;
  hireDate?: string;
  baseSalary?: number;
  contractType?: ContractType;
  workRegime?: WorkRegime;
  weeklyHours?: number;

  // Vínculo organizacional
  departmentId?: string | null;
  positionId?: string | null;
  supervisorId?: string | null;
  companyId?: string | null;
  userId?: string | null;

  // Dados pessoais
  socialName?: string;
  birthDate?: string;
  gender?: string;
  pcd?: boolean;
  maritalStatus?: string;
  nationality?: string;
  birthPlace?: string;
  emergencyContactInfo?: EmergencyContactInfo;
  healthConditions?: HealthCondition[];

  // Documentos
  rg?: string;
  rgIssuer?: string;
  rgIssueDate?: string;
  pis?: string;
  ctpsNumber?: string;
  ctpsSeries?: string;
  ctpsState?: string;
  voterTitle?: string;
  militaryDoc?: string;

  // Contato
  email?: string;
  personalEmail?: string;
  phone?: string;
  mobilePhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Endereço
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Dados bancários
  bankCode?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankAccountType?: string;
  pixKey?: string;

  // Foto e metadados
  photoUrl?: string;
  metadata?: Record<string, unknown>;

  // Status
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
