/**
 * OpenSea OS - Variant Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { variantsService } from '@/services/stock/variants.service';
import type {
  Variant,
  CreateVariantRequest,
  UpdateVariantRequest,
} from '@/types/stock';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { variantKeys } from './keys';

// Product keys - defined locally to avoid cross-module imports
const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  variants: (productId: string) =>
    [...productKeys.all, 'detail', productId, 'variants'] as const,
};

/* ===========================================
   CREATE VARIANT
   =========================================== */

export type CreateVariantData = CreateVariantRequest;

export interface CreateVariantOptions {
  onSuccess?: (variant: Variant) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useCreateVariant(options: CreateVariantOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (data: CreateVariantData): Promise<Variant> => {
      const response = await variantsService.createVariant(data);
      return response.variant;
    },

    onSuccess: variant => {
      queryClient.invalidateQueries({ queryKey: variantKeys.lists() });

      // Also invalidate product variants
      if (variant.productId) {
        queryClient.invalidateQueries({
          queryKey: variantKeys.byProduct(variant.productId),
        });
        queryClient.invalidateQueries({
          queryKey: productKeys.variants(variant.productId),
        });
      }

      if (showSuccessToast) {
        toast.success(`Variante "${variant.name}" criada com sucesso!`);
      }

      onSuccess?.(variant);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE VARIANT
   =========================================== */

export interface UpdateVariantVariables {
  id: string;
  data: UpdateVariantRequest;
}

export interface UpdateVariantOptions {
  onSuccess?: (variant: Variant) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useUpdateVariant(options: UpdateVariantOptions = {}) {
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
    }: UpdateVariantVariables): Promise<Variant> => {
      const response = await variantsService.updateVariant(id, data);
      return response.variant;
    },

    onSuccess: (variant, { id }) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: variantKeys.detail(id) });

      if (variant.productId) {
        queryClient.invalidateQueries({
          queryKey: variantKeys.byProduct(variant.productId),
        });
        queryClient.invalidateQueries({
          queryKey: productKeys.variants(variant.productId),
        });
      }

      if (showSuccessToast) {
        toast.success(`Variante "${variant.name}" atualizada!`);
      }

      onSuccess?.(variant);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   DELETE VARIANT
   =========================================== */

export interface DeleteVariantVariables {
  id: string;
  productId?: string;
}

export interface DeleteVariantOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useDeleteVariant(options: DeleteVariantOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({ id }: DeleteVariantVariables): Promise<void> => {
      await variantsService.deleteVariant(id);
    },

    onSuccess: (_, { id, productId }) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.lists() });
      queryClient.removeQueries({ queryKey: variantKeys.detail(id) });

      if (productId) {
        queryClient.invalidateQueries({
          queryKey: variantKeys.byProduct(productId),
        });
        queryClient.invalidateQueries({
          queryKey: productKeys.variants(productId),
        });
      }

      if (showSuccessToast) {
        toast.success('Variante excluída com sucesso!');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}
