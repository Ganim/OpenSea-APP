'use client';

/**
 * `usePwaStandaloneDetect` — reactive detection of standalone PWA mode.
 *
 * Returns `{ isStandalone }` — flips when the user installs (Android Chrome
 * fires the `change` event on the `(display-mode: standalone)` MediaQueryList
 * once the install completes).
 *
 * SSR-safe: initial state is `false` if `window` is unavailable.
 */

import { useEffect, useState } from 'react';

import { isStandalonePWA } from '@/app/punch/utils/ios-detection';

export interface UsePwaStandaloneDetectResult {
  isStandalone: boolean;
}

export function usePwaStandaloneDetect(): UsePwaStandaloneDetectResult {
  const [isStandalone, setIsStandalone] = useState<boolean>(() =>
    isStandalonePWA()
  );

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }
    const mql = window.matchMedia('(display-mode: standalone)');
    const handler = () => setIsStandalone(isStandalonePWA());
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    // Fallback for older browsers that only expose `addListener`
    if (typeof mql.addListener === 'function') {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
    return undefined;
  }, []);

  return { isStandalone };
}
