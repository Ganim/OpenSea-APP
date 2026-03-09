/**
 * Vacation Period Types
 * Tipos para períodos de férias
 */

export type VacationStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'SOLD';

export interface VacationPeriod {
  id: string;
  tenantId: string;
  employeeId: string;
  acquisitionStart: string;
  acquisitionEnd: string;
  concessionStart: string;
  concessionEnd: string;
  totalDays: number;
  usedDays: number;
  soldDays: number;
  remainingDays: number;
  status: VacationStatus;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVacationPeriodData {
  employeeId: string;
  acquisitionStart: string;
  acquisitionEnd: string;
  concessionStart: string;
  concessionEnd: string;
  totalDays?: number;
  notes?: string;
}

export interface ScheduleVacationData {
  startDate: string;
  endDate: string;
  days: number;
}

export interface CompleteVacationData {
  daysUsed: number;
}

export interface SellVacationDaysData {
  daysToSell: number;
}

export interface VacationBalancePeriod {
  acquisitionPeriod: string;
  concessionDeadline: string;
  totalDays: number;
  usedDays: number;
  soldDays: number;
  remainingDays: number;
  status: VacationStatus;
  isExpired: boolean;
  daysUntilExpiration: number;
}

export interface VacationBalance {
  employeeId: string;
  employeeName: string;
  totalAvailableDays: number;
  totalUsedDays: number;
  totalSoldDays: number;
  periods: VacationBalancePeriod[];
}
