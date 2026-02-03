import type { Manufacturer } from '@/types/stock';

export type ManufacturerFormData = Partial<Manufacturer>;

export interface DuplicateManufacturerPayload {
  id: string;
  name?: string;
}
