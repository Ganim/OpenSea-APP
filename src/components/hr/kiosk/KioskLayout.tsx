'use client';

/**
 * OpenSea OS — Kiosk Layout wrapper.
 *
 * Responsibilities:
 * - Force Light theme on every surface under /kiosk (UI-SPEC §K9).
 * - Register `/sw-kiosk.js` on mount so the 6MB face-api bundle
 *   is pre-cached for subsequent boots.
 * - Acquire a screen Wake Lock (Pitfall 6 + RESEARCH §Pattern).
 * - Render children inside a fullscreen Background wrapper — NO navbar,
 *   NO sidebar, NO ProtectedRoute (the kiosk authenticates by device
 *   token, not by user session).
 *
 * Phase 5 — Plan 05-10.
 */

import { useEffect } from 'react';
import { registerKioskSw } from '@/lib/kiosk/register-sw';
import { useWakeLock } from '@/lib/kiosk/use-wake-lock';

export function KioskLayout({ children }: { children: React.ReactNode }) {
  useWakeLock();

  useEffect(() => {
    registerKioskSw().catch(() => undefined);
  }, []);

  return (
    <div className="light min-h-dvh w-full bg-background text-foreground">
      {children}
    </div>
  );
}
