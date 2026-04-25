import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { posService } from '@/services/sales/pos.service';
import type { UpdateTerminalSessionModeRequest } from '@/types/sales';

/**
 * Mutation for updating the operator session mode + coordination on a POS
 * Terminal (Emporion Fase 1). Backed by
 * `PATCH /v1/pos/terminals/:terminalId/config`.
 */
export function useUpdateTerminalSessionMode(terminalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTerminalSessionModeRequest) =>
      posService.updateSessionMode(terminalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
      queryClient.invalidateQueries({ queryKey: ['pos-terminal', terminalId] });
      toast.success('Configuração do terminal atualizada.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar a configuração do terminal.';
      toast.error(message);
    },
  });
}
