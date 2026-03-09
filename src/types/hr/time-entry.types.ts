/**
 * Time Entry Types
 * Tipos para controle de ponto
 */

export type TimeEntryType =
  | 'CLOCK_IN'
  | 'CLOCK_OUT'
  | 'BREAK_START'
  | 'BREAK_END'
  | 'OVERTIME_START'
  | 'OVERTIME_END';

export interface TimeEntry {
  id: string;
  tenantId: string;
  employeeId: string;
  entryType: TimeEntryType;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  ipAddress?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ClockInOutData {
  employeeId: string;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  notes?: string;
}

export interface CalculateWorkedHoursData {
  employeeId: string;
  startDate: string;
  endDate: string;
}

export interface DailyBreakdown {
  date: string;
  workedHours: number;
  breakHours: number;
  overtimeHours: number;
  totalHours: number;
}

export interface WorkedHoursResponse {
  employeeId: string;
  startDate: string;
  endDate: string;
  dailyBreakdown: DailyBreakdown[];
  totalWorkedHours: number;
  totalBreakHours: number;
  totalOvertimeHours: number;
  totalNetHours: number;
}
