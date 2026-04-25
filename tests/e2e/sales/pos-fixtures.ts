import type { APIRequestContext } from '@playwright/test';
import { request } from '@playwright/test';
import { API_URL, getAuthenticatedToken } from '../helpers/auth.helper';

/**
 * Build an authenticated APIRequestContext using the seed admin credentials
 * (admin@teste.com / Teste@123, see CLAUDE.md). Reuses tenant-scoped token.
 */
export async function buildAdminApiContext(): Promise<APIRequestContext> {
  const { token } = await getAuthenticatedToken('admin@teste.com', 'Teste@123');

  return request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Returns the first POS terminal id available for the seed admin tenant.
 * If no terminal exists, returns null (the spec should skip itself).
 */
export async function findFirstTerminalId(
  ctx: APIRequestContext
): Promise<string | null> {
  const res = await ctx.get('/v1/sales/pos/terminals');
  if (!res.ok()) return null;
  const body = (await res.json()) as {
    terminals?: Array<{ id: string }>;
    data?: Array<{ id: string }>;
  };
  const list = body.terminals ?? body.data ?? [];
  return list[0]?.id ?? null;
}

/**
 * Returns the first employee id available for the seed admin tenant.
 */
export async function findFirstEmployeeId(
  ctx: APIRequestContext
): Promise<string | null> {
  const res = await ctx.get('/v1/hr/employees', {
    params: { page: '1', limit: '1' },
  });
  if (!res.ok()) return null;
  const body = (await res.json()) as {
    employees?: Array<{ id: string }>;
    data?: Array<{ id: string }>;
  };
  const list = body.employees ?? body.data ?? [];
  return list[0]?.id ?? null;
}

/**
 * Counts conflicts in PENDING_RESOLUTION state for the seed tenant.
 * Returns 0 if endpoint is unreachable.
 */
export async function countPendingConflicts(
  ctx: APIRequestContext
): Promise<number> {
  const res = await ctx.get('/v1/admin/pos/conflicts', {
    params: { page: '1', limit: '1', status: 'PENDING_RESOLUTION' },
  });
  if (!res.ok()) return 0;
  const body = (await res.json()) as { meta?: { total?: number } };
  return body.meta?.total ?? 0;
}
