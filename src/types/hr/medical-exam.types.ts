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

export type MedicalExamResult =
  | 'APTO'
  | 'INAPTO'
  | 'APTO_COM_RESTRICOES';

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
}
