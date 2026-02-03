import type { Supplier } from '@/types/stock';

export type SupplierFormData = Partial<Supplier>;

export interface DuplicateSupplierPayload {
  id: string;
  name?: string;
}
