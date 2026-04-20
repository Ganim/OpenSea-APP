/**
 * OpenSea OS — /kiosk/setup page.
 *
 * Hosts the {@link SetupWizard} — admin pairs a PunchDevice via TOTP,
 * the resulting `deviceToken` is persisted in localStorage, and the
 * wizard redirects to /kiosk.
 *
 * Phase 5 — Plan 05-10 / UI-SPEC §/kiosk/setup.
 */

import { SetupWizard } from '@/components/hr/kiosk/SetupWizard';

export const dynamic = 'force-dynamic';

export default function KioskSetupPage() {
  return <SetupWizard />;
}
