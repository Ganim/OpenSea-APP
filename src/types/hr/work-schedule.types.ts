/**
 * Work Schedule Types
 * Tipos para escalas de trabalho
 */

export interface WorkSchedule {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  mondayStart?: string | null;
  mondayEnd?: string | null;
  tuesdayStart?: string | null;
  tuesdayEnd?: string | null;
  wednesdayStart?: string | null;
  wednesdayEnd?: string | null;
  thursdayStart?: string | null;
  thursdayEnd?: string | null;
  fridayStart?: string | null;
  fridayEnd?: string | null;
  saturdayStart?: string | null;
  saturdayEnd?: string | null;
  sundayStart?: string | null;
  sundayEnd?: string | null;
  breakDuration: number;
  weeklyHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkScheduleData {
  name: string;
  description?: string;
  mondayStart?: string;
  mondayEnd?: string;
  tuesdayStart?: string;
  tuesdayEnd?: string;
  wednesdayStart?: string;
  wednesdayEnd?: string;
  thursdayStart?: string;
  thursdayEnd?: string;
  fridayStart?: string;
  fridayEnd?: string;
  saturdayStart?: string;
  saturdayEnd?: string;
  sundayStart?: string;
  sundayEnd?: string;
  breakDuration?: number;
  isActive?: boolean;
}

export type UpdateWorkScheduleData = Partial<CreateWorkScheduleData>;
