'use client';

/**
 * OpenSea OS — (kiosk) route group layout.
 *
 * Per UI-SPEC §K9 + 05-PATTERNS §21: the kiosk surface has NO navbar, NO
 * sidebar, NO ProtectedRoute. It authenticates every punch via the
 * `x-punch-device-token` header set up by /kiosk/setup — NOT via a user
 * JWT. The root layout still provides Auth/Tenant/Theme providers because
 * /kiosk/setup (admin flow) consumes them.
 *
 * Phase 5 — Plan 05-10.
 */

import { KioskLayout } from '@/components/hr/kiosk/KioskLayout';

export default function KioskRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KioskLayout>{children}</KioskLayout>;
}
