/**
 * Absence Types
 * Tipos para ausências e licenças
 */

export type AbsenceType =
  | 'VACATION'
  | 'SICK_LEAVE'
  | 'PERSONAL_LEAVE'
  | 'MATERNITY_LEAVE'
  | 'PATERNITY_LEAVE'
  | 'BEREAVEMENT_LEAVE'
  | 'WEDDING_LEAVE'
  | 'MEDICAL_APPOINTMENT'
  | 'JURY_DUTY'
  | 'UNPAID_LEAVE'
  | 'OTHER';

export type AbsenceStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface Absence {
  id: string;
  tenantId: string;
  employeeId: string;
  type: AbsenceType;
  status: AbsenceStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string | null;
  documentUrl?: string | null;
  cid?: string | null;
  isPaid: boolean;
  requestedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestVacationAbsenceData {
  employeeId: string;
  vacationPeriodId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface RequestSickLeaveData {
  employeeId: string;
  startDate: string;
  endDate: string;
  cid: string;
  documentUrl?: string;
  reason: string;
}

export interface RejectAbsenceData {
  reason: string;
}
