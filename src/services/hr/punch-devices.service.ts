/**
 * OpenSea OS - Punch Devices Service
 *
 * Cliente HTTP para CRUD de dispositivos de ponto (kiosks Horus, PWAs
 * pessoais, leitores biométricos, WebAuthn PCs).
 *
 * Flow de pareamento:
 *   1. POST /v1/hr/punch-devices  → cria device, retorna { deviceId, pairingSecret(64 hex) one-time }
 *   2. GET  /v1/hr/punch-devices/:id/pairing-code → retorna { code(6 chars), expiresAt(ISO) }
 *   3. Admin diz o código de 6 chars pro Horus client
 *   4. Horus client envia pair-public ao backend; backend resolve via cross-tenant lookup
 */

import { apiClient } from '@/lib/api-client';

export type PunchDeviceKind =
  | 'PWA_PERSONAL'
  | 'KIOSK_PUBLIC'
  | 'BIOMETRIC_READER'
  | 'WEBAUTHN_PC';

export interface RegisterPunchDeviceInput {
  name: string;
  deviceKind: PunchDeviceKind;
  geofenceZoneId?: string;
  allowedEmployeeIds?: string[];
  allowedDepartmentIds?: string[];
}

export interface RegisterPunchDeviceResponse {
  deviceId: string;
  /** 64-hex string returned ONLY here (one-time). */
  pairingSecret: string;
}

export interface GetPairingCodeResponse {
  /** 6-char alphanumeric code, rotates every 60s. */
  code: string;
  /** ISO timestamp when this code becomes invalid. */
  expiresAt: string;
}

export const punchDevicesService = {
  /**
   * POST /v1/hr/punch-devices
   * Permission: hr.punch-devices.register
   */
  async register(
    input: RegisterPunchDeviceInput
  ): Promise<RegisterPunchDeviceResponse> {
    return apiClient.post<RegisterPunchDeviceResponse>(
      '/v1/hr/punch-devices',
      input
    );
  },

  /**
   * GET /v1/hr/punch-devices/:id/pairing-code
   * Permission: hr.punch-devices.admin
   * Backend rotates every 60s; frontend should re-fetch to refresh.
   */
  async getPairingCode(deviceId: string): Promise<GetPairingCodeResponse> {
    return apiClient.get<GetPairingCodeResponse>(
      `/v1/hr/punch-devices/${deviceId}/pairing-code`
    );
  },

  /**
   * DELETE /v1/hr/punch-devices/:id
   * Permission: hr.punch-devices.admin
   */
  async unpair(deviceId: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/punch-devices/${deviceId}/pair`);
  },
};
