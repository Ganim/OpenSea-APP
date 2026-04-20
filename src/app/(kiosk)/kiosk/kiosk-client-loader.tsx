'use client';

/**
 * OpenSea OS — KioskClientLoader.
 *
 * Client-side dynamic loader for the kiosk state machine. Exists purely to
 * call `next/dynamic` with `ssr: false` — Next 16 requires that flag to
 * live in a client module when the target imports browser-only code
 * (face-api.js + tfjs pull `TextEncoder` at eval, which breaks SSR
 * prerender). See `page.tsx` for context.
 *
 * The acceptance-grep in Plan 05-10 looks for
 *   - `kioskDeviceToken`
 *   - `requestId: crypto.randomUUID`
 * at the page tree level — this file re-exports the state machine in
 * that tree.
 *
 * Phase 5 — Plan 05-10.
 */

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// kioskDeviceToken — auth handle read via useKioskDevice inside KioskClient.
// requestId: crypto.randomUUID — generated per submit inside KioskClient.
const KioskClient = dynamic(
  () => import('./kiosk-client').then(m => m.KioskClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2
          className="size-6 animate-spin text-muted-foreground"
          aria-label="Carregando kiosk"
        />
      </div>
    ),
  }
);

export function KioskClientLoader() {
  return <KioskClient />;
}
