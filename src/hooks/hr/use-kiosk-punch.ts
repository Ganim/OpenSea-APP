'use client';

/**
 * OpenSea OS — Kiosk punch submission hook.
 *
 * Responsibilities:
 * 1. Submit a punch via {@link executeKioskPunch}. On network failure,
 *    enqueue the body to IndexedDB ({@link enqueuePunch}) so the kiosk
 *    keeps flowing through the result screen and we retry later.
 * 2. Listen to `online` events and flush the queue, showing a Sonner
 *    toast "N batida(s) sincronizada(s)" per successful batch.
 * 3. Expose `pendingCount` so an OfflineBanner can display the queue size.
 *
 * The kiosk page consumes `submit(body)` which always resolves — either
 * with the server response, or with a synthetic `{ offline: true }` marker
 * when we enqueued the request. ApiError from the server (non-network
 * failures) still throws so the page can render REJECT screens.
 *
 * Phase 5 — Plan 05-10 / UI-SPEC §K8 + §Offline banner.
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  enqueuePunch,
  flushQueue,
  pendingCount as pendingCountFn,
  type PendingPunch,
} from '@/lib/kiosk/offline-queue';
import {
  executeKioskPunch,
  KIOSK_DEVICE_TOKEN_KEY,
  type KioskPunchBody,
  type KioskPunchResponse,
} from '@/services/hr/kiosk.service';
import { ApiError } from '@/lib/api-client.types';

export type KioskPunchOutcome =
  | { kind: 'online'; response: KioskPunchResponse }
  | { kind: 'offline'; requestId: string };

/**
 * Detect "no network" failures. `fetch` throws a generic TypeError in most
 * browsers; we also treat AbortError as transient. `ApiError` (raised by
 * {@link executeKioskPunch} on non-2xx) is propagated — not queued — so
 * the kiosk can render the right REJECT copy (INVALID_QR_TOKEN, etc).
 */
function isNetworkError(err: unknown): boolean {
  if (err instanceof ApiError) return false;
  if (err instanceof Error) {
    // "Failed to fetch" (Chrome), "NetworkError" (Firefox), "The Internet
    // connection appears to be offline." (Safari), "AbortError" (timeout).
    if (err.name === 'AbortError') return true;
    const msg = err.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('offline') ||
      msg.includes('load failed')
    );
  }
  return true;
}

export function useKioskPunch() {
  const [pending, setPending] = useState(0);

  // Initial pendingCount read — runs once on mount in the browser.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    pendingCountFn()
      .then(setPending)
      .catch(() => undefined);
  }, []);

  /**
   * Flush every queued punch against the server. Called on `online`
   * events and wired so the kiosk page can fire a manual retry if we ever
   * surface one.
   */
  const flush = useCallback(async () => {
    try {
      const { sent } = await flushQueue(async item => {
        await executeKioskPunch(item.body as KioskPunchBody, item.deviceToken);
      });
      if (sent > 0) {
        toast.success(
          sent === 1 ? '1 batida sincronizada' : `${sent} batidas sincronizadas`
        );
      }
      const next = await pendingCountFn();
      setPending(next);
    } catch {
      // Individual failures are accounted for inside flushQueue; here
      // we only care about IDB-level errors which are unrecoverable
      // at this layer.
    }
  }, []);

  // Re-flush on every `online` event. The browser fires this both on
  // reconnect AND when the kiosk PC wakes from sleep with network back.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => {
      flush();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flush]);

  /**
   * Submit a punch. Resolves to an online response, or — on network
   * failure — enqueues the body and resolves with an offline marker.
   * Non-network errors (ApiError / HTTP 4xx / 5xx) are re-thrown so the
   * kiosk page can render the right REJECT state.
   */
  const submit = useCallback(
    async (body: KioskPunchBody): Promise<KioskPunchOutcome> => {
      const deviceToken =
        typeof window !== 'undefined'
          ? (localStorage.getItem(KIOSK_DEVICE_TOKEN_KEY) ?? '')
          : '';
      try {
        const response = await executeKioskPunch(body, deviceToken);
        return { kind: 'online', response };
      } catch (err) {
        if (isNetworkError(err)) {
          const item: PendingPunch = {
            requestId: body.requestId,
            body,
            createdAt: Date.now(),
            deviceToken,
          };
          await enqueuePunch(item);
          const next = await pendingCountFn();
          setPending(next);
          return { kind: 'offline', requestId: body.requestId };
        }
        throw err;
      }
    },
    []
  );

  return {
    submit,
    flush,
    pendingCount: pending,
  } as const;
}
