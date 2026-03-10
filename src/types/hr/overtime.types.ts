/**
 * Overtime Types
 * Tipos para horas extras
 */

export interface Overtime {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
  approved: boolean | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOvertimeData {
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
}

export interface ApproveOvertimeData {
  addToTimeBank?: boolean;
}
