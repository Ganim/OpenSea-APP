import { apiClient } from '@/lib/api-client';
import type {
  AssignTerminalZoneResponse,
  ListTerminalZonesResponse,
  PosZoneTier,
} from '@/types/sales';

/**
 * Service for `POS Terminal ↔ Zone` links (Emporion Fase 1).
 *
 * The OpenSea-API exposes:
 *   - `PUT    /v1/pos/terminals/:terminalId/zones/:zoneId`  → assign / re-tier
 *   - `DELETE /v1/pos/terminals/:terminalId/zones/:zoneId`  → unassign
 *
 * The list endpoint (`GET /v1/pos/terminals/:terminalId/zones`) is consumed
 * by the RP web "Zonas" tab. If the backend has not yet shipped it, the
 * React Query layer will surface a clear error state instead of silently
 * rendering empty data.
 */
export const posTerminalZonesService = {
  async list(terminalId: string): Promise<ListTerminalZonesResponse> {
    return apiClient.get<ListTerminalZonesResponse>(
      `/v1/pos/terminals/${terminalId}/zones`
    );
  },

  async assign(
    terminalId: string,
    zoneId: string,
    tier: PosZoneTier
  ): Promise<AssignTerminalZoneResponse> {
    return apiClient.put<AssignTerminalZoneResponse>(
      `/v1/pos/terminals/${terminalId}/zones/${zoneId}`,
      { tier }
    );
  },

  async remove(terminalId: string, zoneId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/pos/terminals/${terminalId}/zones/${zoneId}`
    );
  },
};
