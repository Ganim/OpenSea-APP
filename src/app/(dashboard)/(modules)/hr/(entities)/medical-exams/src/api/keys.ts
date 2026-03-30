/**
 * OpenSea OS - Medical Exams Query Keys
 */

import type { MedicalExamStatus } from '@/types/hr';

export interface MedicalExamFilters {
  employeeId?: string;
  type?: string;
  result?: string;
  aptitude?: string;
  status?: MedicalExamStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const medicalExamKeys = {
  all: ['medical-exams'] as const,
  lists: () => [...medicalExamKeys.all, 'list'] as const,
  list: (filters?: MedicalExamFilters) =>
    [...medicalExamKeys.lists(), filters ?? {}] as const,
  details: () => [...medicalExamKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicalExamKeys.details(), id] as const,
  expiring: (daysThreshold?: number) =>
    [...medicalExamKeys.all, 'expiring', daysThreshold ?? 30] as const,
  overdue: () => [...medicalExamKeys.all, 'overdue'] as const,
  compliance: (employeeId: string) =>
    [...medicalExamKeys.all, 'compliance', employeeId] as const,
  requirements: () => ['exam-requirements'] as const,
  requirementsList: (filters?: Record<string, unknown>) =>
    ['exam-requirements', 'list', filters ?? {}] as const,
} as const;

export default medicalExamKeys;
