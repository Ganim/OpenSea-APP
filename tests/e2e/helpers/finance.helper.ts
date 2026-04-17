/**
 * Finance E2E helpers (P2-64).
 *
 * Centralizes API fixtures (create/delete via REST) plus shared UI helpers
 * for finance specs. Mirrors the structure of stock.helper.ts so a single
 * pattern is reused across modules.
 */
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { API_URL } from './auth.helper';

// ─── Sleep ──────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Fetch with retry (rate limit handling) ─────────────────────────────

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 5
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, options);
    } catch (err) {
      if (attempt < maxRetries) {
        await sleep((attempt + 1) * 3_000);
        continue;
      }
      throw err;
    }

    if (res.ok) return res;

    if (res.status === 429 || res.status === 500) {
      const body = await res.text();
      if (body.includes('Rate limit') || res.status === 429) {
        const match = body.match(/retry in (\d+)/);
        const waitSec = match ? parseInt(match[1], 10) + 2 : (attempt + 1) * 5;
        await sleep(waitSec * 1_000);
        continue;
      }
      return new Response(body, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    }

    return res;
  }

  throw new Error(`Max retries exceeded for ${url}`);
}

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function jsonOrThrow<T>(res: Response, action: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`${action} failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as T;
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Bank Accounts
// ═════════════════════════════════════════════════════════════════════════

export type BankAccountType =
  | 'CHECKING'
  | 'SAVINGS'
  | 'SALARY'
  | 'PAYMENT'
  | 'INVESTMENT'
  | 'DIGITAL'
  | 'OTHER';

export interface BankAccountPayload {
  name: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: BankAccountType;
  bankName?: string;
  agencyDigit?: string;
  accountDigit?: string;
  isDefault?: boolean;
  chartOfAccountId?: string;
}

export async function createBankAccountViaApi(
  token: string,
  payload: BankAccountPayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/bank-accounts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{ bankAccount: { id: string; name: string } }>(
    res,
    'Create bank account'
  );
  return { id: data.bankAccount.id, name: data.bankAccount.name };
}

export async function deleteBankAccountViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(
    `${API_URL}/v1/finance/bank-accounts/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete bank account failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Cost Centers
// ═════════════════════════════════════════════════════════════════════════

export interface CostCenterPayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  monthlyBudget?: number;
}

export async function createCostCenterViaApi(
  token: string,
  payload: CostCenterPayload
): Promise<{ id: string; code: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/cost-centers`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{
    costCenter: { id: string; code: string; name: string };
  }>(res, 'Create cost center');
  return data.costCenter;
}

export async function deleteCostCenterViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/cost-centers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete cost center failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Finance Categories
// ═════════════════════════════════════════════════════════════════════════

export interface FinanceCategoryPayload {
  name: string;
  slug: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  chartOfAccountId?: string;
}

export async function createFinanceCategoryViaApi(
  token: string,
  payload: FinanceCategoryPayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/categories`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{ category: { id: string; name: string } }>(
    res,
    'Create finance category'
  );
  return data.category;
}

export async function deleteFinanceCategoryViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete finance category failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Finance Entries
// ═════════════════════════════════════════════════════════════════════════

export interface FinanceEntryPayload {
  type: 'PAYABLE' | 'RECEIVABLE';
  code: string;
  description: string;
  categoryId: string;
  expectedAmount: number;
  issueDate: string;
  dueDate: string;
  costCenterId?: string;
  bankAccountId?: string;
  companyId?: string;
}

export async function createFinanceEntryViaApi(
  token: string,
  payload: FinanceEntryPayload
): Promise<{ id: string; code: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/entries`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{ entry: { id: string; code: string } }>(
    res,
    'Create finance entry'
  );
  return data.entry;
}

export async function deleteFinanceEntryViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/entries/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete finance entry failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Loans
// ═════════════════════════════════════════════════════════════════════════

export interface LoanPayload {
  name: string;
  type:
    | 'PERSONAL'
    | 'BUSINESS'
    | 'WORKING_CAPITAL'
    | 'EQUIPMENT'
    | 'REAL_ESTATE'
    | 'CREDIT_LINE'
    | 'OTHER';
  bankAccountId: string;
  costCenterId: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  totalInstallments: number;
  installmentDay?: number;
  contractNumber?: string;
}

export async function createLoanViaApi(
  token: string,
  payload: LoanPayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/loans`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{ loan: { id: string; name: string } }>(
    res,
    'Create loan'
  );
  return data.loan;
}

export async function deleteLoanViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/loans/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Delete loan failed (${res.status}): ${await res.text()}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Period Locks
// ═════════════════════════════════════════════════════════════════════════

export interface PeriodLockPayload {
  year: number;
  month: number;
  reason?: string;
}

export async function createPeriodLockViaApi(
  token: string,
  payload: PeriodLockPayload
): Promise<{ id: string; year: number; month: number }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/period-locks`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{
    lock: { id: string; year: number; month: number };
  }>(res, 'Create period lock');
  return data.lock;
}

export async function deletePeriodLockViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/period-locks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete period lock failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Recurring Configurations
// ═════════════════════════════════════════════════════════════════════════

export type RecurringFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUAL'
  | 'ANNUAL';

export interface RecurringConfigPayload {
  type: 'PAYABLE' | 'RECEIVABLE';
  description: string;
  categoryId: string;
  expectedAmount: number;
  frequencyUnit: RecurringFrequency;
  startDate: string;
  costCenterId?: string;
  bankAccountId?: string;
  totalOccurrences?: number;
  endDate?: string;
}

export async function createRecurringConfigViaApi(
  token: string,
  payload: RecurringConfigPayload
): Promise<{ id: string; description: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/recurring`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{
    recurring: { id: string; description: string };
  }>(res, 'Create recurring config');
  return data.recurring;
}

export async function cancelRecurringConfigViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(
    `${API_URL}/v1/finance/recurring/${id}/cancel`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    }
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Cancel recurring config failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Payment Orders
// ═════════════════════════════════════════════════════════════════════════

export interface PaymentOrderPayload {
  entryId: string;
  bankAccountId: string;
  method: 'PIX' | 'TED' | 'BOLETO';
  amount: number;
  recipientData: Record<string, unknown>;
}

export async function createPaymentOrderViaApi(
  token: string,
  payload: PaymentOrderPayload
): Promise<{ id: string; status: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/finance/payment-orders`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow<{
    paymentOrder: { id: string; status: string };
  }>(res, 'Create payment order');
  return data.paymentOrder;
}

// ═════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═════════════════════════════════════════════════════════════════════════

export async function navigateToFinancePage(
  page: Page,
  route: string
): Promise<void> {
  const path = route.startsWith('/') ? route : `/finance/${route}`;
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

export async function waitForToast(
  page: Page,
  text: string,
  timeout = 10_000
): Promise<Locator> {
  const toast = page.locator(`[data-sonner-toast] :text("${text}")`).first();
  await expect(toast).toBeVisible({ timeout });
  return toast;
}

/**
 * Returns true when the current page renders ANY known page-shell selector.
 * Used as a smoke check that "the route resolved without crashing".
 */
export async function expectFinanceShellVisible(page: Page): Promise<void> {
  const shell = page.locator(
    'main, [data-testid="page-layout"], [class*="PageLayout"]'
  );
  await expect(shell.first()).toBeVisible({ timeout: 15_000 });
}

/**
 * Generates a deterministic-but-unique suffix so parallel/repeated runs do
 * not collide on unique-constrained columns (code, slug, accountNumber).
 */
export function uniqueSuffix(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
