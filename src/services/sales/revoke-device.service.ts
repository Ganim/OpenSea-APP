import { apiClient } from '@/lib/api-client';

export interface RevokeDeviceResponse {
  status: 'revoked' | 'already-revoked';
  reason?: 'admin-revoked' | 'force-revoked';
  abandonedSessionId?: string;
}

/**
 * Shape returned by the backend in the body of a 409 response when a
 * paired terminal still has an open POS session. The caller (mutation
 * hook) inspects the rejected `ApiError`'s `status` and `data` fields:
 *
 *   try {
 *     await revokeDevice(id);
 *   } catch (err) {
 *     if (err instanceof ApiError && err.status === 409 && err.data?.requiresForce) {
 *       // open ForceRevokeDialog using err.data.openSessionId
 *     }
 *   }
 */
export interface RevokeDeviceConflictData {
  requiresForce: true;
  openSessionId: string;
}

/**
 * `DELETE /v1/pos/terminals/:terminalId/device` — admin-side revoke for a
 * paired POS device. Pass `{ force: true }` to discard an open POS session
 * (after the user confirms via PIN).
 */
export async function revokeDevice(
  terminalId: string,
  options: { force?: boolean } = {}
): Promise<RevokeDeviceResponse> {
  const force = options.force ? '?force=true' : '';
  return apiClient.delete<RevokeDeviceResponse>(
    `/v1/pos/terminals/${terminalId}/device${force}`
  );
}
