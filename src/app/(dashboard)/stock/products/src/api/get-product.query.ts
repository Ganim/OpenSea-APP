/**
 * OpenSea OS - Get Product Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { productsService } from '@/services/stock/products.service';
import type { Product } from '@/types/stock';
import { productKeys } from './keys';

export type GetProductOptions = Omit<
  UseQueryOptions<Product, Error>,
  'queryKey' | 'queryFn'
>;

export function useGetProduct(id: string, options?: GetProductOptions) {
  return useQuery({
    queryKey: productKeys.detail(id),

    queryFn: async (): Promise<Product> => {
      const response = await productsService.getProduct(id);
      return response.product;
    },

    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export default useGetProduct;
