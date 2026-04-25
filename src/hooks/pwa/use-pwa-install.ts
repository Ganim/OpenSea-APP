'use client';

/**
 * `usePwaInstall` — React hook around the browser-native install flow.
 *
 * Browsers fire a `beforeinstallprompt` event when the PWA install criteria
 * are met (HTTPS + manifest + service worker + engagement). We `preventDefault`
 * it so the browser does NOT show its mini-infobar and instead surface a
 * proper in-app CTA. When the user clicks "Install", we call `install()`
 * which triggers the deferred prompt and resolves with the user's choice.
 *
 * iOS Safari does NOT fire this event — `PWAInstallBanner` falls back to
 * `IOSAddToHomeScreenModal` when `isIOS()` is true.
 *
 * Module-scope `deferredPrompt`: the event must be captured the moment the
 * browser fires it (often on first paint), but the React hook may not be
 * mounted yet. We capture at module load and reuse across components.
 */

import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

/**
 * Test helper — resets the module-scope deferred prompt between tests so
 * one test's state does not leak into the next. NOT exported via barrel and
 * NOT meant for production code.
 */
export function __resetPwaInstallStateForTests(): void {
  deferredPrompt = null;
}

export interface UsePwaInstallResult {
  isInstallable: boolean;
  install: () => Promise<'accepted' | 'dismissed' | null>;
}

export function usePwaInstall(): UsePwaInstallResult {
  const [isInstallable, setIsInstallable] = useState(deferredPrompt !== null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (deferredPrompt !== null) setIsInstallable(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = useCallback(async (): Promise<
    'accepted' | 'dismissed' | null
  > => {
    if (!deferredPrompt) return null;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setIsInstallable(false);
    return choice.outcome;
  }, []);

  return { isInstallable, install };
}
