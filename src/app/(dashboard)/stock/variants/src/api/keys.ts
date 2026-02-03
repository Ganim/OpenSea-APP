/**
 * OpenSea OS - Variants Query Keys
 */

export interface VariantFilters {
  productId?: string;
  search?: string;
}

export const variantKeys = {
  all: ['variants'] as const,
  lists: () => [...variantKeys.all, 'list'] as const,
  list: (filters?: VariantFilters) =>
    [...variantKeys.lists(), filters ?? {}] as const,
  details: () => [...variantKeys.all, 'detail'] as const,
  detail: (id: string) => [...variantKeys.details(), id] as const,

  // Related queries
  byProduct: (productId: string) =>
    [...variantKeys.all, 'by-product', productId] as const,
  items: (variantId: string) =>
    [...variantKeys.detail(variantId), 'items'] as const,
  stock: (variantId: string) =>
    [...variantKeys.detail(variantId), 'stock'] as const,
} as const;

type VariantKeyFunctions = {
  [K in keyof typeof variantKeys]: (typeof variantKeys)[K] extends (
    ...args: infer _Args
  ) => infer R
    ? R
    : (typeof variantKeys)[K];
};

export type VariantQueryKey = VariantKeyFunctions[keyof VariantKeyFunctions];

export default variantKeys;
