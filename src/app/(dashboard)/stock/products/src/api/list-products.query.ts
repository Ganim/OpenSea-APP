/**
 * OpenSea OS - List Products Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { productsService } from '@/services/stock/products.service';
import type { Product } from '@/types/stock';
import { productKeys, type ProductFilters } from './keys';

export type ListProductsParams = ProductFilters;

export interface ListProductsResponse {
  products: Product[];
  total: number;
}

export type ListProductsOptions = Omit<
  UseQueryOptions<ListProductsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export function useListProducts(
  params?: ListProductsParams,
  options?: ListProductsOptions
) {
  return useQuery({
    queryKey: productKeys.list(params),

    queryFn: async (): Promise<ListProductsResponse> => {
      const response = await productsService.listProducts(params?.templateId);

      let products = response.products ?? [];

      // Filter by status if provided
      if (params?.status) {
        products = products.filter(p => p.status === params.status);
      }

      // Filter by search if provided
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        products = products.filter(
          p =>
            p.name?.toLowerCase().includes(searchLower) ||
            p.fullCode?.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
        );
      }

      return {
        products,
        total: products.length,
      };
    },

    staleTime: 5 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
}

export default useListProducts;
