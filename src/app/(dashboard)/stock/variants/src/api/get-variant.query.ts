/**
 * OpenSea OS - Get Variant Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { variantsService } from '@/services/stock/variants.service';
import type { Variant } from '@/types/stock';
import { variantKeys } from './keys';

export type GetVariantOptions = Omit<
  UseQueryOptions<Variant, Error>,
  'queryKey' | 'queryFn'
>;

export function useGetVariant(id: string, options?: GetVariantOptions) {
  return useQuery({
    queryKey: variantKeys.detail(id),

    queryFn: async (): Promise<Variant> => {
      const response = await variantsService.getVariant(id);
      return response.variant;
    },

    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export default useGetVariant;
