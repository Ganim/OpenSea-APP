/* eslint-disable no-restricted-globals */
/**
 * OpenSea Punch — Service Worker
 *
 * Responsibilities:
 * 1. Cache the punch shell so the page can boot offline.
 * 2. Intercept punch POSTs that fail / happen offline, persist them in
 *    IndexedDB, and register a Background Sync to flush them later.
 * 3. On the `sync` event, replay queued punches against the API.
 * 4. Phase 8 / Plan 08-01: handle Web Push events from backend dispatcher
 *    (Plan 04-05) and surface system notifications. Click → focus existing
 *    /punch tab or open a new one with the actionUrl.
 *
 * Notes:
 * - This file is plain JavaScript on purpose: it runs in the worker scope,
 *   not in the bundler.
 * - The IndexedDB schema MUST stay aligned with `src/lib/pwa/punch-db.ts`.
 *   When that file bumps DB_VERSION, bump it here as well.
 * - Endpoint migrated to the unified Phase 4-04 `/v1/hr/punch/clock` with
 *   `requestId` UUID v4 per batida (idempotency server-wins). Legacy
 *   `/v1/hr/time-control/clock-in|clock-out` is still matched in the
 *   intercept regex for backward-compat with old PWA installs that have
 *   not yet refreshed the SW — the helper rewrites them to the unified
 *   endpoint on replay.
 */

const SHELL_CACHE = 'opensea-punch-shell-v2';
const RUNTIME_CACHE = 'opensea-punch-runtime-v2';

const SHELL_URLS = ['/punch', '/manifest-punch.json', '/manifest.json'];

// Phase 4-04 unified endpoint (preferred) + Phase 8 legacy compat (defensive).
const PUNCH_API_PATTERN =
  /\/v1\/hr\/(punch\/clock|time-control\/clock-(in|out))$/;
const PUNCH_API_V2 = '/v1/hr/punch/clock';
const SYNC_TAG = 'opensea-punch-sync';

const DB_NAME = 'opensea-punch';
const DB_VERSION = 2;
const STORE_NAME = 'pending-punches';

// Backoff sequence for failed punches (Plan 8-01 D-05). On attempt N
// (1-indexed), `nextRetryAt = now + BACKOFF_MS[N-1]`. After exhausting the
// sequence, the entry transitions to status='paused' and only retries on
// manual user intervention (`punch:flush` message from foreground).
const BACKOFF_MS = [30_000, 60_000, 5 * 60_000, 30 * 60_000];

/* ---------- Lifecycle ---------- */

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(names =>
        Promise.all(
          names
            .filter(name => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- Fetch strategy ---------- */

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method === 'POST' && PUNCH_API_PATTERN.test(request.url)) {
    event.respondWith(handlePunchPost(request));
    return;
  }

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (url.pathname === '/punch' || url.pathname.startsWith('/punch/')) {
      event.respondWith(networkFirst(request));
      return;
    }
    if (
      url.pathname.startsWith('/_next/static/') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.ico')
    ) {
      event.respondWith(cacheFirst(request));
    }
  }
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch {
    return new Response('Asset unavailable offline', { status: 504 });
  }
}

/* ---------- Punch POST handler ---------- */

async function handlePunchPost(request) {
  const cloned = request.clone();
  try {
    const response = await fetch(request);
    if (!response.ok && response.status >= 500) {
      await persistPunchFromRequest(cloned);
      await registerBackgroundSync();
      return jsonResponse({ queued: true, reason: 'server-error' }, 202);
    }
    return response;
  } catch {
    await persistPunchFromRequest(cloned);
    await registerBackgroundSync();
    return jsonResponse({ queued: true, reason: 'offline' }, 202);
  }
}

async function persistPunchFromRequest(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return;
  }
  if (!body || typeof body !== 'object' || !body.employeeId) return;

  const url = new URL(request.url);
  // Phase 4-04 v2 body carries `entryType` directly. Legacy /clock-in vs
  // /clock-out path-based fallback preserved for backward-compat.
  const type =
    body.entryType ||
    (url.pathname.endsWith('clock-in') ? 'CLOCK_IN' : 'CLOCK_OUT');
  const nowIso = new Date().toISOString();
  const requestId =
    body.requestId ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const pendingPunch = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    employeeId: body.employeeId,
    type,
    timestamp: body.timestamp ?? nowIso,
    latitude: body.latitude,
    longitude: body.longitude,
    notes: body.notes,
    attempts: 0,
    createdAt: nowIso,
    lastError: null,
    // Phase 8 / Plan 08-01 — D-05/D-06: status + nextRetryAt + idempotency.
    status: 'pending',
    nextRetryAt: undefined,
    requestId,
  };
  await idbAdd(pendingPunch);
  await broadcast({ kind: 'punch-queued', punch: pendingPunch });
}

/* ---------- Background sync ---------- */

self.addEventListener('sync', event => {
  if (event.tag !== SYNC_TAG) return;
  event.waitUntil(replayQueuedPunches());
});

self.addEventListener('message', event => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'punch:flush') {
    event.waitUntil(replayQueuedPunches());
  }
});

async function registerBackgroundSync() {
  if (!('sync' in self.registration)) return;
  try {
    await self.registration.sync.register(SYNC_TAG);
  } catch {
    /* unsupported (Safari, Firefox) — falls back to foreground retry */
  }
}

async function replayQueuedPunches() {
  const queue = await idbGetAll();
  for (const punch of queue) {
    // Phase 8 / Plan 08-01 — D-05: backoff gate.
    if (punch.status === 'paused' || punch.status === 'expired') continue;
    if (punch.nextRetryAt && Date.now() < punch.nextRetryAt) continue;

    // Phase 4-04 unified endpoint with idempotency requestId (D-06).
    const requestId =
      punch.requestId ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    if (!punch.requestId) {
      punch.requestId = requestId;
      await idbPut(punch);
    }

    const endpoint = PUNCH_API_V2;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: punch.employeeId,
          entryType: punch.type,
          timestamp: punch.timestamp,
          latitude: punch.latitude,
          longitude: punch.longitude,
          notes: punch.notes,
          requestId,
        }),
        credentials: 'include',
      });
      if (response.ok) {
        await idbDelete(punch.id);
        await broadcast({ kind: 'punch-synced', id: punch.id });
      } else if (response.status >= 400 && response.status < 500) {
        await idbDelete(punch.id);
        await broadcast({
          kind: 'punch-rejected',
          id: punch.id,
          status: response.status,
        });
      } else {
        await markFailed(punch, `HTTP ${response.status}`);
      }
    } catch (err) {
      await markFailed(punch, err && err.message ? err.message : 'network');
      // Não throw — outras batidas da fila ainda devem ser tentadas.
    }
  }
}

async function markFailed(punch, message) {
  punch.attempts = (punch.attempts || 0) + 1;
  punch.lastError = message;
  // Phase 8 / Plan 08-01 — D-05: backoff exponencial + status enum.
  const idx = Math.min(punch.attempts - 1, BACKOFF_MS.length - 1);
  const isLast = punch.attempts > BACKOFF_MS.length;
  punch.status = isLast ? 'paused' : 'failed';
  punch.nextRetryAt = isLast ? undefined : Date.now() + BACKOFF_MS[idx];
  await idbPut(punch);
}

/* ---------- Push notifications (Phase 8 / Plan 08-01 — D-03) ---------- */

self.addEventListener('push', event => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'OpenSea Ponto', body: event.data.text() };
  }
  const title = payload.title || 'OpenSea Ponto';
  const body = payload.body || '';
  const actionUrl = payload.actionUrl || '/punch';
  const kind = payload.kind || 'INFORMATIONAL';
  const tag = payload.notificationId
    ? `punch-${payload.notificationId}`
    : `punch-${Date.now()}`;
  const options = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    data: {
      notificationId: payload.notificationId,
      url: actionUrl,
      kind,
    },
    actions:
      kind === 'APPROVAL'
        ? [
            { action: 'open', title: 'Justificar' },
            { action: 'dismiss', title: 'Ignorar' },
          ]
        : undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action;
  if (action === 'dismiss') return;
  const url =
    (event.notification.data && event.notification.data.url) || '/punch';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        for (const c of clients) {
          if (c.url && c.url.indexOf('/punch') !== -1 && 'focus' in c) {
            return c.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
        return undefined;
      })
  );
});

/* ---------- IndexedDB primitives (mirror of src/lib/pwa/punch-db.ts) ---------- */

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('employeeId', 'employeeId', { unique: false });
      }
      // Phase 8 / Plan 08-01 — D-05: schema bump v1→v2. New fields
      // (`status`, `nextRetryAt`, `requestId`) are optional and written
      // via .put() — no data migration needed for legacy rows. Block kept
      // explicit so future readers see the version transition.
      if (event.oldVersion < 2 && db.objectStoreNames.contains(STORE_NAME)) {
        // no-op: aditivo, sem schema change no objectStore.
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbAdd(punch) {
  return openDb().then(
    db =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).add(punch);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function idbPut(punch) {
  return openDb().then(
    db =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(punch);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function idbDelete(id) {
  return openDb().then(
    db =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function idbGetAll() {
  return openDb().then(
    db =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      })
  );
}

/* ---------- Helpers ---------- */

async function broadcast(payload) {
  try {
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
    });
    for (const client of clients) {
      client.postMessage({ source: 'opensea-punch-sw', ...payload });
    }
  } catch {
    /* ignore broadcast failures */
  }
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
