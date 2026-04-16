/**
 * IndexedDB helper for offline punch queue.
 *
 * Persists punch attempts when the user is offline (or when the request fails)
 * so they can be replayed by a Service Worker Background Sync handler — or by
 * the foreground hook — once connectivity is restored.
 *
 * Why IndexedDB instead of localStorage:
 * - localStorage is synchronous and 5MB-capped per origin. Selfie photos (base64)
 *   blow that limit very quickly.
 * - IndexedDB is the only storage that a Service Worker can also read/write,
 *   which is required for true Background Sync API support.
 *
 * The implementation is intentionally dependency-free: it wraps the raw IDB
 * API with a thin promise-based facade (~80 LOC), no `idb`/`dexie` runtime cost.
 */

const DB_NAME = 'opensea-punch';
const DB_VERSION = 1;
const STORE_NAME = 'pending-punches';

export type PunchType = 'CLOCK_IN' | 'CLOCK_OUT';

export interface PendingPunch {
  /** UUID generated client-side at enqueue time. */
  id: string;
  employeeId: string;
  type: PunchType;
  /** ISO timestamp captured at the moment the user tapped the CTA. */
  timestamp: string;
  latitude?: number;
  longitude?: number;
  /** Optional base64-encoded selfie payload. */
  photoData?: string;
  notes?: string;
  /** Number of replay attempts performed so far (for back-off / surfacing failures). */
  attempts: number;
  /** ISO timestamp the entry was first persisted. */
  createdAt: string;
  /** ISO timestamp of the most recent failed sync attempt, when applicable. */
  lastError?: string | null;
}

let cachedDbPromise: Promise<IDBDatabase> | null = null;

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase> {
  if (!isBrowserEnvironment()) {
    return Promise.reject(
      new Error('IndexedDB is not available in this environment.')
    );
  }
  if (cachedDbPromise) return cachedDbPromise;

  cachedDbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('employeeId', 'employeeId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open punch IndexedDB.'));
  });

  return cachedDbPromise;
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  executor: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>
): Promise<T> {
  return openDatabase().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        let resolvedValue: T | undefined;

        const result = executor(store);
        if (result instanceof Promise) {
          result.then(value => {
            resolvedValue = value;
          });
        } else {
          result.onsuccess = () => {
            resolvedValue = result.result;
          };
          result.onerror = () =>
            reject(result.error ?? new Error('IDB request failed.'));
        }

        tx.oncomplete = () => resolve(resolvedValue as T);
        tx.onerror = () =>
          reject(tx.error ?? new Error('IDB transaction failed.'));
        tx.onabort = () =>
          reject(tx.error ?? new Error('IDB transaction aborted.'));
      })
  );
}

export interface EnqueuePunchInput {
  employeeId: string;
  type: PunchType;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  photoData?: string;
  notes?: string;
}

export async function enqueuePunch(
  input: EnqueuePunchInput
): Promise<PendingPunch> {
  const nowIso = new Date().toISOString();
  const pendingPunch: PendingPunch = {
    id: crypto.randomUUID(),
    employeeId: input.employeeId,
    type: input.type,
    timestamp: input.timestamp ?? nowIso,
    latitude: input.latitude,
    longitude: input.longitude,
    photoData: input.photoData,
    notes: input.notes,
    attempts: 0,
    createdAt: nowIso,
    lastError: null,
  };

  await runTransaction('readwrite', store => store.add(pendingPunch));
  return pendingPunch;
}

export function getPendingPunches(): Promise<PendingPunch[]> {
  return runTransaction<PendingPunch[]>('readonly', store => store.getAll());
}

export function removePunch(id: string): Promise<void> {
  return runTransaction<void>('readwrite', store => {
    store.delete(id);
    return undefined as unknown as IDBRequest<void>;
  }).then(() => undefined);
}

export async function markPunchFailed(
  id: string,
  errorMessage: string
): Promise<void> {
  const all = await getPendingPunches();
  const target = all.find(punch => punch.id === id);
  if (!target) return;
  target.attempts += 1;
  target.lastError = errorMessage;
  await runTransaction('readwrite', store => store.put(target));
}

export async function countPendingPunches(): Promise<number> {
  if (!isBrowserEnvironment()) return 0;
  return runTransaction<number>('readonly', store => store.count());
}

/**
 * Reset cached database handle. Used by tests and by the SW after a forced
 * version bump; should not be called from product code.
 */
export function __resetPunchDbForTesting(): void {
  cachedDbPromise = null;
}
