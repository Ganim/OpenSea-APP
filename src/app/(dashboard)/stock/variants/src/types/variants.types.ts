import type { Variant } from '@/types/stock';

export interface VariantFormData {
  productId: string;
  sku: string;
  name?: string;
  attributes?: Record<string, unknown>;
  tags?: string[];
  manufacturerId?: string;
  supplierId?: string;
}

export type { Variant };
