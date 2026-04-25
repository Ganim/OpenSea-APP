import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { posFiscalConfigService } from '@/services/sales/pos-fiscal-config.service';
import type { UpdatePosFiscalConfigRequest } from '@/types/sales';

const KEY = ['pos-fiscal-config'] as const;

/**
 * Reads the per-tenant POS fiscal configuration (Emporion Fase 1). Returns
 * `null` inside the response when the tenant has not configured the fiscal
 * subsystem yet — used by the page to render a first-time setup state.
 */
export function usePosFiscalConfig() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => posFiscalConfigService.get(),
  });
}

/**
 * Updates the per-tenant POS fiscal configuration (Emporion Fase 1).
 */
export function useUpdatePosFiscalConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePosFiscalConfigRequest) =>
      posFiscalConfigService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success('Configuração fiscal atualizada.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar configuração fiscal.';
      toast.error(message);
    },
  });
}
