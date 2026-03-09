/**
 * Work Schedule CRUD Operations
 * Funções isoladas para operações de CRUD no módulo de escalas de trabalho
 */

import { logger } from '@/lib/logger';
import type {
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
} from '@/services/hr/work-schedules.service';
import type { WorkSchedule } from '@/types/hr';
import { workSchedulesApi } from '../api';

export async function createWorkSchedule(
  data: Partial<WorkSchedule>
): Promise<WorkSchedule> {
  const createData: CreateWorkScheduleRequest = {
    name: data.name ?? '',
    description: data.description ?? undefined,
    mondayStart: data.mondayStart ?? undefined,
    mondayEnd: data.mondayEnd ?? undefined,
    tuesdayStart: data.tuesdayStart ?? undefined,
    tuesdayEnd: data.tuesdayEnd ?? undefined,
    wednesdayStart: data.wednesdayStart ?? undefined,
    wednesdayEnd: data.wednesdayEnd ?? undefined,
    thursdayStart: data.thursdayStart ?? undefined,
    thursdayEnd: data.thursdayEnd ?? undefined,
    fridayStart: data.fridayStart ?? undefined,
    fridayEnd: data.fridayEnd ?? undefined,
    saturdayStart: data.saturdayStart ?? undefined,
    saturdayEnd: data.saturdayEnd ?? undefined,
    sundayStart: data.sundayStart ?? undefined,
    sundayEnd: data.sundayEnd ?? undefined,
    breakDuration: data.breakDuration ?? 60,
    isActive: data.isActive ?? true,
  };
  return workSchedulesApi.create(createData);
}

export async function updateWorkSchedule(
  id: string,
  data: Partial<WorkSchedule>
): Promise<WorkSchedule> {
  const cleanData: UpdateWorkScheduleRequest = {};

  if (data.name !== undefined) cleanData.name = data.name;
  if (data.description !== undefined) cleanData.description = data.description ?? undefined;
  if (data.mondayStart !== undefined) cleanData.mondayStart = data.mondayStart;
  if (data.mondayEnd !== undefined) cleanData.mondayEnd = data.mondayEnd;
  if (data.tuesdayStart !== undefined)
    cleanData.tuesdayStart = data.tuesdayStart;
  if (data.tuesdayEnd !== undefined) cleanData.tuesdayEnd = data.tuesdayEnd;
  if (data.wednesdayStart !== undefined)
    cleanData.wednesdayStart = data.wednesdayStart;
  if (data.wednesdayEnd !== undefined)
    cleanData.wednesdayEnd = data.wednesdayEnd;
  if (data.thursdayStart !== undefined)
    cleanData.thursdayStart = data.thursdayStart;
  if (data.thursdayEnd !== undefined) cleanData.thursdayEnd = data.thursdayEnd;
  if (data.fridayStart !== undefined) cleanData.fridayStart = data.fridayStart;
  if (data.fridayEnd !== undefined) cleanData.fridayEnd = data.fridayEnd;
  if (data.saturdayStart !== undefined)
    cleanData.saturdayStart = data.saturdayStart;
  if (data.saturdayEnd !== undefined) cleanData.saturdayEnd = data.saturdayEnd;
  if (data.sundayStart !== undefined) cleanData.sundayStart = data.sundayStart;
  if (data.sundayEnd !== undefined) cleanData.sundayEnd = data.sundayEnd;
  if (data.breakDuration !== undefined)
    cleanData.breakDuration = data.breakDuration;
  if (data.isActive !== undefined) cleanData.isActive = data.isActive;

  return workSchedulesApi.update(id, cleanData);
}

export async function deleteWorkSchedule(id: string): Promise<void> {
  return workSchedulesApi.delete(id);
}

export async function duplicateWorkSchedule(
  id: string,
  data?: Partial<WorkSchedule>
): Promise<WorkSchedule> {
  const original = await workSchedulesApi.get(id);

  const duplicateData: CreateWorkScheduleRequest = {
    name: data?.name || `${original.name} (cópia)`,
    description: original.description ?? undefined,
    mondayStart: original.mondayStart ?? undefined,
    mondayEnd: original.mondayEnd ?? undefined,
    tuesdayStart: original.tuesdayStart ?? undefined,
    tuesdayEnd: original.tuesdayEnd ?? undefined,
    wednesdayStart: original.wednesdayStart ?? undefined,
    wednesdayEnd: original.wednesdayEnd ?? undefined,
    thursdayStart: original.thursdayStart ?? undefined,
    thursdayEnd: original.thursdayEnd ?? undefined,
    fridayStart: original.fridayStart ?? undefined,
    fridayEnd: original.fridayEnd ?? undefined,
    saturdayStart: original.saturdayStart ?? undefined,
    saturdayEnd: original.saturdayEnd ?? undefined,
    sundayStart: original.sundayStart ?? undefined,
    sundayEnd: original.sundayEnd ?? undefined,
    breakDuration: original.breakDuration,
    isActive: original.isActive,
  };

  try {
    return workSchedulesApi.create(duplicateData);
  } catch (error) {
    logger.error(
      '[WorkSchedules] Duplication failed',
      error instanceof Error ? error : undefined,
      { originalId: id }
    );
    throw error;
  }
}
