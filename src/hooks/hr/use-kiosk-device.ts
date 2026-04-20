'use client';

/**
 * OpenSea OS — Kiosk device pairing hook.
 *
 * Reads the paired `deviceToken` + `deviceName` from localStorage and
 * exposes:
 *   - `isPaired`       — whether we have a token on disk
 *   - `deviceToken`    — the raw token (or `null`)
 *   - `deviceName`     — display name shown in the kiosk header
 *   - `clearPairing()` — wipes both keys (Desvincular flow)
 *   - `setPairing()`   — called by /kiosk/setup on successful TOTP pair
 *
 * SSR-safe: on the server all values are `null` / `false`. The effect
 * re-hydrates on mount.
 *
 * Phase 5 — Plan 05-10 / UI-SPEC §/kiosk/setup.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  KIOSK_DEVICE_NAME_KEY,
  KIOSK_DEVICE_TOKEN_KEY,
} from '@/services/hr/kiosk.service';

export function useKioskDevice() {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDeviceToken(localStorage.getItem(KIOSK_DEVICE_TOKEN_KEY));
    setDeviceName(localStorage.getItem(KIOSK_DEVICE_NAME_KEY));
    setHydrated(true);
  }, []);

  const setPairing = useCallback((token: string, name: string) => {
    localStorage.setItem(KIOSK_DEVICE_TOKEN_KEY, token);
    localStorage.setItem(KIOSK_DEVICE_NAME_KEY, name);
    setDeviceToken(token);
    setDeviceName(name);
  }, []);

  const clearPairing = useCallback(() => {
    localStorage.removeItem(KIOSK_DEVICE_TOKEN_KEY);
    localStorage.removeItem(KIOSK_DEVICE_NAME_KEY);
    setDeviceToken(null);
    setDeviceName(null);
  }, []);

  return {
    /** True once we've read localStorage on the client (avoids SSR mismatch). */
    hydrated,
    isPaired: Boolean(deviceToken),
    deviceToken,
    deviceName,
    setPairing,
    clearPairing,
  } as const;
}
