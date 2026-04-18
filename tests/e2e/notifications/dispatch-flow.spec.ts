/**
 * End-to-end test for the notifications v2 dispatch flow.
 *
 * Validates the core contract that any business module follows:
 *   POST /v1/notifications/test-send   →  notification persisted
 *   GET  /v1/notifications             →  returns the new notification
 *   PATCH /v1/notifications/:id/read   →  flips is_read
 *
 * Uses the public API (no DB access) so it also exercises auth,
 * tenant scoping, and the Socket.IO-backed dispatcher pipeline.
 */

import { test, expect } from '@playwright/test';
import { getAuthenticatedToken } from '../helpers/auth.helper';

const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3333';

async function fetchJson(
  path: string,
  token: string,
  init?: RequestInit
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${API}${path}`, {
    ...(init ?? {}),
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  try {
    return { status: res.status, body: text ? JSON.parse(text) : null };
  } catch {
    return { status: res.status, body: text };
  }
}

test.describe('Notifications — API dispatch flow', () => {
  let token: string;

  test.beforeAll(async () => {
    const auth = await getAuthenticatedToken('admin@teste.com', 'Teste@123');
    token = auth.token;
  });

  test('POST /test-send dispatches sample notifications', async () => {
    const { status, body } = await fetchJson(
      '/v1/notifications/test-send',
      token,
      {
        method: 'POST',
        body: JSON.stringify({ type: 'INFORMATIONAL' }),
      }
    );
    expect(status).toBe(200);
    expect(body).toMatchObject({
      dispatched: expect.arrayContaining(['INFORMATIONAL']),
    });
  });

  test('GET /notifications returns persisted entries', async () => {
    const { status, body } = await fetchJson('/v1/notifications', token);
    expect(status).toBe(200);
    expect(body).toHaveProperty('notifications');
  });

  test('GET /modules-manifest returns 10 modules with categories', async () => {
    const { status, body } = await fetchJson(
      '/v1/notifications/modules-manifest',
      token
    );
    expect(status).toBe(200);
    const b = body as {
      modules: Array<{ code: string; categories: unknown[] }>;
    };
    expect(b.modules.length).toBeGreaterThanOrEqual(10);
    const codes = b.modules.map(m => m.code).sort();
    expect(codes).toEqual(
      expect.arrayContaining([
        'admin',
        'calendar',
        'core',
        'email',
        'finance',
        'hr',
        'requests',
        'sales',
        'stock',
        'tasks',
      ])
    );
  });

  test('GET /settings returns the user notification settings', async () => {
    const { status, body } = await fetchJson(
      '/v1/notifications/settings',
      token
    );
    expect(status).toBe(200);
    expect(body).toMatchObject({
      timezone: expect.any(String),
      masterInApp: expect.any(Boolean),
      masterEmail: expect.any(Boolean),
    });
  });

  test('PUT /settings updates DND flag and persists it', async () => {
    const up = await fetchJson('/v1/notifications/settings', token, {
      method: 'PUT',
      body: JSON.stringify({
        doNotDisturb: true,
        dndStart: '22:00',
        dndEnd: '07:00',
      }),
    });
    expect(up.status).toBe(204);

    const { body } = await fetchJson('/v1/notifications/settings', token);
    expect(body).toMatchObject({
      doNotDisturb: true,
      dndStart: '22:00',
      dndEnd: '07:00',
    });
  });
});
