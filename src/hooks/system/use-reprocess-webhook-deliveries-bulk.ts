import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { webhooksService } from '@/services/system/webhooks-service';
import { WEBHOOKS_QUERY_KEYS } from './use-webhooks';

/**
 * Reenvia entregas em lote (D-20). Backend retorna agregação por motivo
 * (enqueued / skippedCooldown / skippedCap / skippedNotFound / errors).
 */
export function useReprocessWebhookDeliveriesBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      webhookId,
      deliveryIds,
    }: {
      webhookId: string;
      deliveryIds: string[];
    }) => webhooksService.reprocessDeliveriesBulk(webhookId, deliveryIds),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: WEBHOOKS_QUERY_KEYS.deliveries(variables.webhookId),
      });
      const parts: string[] = [];
      parts.push(`${data.enqueued} reenvios enfileirados`);
      if (data.skippedCooldown.length > 0)
        parts.push(`${data.skippedCooldown.length} em cooldown`);
      if (data.skippedCap.length > 0)
        parts.push(`${data.skippedCap.length} no cap`);
      if (data.skippedNotFound.length > 0)
        parts.push(`${data.skippedNotFound.length} não encontradas`);
      if (data.errors.length > 0) parts.push(`${data.errors.length} com erro`);
      toast.success(parts.join(', ') + '.');
    },
    onError: () => {
      toast.error('Erro ao reenviar entregas em lote.');
    },
  });
}
