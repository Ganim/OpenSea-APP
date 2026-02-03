import { positionsService } from '@/services/hr';
import type {
  CreatePositionRequest,
  ListPositionsParams,
  PositionResponse,
  PositionsResponse,
  UpdatePositionRequest,
} from '@/services/hr/positions.service';
import type { Position } from '@/types/hr';

export const positionsApi = {
  async list(params?: ListPositionsParams): Promise<PositionsResponse> {
    return positionsService.listPositions(params);
  },

  async get(id: string): Promise<Position> {
    const { position } = await positionsService.getPosition(id);
    return position;
  },

  async create(data: CreatePositionRequest): Promise<Position> {
    const { position } = await positionsService.createPosition(data);
    return position;
  },

  async update(id: string, data: UpdatePositionRequest): Promise<Position> {
    const { position } = await positionsService.updatePosition(id, data);
    return position;
  },

  async delete(id: string): Promise<void> {
    await positionsService.deletePosition(id);
  },
};

export type { ListPositionsParams, PositionResponse, PositionsResponse };
