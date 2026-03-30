/**
 * Shift Types
 * Tipos para turnos de trabalho
 */

export type ShiftType = 'FIXED' | 'ROTATING' | 'FLEXIBLE' | 'ON_CALL';

export interface Shift {
  id: string;
  name: string;
  code: string | null;
  type: ShiftType;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isNightShift: boolean;
  color: string | null;
  isActive: boolean;
  durationHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftData {
  name: string;
  code?: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  isNightShift?: boolean;
  color?: string;
}

export interface UpdateShiftData {
  name?: string;
  code?: string | null;
  type?: ShiftType;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  isNightShift?: boolean;
  color?: string | null;
  isActive?: boolean;
}

export interface AssignEmployeeToShiftData {
  employeeId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface TransferEmployeeShiftData {
  employeeId: string;
  newShiftId: string;
  startDate: string;
  notes?: string;
}
