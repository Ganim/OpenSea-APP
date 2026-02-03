import { manufacturersService } from '@/services/stock/other.service';
import type {
  CreateManufacturerRequest,
  Manufacturer,
  ManufacturerResponse,
  ManufacturersResponse,
  UpdateManufacturerRequest,
} from '@/types/stock';

export interface ListManufacturersParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

export const manufacturersApi = {
  async list(): Promise<ManufacturersResponse> {
    return manufacturersService.listManufacturers();
  },

  async get(id: string): Promise<Manufacturer> {
    const response = await manufacturersService.getManufacturer(id);

    // Compatível com ambos os formatos: { manufacturer } ou Manufacturer direto
    if (response && typeof response === 'object' && 'id' in response) {
      return response as unknown as Manufacturer;
    }

    if (response && 'manufacturer' in response && response.manufacturer) {
      return response.manufacturer;
    }

    throw new Error('Invalid response format from getManufacturer');
  },

  async create(data: CreateManufacturerRequest): Promise<Manufacturer> {
    const response = await manufacturersService.createManufacturer(data);

    // Compatível com ambos os formatos: { manufacturer } ou Manufacturer direto
    if (response && typeof response === 'object' && 'id' in response) {
      return response as unknown as Manufacturer;
    }

    if (response && 'manufacturer' in response && response.manufacturer) {
      return response.manufacturer;
    }

    throw new Error('Invalid response format from createManufacturer');
  },

  async update(
    id: string,
    data: UpdateManufacturerRequest
  ): Promise<Manufacturer> {
    const response = await manufacturersService.updateManufacturer(id, data);

    // Compatível com ambos os formatos: { manufacturer } ou Manufacturer direto
    if (response && typeof response === 'object' && 'id' in response) {
      return response as unknown as Manufacturer;
    }

    if (response && 'manufacturer' in response && response.manufacturer) {
      return response.manufacturer;
    }

    throw new Error('Invalid response format from updateManufacturer');
  },

  async delete(id: string): Promise<void> {
    await manufacturersService.deleteManufacturer(id);
  },
};

export type { ManufacturerResponse };
