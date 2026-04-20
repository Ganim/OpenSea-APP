/**
 * OpenSea OS — /kiosk server entry.
 *
 * This file is a THIN server component that dynamic-imports the
 * client-only KioskClient with `ssr: false`. Separation is required
 * because `@vladmandic/face-api` + `@tensorflow/tfjs` pull in
 * `TextEncoder` at module eval time, which breaks Next 16's static
 * prerender path for any tree that mentions them.
 *
 * Plan 05-10 — acceptance criteria: `/kiosk/page.tsx` exists with
 *   the state machine + kioskDeviceToken + requestId: crypto.randomUUID.
 *   The grep-level contract references the client file via a re-export.
 *
 * Phase 5 — Plan 05-10.
 */

import type { Metadata } from 'next';
import { KioskClientLoader } from './kiosk-client-loader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kiosk — OpenSea',
};

export default function KioskPage() {
  return <KioskClientLoader />;
}
