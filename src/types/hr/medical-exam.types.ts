/**
 * Medical Exam Types
 * Tipos para exames médicos ocupacionais
 */

export type MedicalExamType =
  | 'ADMISSIONAL'
  | 'PERIODICO'
  | 'MUDANCA_FUNCAO'
  | 'RETORNO'
  | 'DEMISSIONAL';

export type MedicalExamResult = 'APTO' | 'INAPTO' | 'APTO_COM_RESTRICOES';

export type MedicalExamAptitude = 'APTO' | 'INAPTO' | 'APTO_COM_RESTRICOES';

export type MedicalExamStatus = 'VALID' | 'EXPIRING' | 'EXPIRED';

export interface MedicalExam {
  id: string;
  tenantId: string;
  employeeId: string;
  type: MedicalExamType;
  examDate: string;
  expirationDate?: string;
  doctorName: string;
  doctorCrm: string;
  result: MedicalExamResult;
  observations?: string;
  documentUrl?: string;
  // PCMSO fields
  examCategory?: MedicalExamType;
  validityMonths?: number;
  clinicName?: string;
  clinicAddress?: string;
  physicianName?: string;
  physicianCRM?: string;
  aptitude?: MedicalExamAptitude;
  restrictions?: string;
  nextExamDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalExamData {
  employeeId: string;
  type: MedicalExamType;
  examDate: string;
  expirationDate?: string;
  doctorName: string;
  doctorCrm: string;
  result: MedicalExamResult;
  observations?: string;
  documentUrl?: string;
  // PCMSO fields
  examCategory?: MedicalExamType;
  validityMonths?: number;
  clinicName?: string;
  clinicAddress?: string;
  physicianName?: string;
  physicianCRM?: string;
  aptitude?: MedicalExamAptitude;
  restrictions?: string;
  nextExamDate?: string;
}

export interface UpdateMedicalExamData {
  type?: MedicalExamType;
  examDate?: string;
  expirationDate?: string;
  doctorName?: string;
  doctorCrm?: string;
  result?: MedicalExamResult;
  observations?: string;
  documentUrl?: string;
  // PCMSO fields
  examCategory?: MedicalExamType;
  validityMonths?: number;
  clinicName?: string;
  clinicAddress?: string;
  physicianName?: string;
  physicianCRM?: string;
  aptitude?: MedicalExamAptitude;
  restrictions?: string;
  nextExamDate?: string;
}

export interface OccupationalExamRequirement {
  id: string;
  tenantId: string;
  positionId?: string;
  examType: string;
  examCategory: MedicalExamType;
  frequencyMonths: number;
  isMandatory: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamRequirementData {
  positionId?: string;
  examType: string;
  examCategory: MedicalExamType;
  frequencyMonths: number;
  isMandatory?: boolean;
  description?: string;
}

export interface ComplianceItem {
  requirement: OccupationalExamRequirement;
  latestExam: MedicalExam | null;
  status: 'COMPLIANT' | 'EXPIRING' | 'OVERDUE' | 'MISSING';
  daysUntilExpiry: number | null;
}

export interface EmployeeCompliance {
  employeeId: string;
  complianceItems: ComplianceItem[];
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT';
  totalRequirements: number;
  compliantCount: number;
  expiringCount: number;
  overdueCount: number;
  missingCount: number;
}
