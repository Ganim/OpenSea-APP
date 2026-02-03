/**
 * OpenSea OS - List Variants Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { variantsService } from '@/services/stock/variants.service';
import type { Variant } from '@/types/stock';
import { variantKeys, type VariantFilters } from './keys';

export type ListVariantsParams = VariantFilters;

export interface ListVariantsResponse {
  variants: Variant[];
  total: number;
}

export type ListVariantsOptions = Omit<
  UseQueryOptions<ListVariantsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListVariants(
  params?: ListVariantsParams,
  options?: ListVariantsOptions
) {
  return useQuery({
    queryKey: variantKeys.list(params),

    queryFn: async (): Promise<ListVariantsResponse> => {
      const response = await variantsService.listVariants(params?.productId);

      let variants = response.variants ?? [];

      // Filter by search if provided
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        variants = variants.filter(
          v =>
            v.name?.toLowerCase().includes(searchLower) ||
            v.sku?.toLowerCase().includes(searchLower) ||
            v.barcode?.toLowerCase().includes(searchLower)
        );
      }

      return {
        variants,
        total: variants.length,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListVariants;
