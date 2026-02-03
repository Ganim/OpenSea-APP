/**
 * OpenSea OS - Product Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/stock/products.service';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/stock';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { productKeys } from './keys';

/* ===========================================
   CREATE PRODUCT
   =========================================== */

export type CreateProductData = CreateProductRequest;

export interface CreateProductOptions {
  onSuccess?: (product: Product) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useCreateProduct(options: CreateProductOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (data: CreateProductData): Promise<Product> => {
      const response = await productsService.createProduct(data);
      return response.product;
    },

    onSuccess: product => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      if (product.templateId) {
        queryClient.invalidateQueries({
          queryKey: productKeys.byTemplate(product.templateId),
        });
      }

      if (showSuccessToast) {
        toast.success(`Produto "${product.name}" criado com sucesso!`);
      }

      onSuccess?.(product);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE PRODUCT
   =========================================== */

export interface UpdateProductVariables {
  id: string;
  data: UpdateProductRequest;
}

export interface UpdateProductOptions {
  onSuccess?: (product: Product) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useUpdateProduct(options: UpdateProductOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: UpdateProductVariables): Promise<Product> => {
      const response = await productsService.updateProduct(id, data);
      return response.product;
    },

    onSuccess: (product, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });

      if (product.templateId) {
        queryClient.invalidateQueries({
          queryKey: productKeys.byTemplate(product.templateId),
        });
      }

      if (showSuccessToast) {
        toast.success(`Produto "${product.name}" atualizado!`);
      }

      onSuccess?.(product);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   DELETE PRODUCT
   =========================================== */

export interface DeleteProductOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useDeleteProduct(options: DeleteProductOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await productsService.deleteProduct(id);
    },

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });

      if (showSuccessToast) {
        toast.success('Produto excluído com sucesso!');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}
