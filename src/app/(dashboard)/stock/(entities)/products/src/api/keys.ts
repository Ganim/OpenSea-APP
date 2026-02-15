/**
 * OpenSea OS - Products Query Keys
 */

import type { ProductStatus } from '@/types/stock';

export interface ProductFilters {
  templateId?: string;
  status?: ProductStatus;
  search?: string;
  supplierId?: string;
  manufacturerId?: string;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) =>
    [...productKeys.lists(), filters ?? {}] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,

  // Related queries
  byTemplate: (templateId: string) =>
    [...productKeys.all, 'by-template', templateId] as const,
  variants: (productId: string) =>
    [...productKeys.detail(productId), 'variants'] as const,
} as const;

type ProductKeyFunctions = {
  [K in keyof typeof productKeys]: (typeof productKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof productKeys)[K];
};

export type ProductQueryKey = ProductKeyFunctions[keyof ProductKeyFunctions];

export default productKeys;
