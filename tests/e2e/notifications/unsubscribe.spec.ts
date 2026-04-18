/**
 * Validates the public unsubscribe endpoint:
 *   GET /v1/notifications/unsubscribe/:token
 *
 * Invalid token → 400 + Portuguese error page.
 */

import { test, expect } from '@playwright/test';

const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3333';

test.describe('Notifications — unsubscribe endpoint', () => {
  test('rejects malformed token', async () => {
    const res = await fetch(`${API}/v1/notifications/unsubscribe/not-a-token`);
    expect(res.status).toBe(400);
    const html = await res.text();
    expect(html).toContain('Link inválido');
  });

  test('rejects token with invalid signature', async () => {
    const res = await fetch(
      `${API}/v1/notifications/unsubscribe/user-id.category-id.deadbeef`
    );
    expect(res.status).toBe(400);
    const html = await res.text();
    expect(html).toContain('Link inválido');
  });
});
