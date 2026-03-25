/**
 * Dependant Types
 * Tipos para dependentes de funcionários
 */

export type DependantRelationship =
  | 'SPOUSE'
  | 'CHILD'
  | 'STEPCHILD'
  | 'PARENT'
  | 'OTHER';

export interface EmployeeDependant {
  id: string;
  tenantId: string;
  employeeId: string;
  name: string;
  cpf?: string;
  birthDate: string;
  relationship: DependantRelationship;
  isIrrfDependant: boolean;
  isSalarioFamilia: boolean;
  hasDisability: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDependantData {
  name: string;
  cpf?: string;
  birthDate: string;
  relationship: string;
  isIrrfDependant: boolean;
  isSalarioFamilia: boolean;
  hasDisability: boolean;
}

export interface UpdateDependantData {
  name?: string;
  cpf?: string;
  birthDate?: string;
  relationship?: string;
  isIrrfDependant?: boolean;
  isSalarioFamilia?: boolean;
  hasDisability?: boolean;
}
