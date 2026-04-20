/**
 * OpenSea OS — Kiosk Service
 *
 * Thin client for the kiosk-specific HTTP calls:
 *
 * - `POST /v1/hr/punch/clock`  (device-token auth via `x-punch-device-token`)
 *   → submits a punch with qrToken / pin+matricula / faceEmbedding + liveness
 * - `GET  /v1/hr/punch-devices` (admin JWT auth, used during /kiosk/setup)
 *   → lists KIOSK_PUBLIC devices so an admin can pick one to pair
 * - `POST /v1/hr/punch-devices/:id/pair` (admin JWT auth)
 *   → exchanges a TOTP pairing code for a long-lived `deviceToken`
 *
 * The runtime pattern: the punch endpoint is called with the kiosk device
 * token *only*, never a user JWT. The list + pair endpoints are called by
 * the admin from their browser during setup (they carry the admin JWT via
 * `apiClient`'s default header injection).
 *
 * Phase 5 — Plan 05-10.
 */

import { apiClient } from '@/lib/api-client';
import { apiConfig } from '@/config/api';
import { ApiError } from '@/lib/api-client.types';

/** LocalStorage key for the paired kiosk device token. */
export const KIOSK_DEVICE_TOKEN_KEY = 'kioskDeviceToken';
/** LocalStorage key for the paired kiosk display name (UX only). */
export const KIOSK_DEVICE_NAME_KEY = 'kioskDeviceName';

/* ---------- /kiosk/setup — admin-authenticated endpoints ---------- */

export interface KioskDeviceListItem {
  id: string;
  displayName: string;
  hostname: string | null;
  deviceKind: string;
  status?: string;
}

/**
 * List KIOSK_PUBLIC devices available for pairing. Admin JWT required.
 * Backend query: `deviceKind=KIOSK_PUBLIC&includeRevoked=false`.
 */
export async function listKioskDevices(): Promise<KioskDeviceListItem[]> {
  const res = await apiClient.get<{
    items: KioskDeviceListItem[];
    total: number;
  }>('/v1/hr/punch-devices', {
    params: { deviceKind: 'KIOSK_PUBLIC', includeRevoked: 'false' },
  });
  return res.items;
}

export interface PairKioskResponse {
  deviceToken: string;
  deviceId: string;
  deviceName: string;
}

/**
 * Pair a kiosk device. Trades a 6-digit TOTP pairing code for a long-lived
 * device token (Phase 4 endpoint). Admin JWT required — the backend also
 * asserts the code is valid for the given `deviceId`.
 */
export async function pairKioskDevice(
  deviceId: string,
  pairingCode: string
): Promise<PairKioskResponse> {
  const hostname =
    typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  return apiClient.post<PairKioskResponse>(
    `/v1/hr/punch-devices/${deviceId}/pair`,
    { pairingCode, hostname }
  );
}

/* ---------- /kiosk — device-token-authenticated endpoint ---------- */

export interface KioskPunchBody {
  qrToken?: string;
  pin?: string;
  matricula?: string;
  faceEmbedding?: number[];
  liveness?: {
    blinkDetected: boolean;
    trackingFrames: number;
    durationMs: number;
  };
  requestId: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Minimal TimeEntry DTO shape the kiosk consumes (stay loose — we only
 * render a subset).
 */
export interface KioskPunchResponse {
  timeEntry?: {
    id: string;
    entryType?: string;
    occurredAt?: string;
  };
  approval?: {
    id: string;
    reason: string;
  } | null;
  // Some controller responses are flat — tolerate both shapes.
  id?: string;
  entryType?: string;
  occurredAt?: string;
}

/**
 * POST /v1/hr/punch/clock with the kiosk device token.
 *
 * This call bypasses `apiClient` for the Authorization header — the kiosk
 * is NOT a user session, it authenticates by `x-punch-device-token`. We
 * also avoid setting the normal `credentials: 'include'` cookie path so a
 * stale admin cookie (from /kiosk/setup on the same browser) doesn't
 * hitchhike into the punch call.
 */
export async function executeKioskPunch(
  body: KioskPunchBody,
  deviceToken: string
): Promise<KioskPunchResponse> {
  const url = new URL('/v1/hr/punch/clock', apiConfig.baseURL).toString();

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'x-punch-device-token': deviceToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
      attemptsRemaining?: number;
      lockedUntil?: string;
    };
    throw new ApiError(
      data.message ?? `HTTP ${response.status}`,
      response.status,
      data as Record<string, unknown>,
      data.code
    );
  }

  return (await response.json()) as KioskPunchResponse;
}
