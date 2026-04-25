/**
 * iOS / standalone PWA detection helpers.
 *
 * iOS Safari does NOT fire the `beforeinstallprompt` event — install must be
 * triggered via the manual A2HS (Add to Home Screen) flow. These helpers tell
 * the install banner / push subscription flow which path to take.
 *
 * Reference: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
 *
 * All helpers are SSR-safe (return `false` / `null` when `window` /
 * `navigator` are undefined so they can be called from React component
 * bodies that may render on the server).
 */

/**
 * Returns true when the current browser is iOS Safari (iPhone, iPad, iPod).
 * Excludes Windows Phone (which historically also matched the IE/Edge string
 * `MSStream`).
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
  );
}

/**
 * Parses the iOS major/minor version from the UA string. Returns `null` for
 * non-iOS browsers or when the version block is missing.
 */
export function getIOSVersion(): { major: number; minor: number } | null {
  if (!isIOS()) return null;
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
  };
}

/**
 * Returns true when the page is running as an installed PWA (no browser
 * chrome). Checks both:
 *   - `navigator.standalone === true`  → iOS Safari A2HS
 *   - `matchMedia('(display-mode: standalone)')` → Android Chrome / Desktop
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone =
    (window.navigator as { standalone?: boolean }).standalone === true;
  if (iosStandalone) return true;
  if (typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

/**
 * Returns true when the runtime is capable of receiving Web Push.
 *
 * - Non-iOS browsers: assumed capable (Service Worker + Push API checks live
 *   elsewhere in `usePushSubscription`).
 * - iOS 16.4+: capable ONLY when the PWA is installed (Apple gates Web Push
 *   behind A2HS — Safari blog Mar 2023).
 * - iOS < 16.4: not supported.
 */
export function supportsIOSWebPush(): boolean {
  const version = getIOSVersion();
  if (!version) return true;
  if (version.major < 16) return false;
  if (version.major === 16 && version.minor < 4) return false;
  return isStandalonePWA();
}
