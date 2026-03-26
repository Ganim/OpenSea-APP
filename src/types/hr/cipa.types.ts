/**
 * CIPA Types
 * Tipos para Comissão Interna de Prevenção de Acidentes
 */

export type CipaMandateStatus = 'ACTIVE' | 'EXPIRED' | 'DRAFT';

export type CipaMemberRole =
  | 'PRESIDENTE'
  | 'VICE_PRESIDENTE'
  | 'SECRETARIO'
  | 'MEMBRO_TITULAR'
  | 'MEMBRO_SUPLENTE';

export type CipaMemberType = 'EMPREGADOR' | 'EMPREGADO';

export interface CipaMandate {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: CipaMandateStatus;
  electionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CipaMember {
  id: string;
  tenantId: string;
  mandateId: string;
  employeeId: string;
  role: CipaMemberRole;
  type: CipaMemberType;
  isStable: boolean;
  stableUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCipaMandateData {
  name: string;
  startDate: string;
  endDate: string;
  status?: CipaMandateStatus;
  electionDate?: string;
  notes?: string;
}

export interface UpdateCipaMandateData {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: CipaMandateStatus;
  electionDate?: string;
  notes?: string;
}

export interface CreateCipaMemberData {
  employeeId: string;
  role: CipaMemberRole;
  type: CipaMemberType;
  isStable?: boolean;
  stableUntil?: string;
}

export interface UpdateCipaMemberData {
  role?: CipaMemberRole;
  type?: CipaMemberType;
  isStable?: boolean;
  stableUntil?: string;
}
