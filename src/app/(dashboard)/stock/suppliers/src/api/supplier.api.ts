import { suppliersService } from '@/services/stock/other.service';
import type {
  CreateSupplierRequest,
  Supplier,
  SupplierResponse,
  SuppliersResponse,
  UpdateSupplierRequest,
} from '@/types/stock';

export interface ListSuppliersParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

export const suppliersApi = {
  async list(): Promise<SuppliersResponse> {
    return suppliersService.listSuppliers();
  },

  async get(id: string): Promise<Supplier> {
    const response = await suppliersService.getSupplier(id);

    // Compativel com ambos os formatos: { supplier } ou Supplier direto
    if (response && typeof response === 'object' && 'id' in response) {
      return response as unknown as Supplier;
    }

    if (response && 'supplier' in response && response.supplier) {
      return response.supplier;
    }

    throw new Error('Invalid response format from getSupplier');
  },

  async create(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await suppliersService.createSupplier(data);

    // Compativel com ambos os formatos: { supplier } ou Supplier direto
    if (response && typeof response === 'object' && 'id' in response) {
      return response as unknown as Supplier;
    }

    if (response && 'supplier' in response && response.supplier) {
      return response.supplier;
    }

    throw new Error('Invalid response format from createSupplier');
  },

  async update(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    const response = await suppliersService.updateSupplier(id, data);

    // Compativel com ambos os formatos: { supplier } ou Supplier direto
    if (response && typeof response === 'object' && 'id' in response) {
      return response as unknown as Supplier;
    }

    if (response && 'supplier' in response && response.supplier) {
      return response.supplier;
    }

    throw new Error('Invalid response format from updateSupplier');
  },

  async delete(id: string): Promise<void> {
    await suppliersService.deleteSupplier(id);
  },
};

export type { SupplierResponse };
