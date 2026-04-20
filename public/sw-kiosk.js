/* eslint-disable no-restricted-globals */
/**
 * OpenSea Kiosk — Service Worker
 *
 * Phase 5 — Plan 05-10 / PATTERNS §22.
 *
 * Responsibilities:
 * 1. Pre-cache the ~6MB face-api.js model bundle (`/models/v1/*`) on the
 *    first boot so subsequent loads are instant and work offline.
 * 2. Pre-cache the /kiosk and /kiosk/setup shell.
 * 3. Serve models with `cache-first`, serve the shell with `network-first`
 *    (so a redeploy is picked up as soon as the kiosk has any connectivity).
 * 4. DO NOT touch the API — the kiosk page owns the offline queue in IDB,
 *    not the SW. Mixing concerns bit us in /punch (see sw-punch.js).
 *
 * Registered with `scope: '/kiosk'` — requires the response header
 * `Service-Worker-Allowed: /kiosk` on /sw-kiosk.js (wired in next.config.ts).
 */

const SHELL_CACHE = 'opensea-kiosk-shell-v1';
const MODELS_CACHE = 'opensea-kiosk-models-v1';

const SHELL_URLS = ['/kiosk', '/kiosk/setup'];

// Explicit list — SW install cannot list directories. Paths mirror the
// files under OpenSea-APP/public/models/v1/ (plan 05-08 assets).
const MODEL_URLS = [
  '/models/v1/tiny_face_detector_model-weights_manifest.json',
  '/models/v1/tiny_face_detector_model.bin',
  '/models/v1/face_landmark_68_model-weights_manifest.json',
  '/models/v1/face_landmark_68_model.bin',
  '/models/v1/face_recognition_model-weights_manifest.json',
  '/models/v1/face_recognition_model.bin',
];

/* ---------- Lifecycle ---------- */

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches
        .open(SHELL_CACHE)
        .then(cache => cache.addAll(SHELL_URLS).catch(() => undefined)),
      caches
        .open(MODELS_CACHE)
        .then(cache => cache.addAll(MODEL_URLS).catch(() => undefined)),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(names =>
        Promise.all(
          names
            .filter(name => name !== SHELL_CACHE && name !== MODELS_CACHE)
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- Fetch strategy ---------- */

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Cache-first for the 6MB face-api model bundle. Heavy binary files
  // change only when we bump the base URL (→ /models/v2/...).
  if (url.pathname.startsWith('/models/v1/')) {
    event.respondWith(cacheFirst(request, MODELS_CACHE));
    return;
  }

  // Network-first for the /kiosk shell so redeploys roll out immediately
  // when the kiosk has any connectivity; falls back to cache when offline.
  if (url.pathname === '/kiosk' || url.pathname === '/kiosk/setup') {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  // Everything else (API, Next.js static, etc.) bypasses the SW. The kiosk
  // page owns the IndexedDB offline queue for POST /v1/hr/punch/clock.
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return new Response('Asset unavailable offline', { status: 504 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Kiosk offline — shell not cached yet', {
      status: 503,
      statusText: 'Offline',
    });
  }
}
