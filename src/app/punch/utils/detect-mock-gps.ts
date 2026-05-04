/**
 * Mock GPS Detection (Phase 9 Plan 09-03)
 *
 * Client-side heuristics: 2 geolocation fixes (δ 1s),
 * detects 3 spoofing patterns:
 * 1. Identical coordinates across 2 fixes (static GPS)
 * 2. accuracy === 0 (mock always returns perfect accuracy)
 * 3. accuracy identical & unchanged (mock returns constant mock accuracy)
 *
 * Returns boolean: true if likely spoofed, false if genuine.
 * Used in punch clock to flag suspicious location + force re-punch.
 * Per D-04 (Mock GPS Detection Patterns).
 */

export interface GeolocationFix {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Wait helper (for delta timing between fixes)
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get single geolocation fix with timeout.
 */
function getGeolocationFix(timeoutMs: number = 10000): Promise<GeolocationFix> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Geolocation timeout after ' + timeoutMs + 'ms')),
      timeoutMs
    );

    navigator.geolocation.getCurrentPosition(
      position => {
        clearTimeout(timeout);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      error => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

/**
 * Detect mock GPS via 2 fixes + heuristics.
 * Returns true if likely spoofed, false if genuine or error.
 */
export async function detectMockGps(): Promise<boolean> {
  try {
    // Fix 1
    const fix1 = await getGeolocationFix();

    // Wait 1 second delta
    await wait(1000);

    // Fix 2
    const fix2 = await getGeolocationFix();

    // Heuristic 1: Identical coords
    const coordsIdentical =
      fix1.latitude === fix2.latitude && fix1.longitude === fix2.longitude;
    if (coordsIdentical) {
      return true; // Static GPS = likely mock
    }

    // Heuristic 2: accuracy === 0
    if (fix1.accuracy === 0 || fix2.accuracy === 0) {
      return true; // Perfect accuracy = mock pattern
    }

    // Heuristic 3: accuracy identical & unchanged
    const accuracyIdentical = fix1.accuracy === fix2.accuracy;
    if (accuracyIdentical) {
      return true; // Constant accuracy = mock pattern
    }

    // No red flags detected
    return false;
  } catch {
    // Geolocation error or timeout → graceful fallback
    // Don't mark as mock if GPS fails; only flag suspicious patterns
    return false;
  }
}
