/**
 * OpenSea OS - OKRs API (HR)
 */

import { okrsService } from '@/services/hr/okrs.service';
import type {
  CreateObjectiveData,
  UpdateObjectiveData,
  CreateKeyResultData,
  CreateCheckInData,
} from '@/types/hr';
import type { OkrFilters } from './keys';

export const okrsApi = {
  list: (params?: OkrFilters) =>
    okrsService.listObjectives({
      ownerId: params?.ownerId,
      parentId: params?.parentId,
      level: params?.level || undefined,
      status: params?.status || undefined,
      period: params?.period || undefined,
      page: params?.page,
      perPage: params?.perPage ?? 20,
    }),

  get: (id: string) => okrsService.getObjective(id),

  create: (data: CreateObjectiveData) => okrsService.createObjective(data),

  update: (id: string, data: UpdateObjectiveData) =>
    okrsService.updateObjective(id, data),

  delete: (id: string) => okrsService.deleteObjective(id),

  createKeyResult: (objectiveId: string, data: CreateKeyResultData) =>
    okrsService.createKeyResult(objectiveId, data),

  checkIn: (keyResultId: string, data: CreateCheckInData) =>
    okrsService.checkInKeyResult(keyResultId, data),
};

export default okrsApi;
