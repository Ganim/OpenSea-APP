import { careService } from '@/services/stock';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook para atualizar as instruções de cuidado de um produto
 */
export function useProductCare(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (careInstructionIds: string[]) => {
      return careService.setProductCare(productId, { careInstructionIds });
    },
    onSuccess: () => {
      // Invalidar cache do produto para refletir as mudanças
      queryClient.invalidateQueries({
        queryKey: ['products', productId],
      });
    },
  });
}
