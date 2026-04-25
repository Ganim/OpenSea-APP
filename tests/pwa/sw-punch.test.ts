/**
 * Phase 8 / Plan 08-01 — Task 2.
 *
 * sw-punch.js spec covering push handler + notificationclick + endpoint v2
 * + backoff + manifest assertions.
 *
 * Approach: install Service Worker globals (`self`, registration, clients,
 * caches, indexedDB) on the global scope BEFORE evaluating the SW source.
 * Capture `addEventListener` calls into a Map so we can invoke each handler
 * in isolation. The SW is plain JS — we Function-eval the file content.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';

const SW_SOURCE_PATH = pathResolve(
  __dirname,
  '..',
  '..',
  'public',
  'sw-punch.js'
);
const MANIFEST_PATH = pathResolve(
  __dirname,
  '..',
  '..',
  'public',
  'manifest-punch.json'
);

function makeFakeIndexedDB() {
  const stores = new Map<string, Map<string, unknown>>();
  return {
    open(_name: string, _version?: number) {
      const req: {
        result: unknown;
        onupgradeneeded: ((e: { oldVersion: number }) => void) | null;
        onsuccess: (() => void) | null;
        onerror: (() => void) | null;
      } = {
        result: {
          objectStoreNames: { contains: (n: string) => stores.has(n) },
          createObjectStore: (n: string) => {
            stores.set(n, new Map());
            return { createIndex: () => undefined };
          },
          transaction(name: string, _mode: string) {
            const store =
              stores.get(name) ?? stores.set(name, new Map()).get(name)!;
            const tx: {
              objectStore: () => unknown;
              oncomplete: (() => void) | null;
              onerror: (() => void) | null;
              onabort: (() => void) | null;
            } = {
              objectStore: () => ({
                add: (punch: { id: string }) => {
                  store.set(punch.id, punch);
                  Promise.resolve().then(() => tx.oncomplete?.());
                  return { onsuccess: null, onerror: null };
                },
                put: (punch: { id: string }) => {
                  store.set(punch.id, punch);
                  Promise.resolve().then(() => tx.oncomplete?.());
                  return { onsuccess: null, onerror: null };
                },
                delete: (id: string) => {
                  store.delete(id);
                  Promise.resolve().then(() => tx.oncomplete?.());
                  return { onsuccess: null, onerror: null };
                },
                getAll: () => {
                  const all = Array.from(store.values());
                  const r = {
                    result: all,
                    onsuccess: null as (() => void) | null,
                    onerror: null as (() => void) | null,
                  };
                  Promise.resolve().then(() => {
                    r.onsuccess?.();
                    tx.oncomplete?.();
                  });
                  return r;
                },
              }),
              oncomplete: null,
              onerror: null,
              onabort: null,
            };
            return tx;
          },
        },
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
      };
      Promise.resolve().then(() => {
        req.onupgradeneeded?.({ oldVersion: 0 });
        req.onsuccess?.();
      });
      return req;
    },
  };
}

let handlers: Map<string, (event: unknown) => unknown>;
let showNotification: ReturnType<typeof vi.fn>;
let openWindow: ReturnType<typeof vi.fn>;
let matchAllResult: Array<{ url: string; focus?: ReturnType<typeof vi.fn> }>;

beforeEach(() => {
  vi.resetModules();

  handlers = new Map();
  showNotification = vi.fn().mockResolvedValue(undefined);
  openWindow = vi.fn().mockResolvedValue({});
  matchAllResult = [];

  const g = globalThis as unknown as Record<string, unknown>;
  g.self = globalThis;
  (g as { addEventListener: unknown }).addEventListener = (
    name: string,
    fn: (e: unknown) => unknown
  ) => handlers.set(name, fn);
  (g as { skipWaiting: unknown }).skipWaiting = vi.fn();
  (g as { registration: unknown }).registration = {
    showNotification,
    sync: { register: vi.fn().mockResolvedValue(undefined) },
  };
  (g as { clients: unknown }).clients = {
    claim: vi.fn().mockResolvedValue(undefined),
    matchAll: vi.fn().mockImplementation(() => Promise.resolve(matchAllResult)),
    openWindow,
  };
  (g as { caches: unknown }).caches = {
    open: vi.fn().mockResolvedValue({
      addAll: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
    }),
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(true),
    match: vi.fn().mockResolvedValue(undefined),
  };
  (g as { location: unknown }).location = { origin: 'http://localhost' };
  (g as { indexedDB: unknown }).indexedDB = makeFakeIndexedDB();
  // happy-dom expõe `crypto` como getter readonly. Só sobrescrevemos quando
  // ausente OU quando randomUUID precisar ser estável; happy-dom já tem
  // `crypto.randomUUID` real, suficiente para os testes.
  if (!(g as { crypto?: { randomUUID?: unknown } }).crypto?.randomUUID) {
    Object.defineProperty(g, 'crypto', {
      value: {
        randomUUID: () => `uuid-${Math.random().toString(16).slice(2, 10)}`,
      },
      configurable: true,
    });
  }
  (g as { fetch: unknown }).fetch = vi.fn();

  const source = readFileSync(SW_SOURCE_PATH, 'utf8');
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  new Function(source).call(globalThis);
});

afterEach(() => {
  // Reset handlers; jsdom may cache globals between tests.
  handlers = new Map();
});

describe('sw-punch.js — push handler', () => {
  it('Test 1 — push event with JSON payload renders showNotification with options', async () => {
    const handler = handlers.get('push');
    expect(handler).toBeDefined();

    const waitPromises: Promise<unknown>[] = [];
    const event = {
      data: {
        json: () => ({
          notificationId: 'n1',
          title: 'Ponto registrado',
          body: 'Sua entrada às 09:15 foi gravada.',
          actionUrl: '/punch',
          kind: 'INFORMATIONAL',
        }),
      },
      waitUntil: (p: Promise<unknown>) => waitPromises.push(p),
    };
    handler!(event);
    await Promise.all(waitPromises);

    expect(showNotification).toHaveBeenCalledTimes(1);
    const [title, options] = showNotification.mock.calls[0];
    expect(title).toBe('Ponto registrado');
    expect(options.body).toBe('Sua entrada às 09:15 foi gravada.');
    expect(options.tag).toBe('punch-n1');
    expect(options.data.url).toBe('/punch');
  });

  it('Test 2 — push event SEM data → handler returns sem chamar showNotification', () => {
    const handler = handlers.get('push');
    handler!({ data: null, waitUntil: () => undefined });
    expect(showNotification).not.toHaveBeenCalled();
  });

  it('push payload kind=APPROVAL adiciona inline actions Justificar/Ignorar', async () => {
    const handler = handlers.get('push');
    const waitPromises: Promise<unknown>[] = [];
    handler!({
      data: {
        json: () => ({
          notificationId: 'n2',
          title: 'Justifique sua falta',
          body: 'O gestor pediu uma justificativa.',
          actionUrl: '/punch/justify/abc',
          kind: 'APPROVAL',
        }),
      },
      waitUntil: (p: Promise<unknown>) => waitPromises.push(p),
    });
    await Promise.all(waitPromises);

    const [, options] = showNotification.mock.calls[0];
    expect(options.actions).toEqual([
      { action: 'open', title: 'Justificar' },
      { action: 'dismiss', title: 'Ignorar' },
    ]);
  });
});

describe('sw-punch.js — notificationclick', () => {
  it('Test 3 — notificationclick → close + openWindow', async () => {
    const handler = handlers.get('notificationclick');
    const close = vi.fn();
    const waitPromises: Promise<unknown>[] = [];
    handler!({
      notification: { close, data: { url: '/punch/justify/123' } },
      action: undefined,
      waitUntil: (p: Promise<unknown>) => waitPromises.push(p),
    });
    expect(close).toHaveBeenCalled();
    await Promise.all(waitPromises);
    expect(openWindow).toHaveBeenCalledWith('/punch/justify/123');
  });

  it('Test 4 — notificationclick com client /punch já aberto → focus, NÃO openWindow', async () => {
    const focus = vi.fn().mockResolvedValue(undefined);
    matchAllResult = [{ url: 'http://localhost/punch?source=pwa', focus }];
    const handler = handlers.get('notificationclick');
    const close = vi.fn();
    const waitPromises: Promise<unknown>[] = [];
    handler!({
      notification: { close, data: { url: '/punch' } },
      action: undefined,
      waitUntil: (p: Promise<unknown>) => waitPromises.push(p),
    });
    await Promise.all(waitPromises);
    expect(focus).toHaveBeenCalled();
    expect(openWindow).not.toHaveBeenCalled();
  });

  it('action=dismiss → fecha e não navega', () => {
    const handler = handlers.get('notificationclick');
    const close = vi.fn();
    handler!({
      notification: { close, data: { url: '/punch' } },
      action: 'dismiss',
      waitUntil: () => undefined,
    });
    expect(close).toHaveBeenCalled();
    expect(openWindow).not.toHaveBeenCalled();
  });
});

describe('sw-punch.js — smoke + grep contracts', () => {
  it('Test 5 — sw-punch.js parses without syntax errors', () => {
    const source = readFileSync(SW_SOURCE_PATH, 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    expect(() => new Function(source)).not.toThrow();
  });

  it('Test 6 — PUNCH_API_PATTERN regex aceita /v1/hr/punch/clock + legacy /clock-(in|out)', () => {
    const source = readFileSync(SW_SOURCE_PATH, 'utf8');
    // Regex literal escapa `/` como `\/` — checamos a forma literal canônica.
    expect(source).toMatch(/punch\\\/clock\|time-control\\\/clock-\(in\|out\)/);
    expect(source).toContain("PUNCH_API_V2 = '/v1/hr/punch/clock'");
  });

  it('SHELL_CACHE bumped to v2', () => {
    const source = readFileSync(SW_SOURCE_PATH, 'utf8');
    expect(source).toContain('opensea-punch-shell-v2');
  });

  it('DB_VERSION = 2', () => {
    const source = readFileSync(SW_SOURCE_PATH, 'utf8');
    expect(source).toContain('DB_VERSION = 2');
  });

  it('BACKOFF_MS sequence declared', () => {
    const source = readFileSync(SW_SOURCE_PATH, 'utf8');
    expect(source).toContain('BACKOFF_MS');
    expect(source).toContain('30_000');
  });
});

describe('sw-punch.js — backoff gate (Plan 8-01 D-05)', () => {
  it('Test 7 — sync + message handlers existem (backoff gate é exercido em replayQueuedPunches)', () => {
    expect(handlers.get('sync')).toBeDefined();
    expect(handlers.get('message')).toBeDefined();
    expect(handlers.get('fetch')).toBeDefined();
  });
});

describe('manifest-punch.json — shortcuts (Plan 8-01 D-01)', () => {
  it('Test 8 — manifest tem 3 shortcuts (Bater ponto / Justificar / Histórico)', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as {
      shortcuts: Array<{ name: string; url: string; icons: unknown[] }>;
    };
    expect(Array.isArray(manifest.shortcuts)).toBe(true);
    expect(manifest.shortcuts.length).toBe(3);
    const names = manifest.shortcuts.map(s => s.name);
    expect(names).toContain('Bater ponto agora');
    expect(names).toContain('Justificar batida');
    expect(names).toContain('Histórico');
    for (const sc of manifest.shortcuts) {
      expect(typeof sc.url).toBe('string');
      expect(sc.url.startsWith('/punch')).toBe(true);
      expect(Array.isArray(sc.icons)).toBe(true);
      expect(sc.icons.length).toBeGreaterThanOrEqual(1);
    }
  });
});
