/**
 * Device Fingerprint Utility (Phase 9 Plan 09-03)
 *
 * LIA-compliant fingerprint generation per ADR-031.
 * Collects 5 entropy sources (canvas, UA, screen, timezone, language),
 * returns raw object + SHA-256 hash.
 *
 * Zero external dependencies. Deterministic: same inputs → same hash.
 * Used in punch kiosk + PWA to detect device spoofing attacks.
 *
 * Retention: 90 days (GDPR/LGPD balancing test in ADR-031 §6).
 * Audit: only marks suspicion, never blocks device permanently.
 */

/**
 * Raw fingerprint components (5 fields per ADR-031 D-14/D-15)
 */
export interface DeviceFingerprintRaw {
  canvasHash: string; // SHA-256 of canvas rendering (entropy 2)
  userAgent: string; // Navigator.userAgent (entropy 1)
  screen: string; // `${width}x${height}x${colorDepth}` (entropy 3)
  timezone: string; // Intl.DateTimeFormat().resolvedOptions().timeZone (entropy 4)
  language: string; // Navigator.language (entropy 5)
}

/**
 * Fingerprint result: raw data + final hash
 */
export interface DeviceFingerprint {
  hash: string; // SHA-256 of JSON.stringify(raw) — 64 hex chars
  raw: DeviceFingerprintRaw;
}

/**
 * SHA-256 hash using Web Crypto API (no external deps).
 * Returns lowercase hex string.
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Canvas entropy (2): renders gradient + text, extracts toDataURL hash.
 * Graceful fallback if canvas unavailable (returns hash of empty string).
 */
async function getCanvasHash(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      // Canvas context unavailable → hash of empty string
      return sha256('');
    }

    // Render gradient
    const gradient = ctx.createLinearGradient(0, 0, 280, 60);
    gradient.addColorStop(0, '#FF0000');
    gradient.addColorStop(0.5, '#00FF00');
    gradient.addColorStop(1, '#0000FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 280, 60);

    // Render text
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(
      'OpenSea Device FP ' + new Date().toISOString().slice(0, 10),
      20,
      40
    );

    // Extract canvas data
    const dataUrl = canvas.toDataURL();
    return sha256(dataUrl);
  } catch {
    // Graceful fallback
    return sha256('');
  }
}

/**
 * Compute device fingerprint.
 * Collects 5 entropy sources, returns { hash, raw }.
 */
export async function computeDeviceFingerprint(): Promise<DeviceFingerprint> {
  // Entropy 1: User Agent
  const userAgent = navigator.userAgent;

  // Entropy 2: Canvas
  const canvasHash = await getCanvasHash();

  // Entropy 3: Screen
  const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;

  // Entropy 4: Timezone
  let timezone = 'Unknown';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fallback if Intl unavailable
  }

  // Entropy 5: Language
  const language = navigator.language || 'unknown';

  // Build raw object
  const raw: DeviceFingerprintRaw = {
    canvasHash,
    userAgent,
    screen,
    timezone,
    language,
  };

  // Final hash: SHA-256 of JSON.stringify(raw)
  const rawJson = JSON.stringify(raw);
  const hash = await sha256(rawJson);

  return {
    hash,
    raw,
  };
}
