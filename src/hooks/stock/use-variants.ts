import { variantsService } from '@/services/stock';
import type { CreateVariantRequest, UpdateVariantRequest } from '@/types/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
  VARIANTS: ['variants'],
  VARIANT: (id: string) => ['variants', id],
} as const;

// GET /v1/variants - Lista todas as variantes
export function useVariants() {
  return useQuery({
    queryKey: QUERY_KEYS.VARIANTS,
    queryFn: () => variantsService.listVariants(),
  });
}

// GET /v1/variants?productId=:productId - Lista variantes de um produto
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ['variants', 'product', productId],
    queryFn: () => variantsService.listVariants(productId),
    enabled: !!productId,
  });
}

// GET /v1/variants/:id - Busca uma variante específica
export function useVariant(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.VARIANT(id),
    queryFn: () => variantsService.getVariant(id),
    enabled: !!id,
  });
}

// POST /v1/variants - Cria uma nova variante
export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantRequest) =>
      variantsService.createVariant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VARIANTS });
    },
  });
}

// PATCH /v1/variants/:id - Atualiza uma variante
export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVariantRequest }) =>
      variantsService.updateVariant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VARIANTS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VARIANT(variables.id),
      });
    },
  });
}

// DELETE /v1/variants/:id - Deleta uma variante
export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => variantsService.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VARIANTS });
    },
  });
}
