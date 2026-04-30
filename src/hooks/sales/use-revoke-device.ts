'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revokeDevice } from '@/services/sales/revoke-device.service';

/**
 * Admin-side mutation that calls
 * `DELETE /v1/pos/terminals/:terminalId/device[?force=true]`. Errors are
 * propagated unchanged so the page can branch on `ApiError.status === 409`
 * + `ApiError.data?.requiresForce` to surface the ForceRevokeDialog.
 */
export function useRevokeDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { terminalId: string; force?: boolean }) =>
      revokeDevice(input.terminalId, { force: input.force }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-terminals'] });
    },
  });
}
