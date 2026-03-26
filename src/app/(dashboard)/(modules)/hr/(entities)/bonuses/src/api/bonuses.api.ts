import { bonusesService } from '@/services/hr';
import type {
  CreateBonusRequest,
  UpdateBonusRequest,
  BonusResponse,
  BonusesResponse,
  ListBonusesParams,
} from '@/services/hr/bonuses.service';
import type { Bonus } from '@/types/hr';

export const bonusesApi = {
  async list(params?: ListBonusesParams): Promise<BonusesResponse> {
    return bonusesService.list(params);
  },

  async get(id: string): Promise<Bonus> {
    const { bonus } = await bonusesService.get(id);
    return bonus;
  },

  async create(data: CreateBonusRequest): Promise<Bonus> {
    const { bonus } = await bonusesService.create(data);
    return bonus;
  },

  async update(id: string, data: UpdateBonusRequest): Promise<Bonus> {
    const { bonus } = await bonusesService.update(id, data);
    return bonus;
  },

  async delete(id: string): Promise<void> {
    await bonusesService.delete(id);
  },
};

export type { BonusResponse, BonusesResponse, ListBonusesParams };
