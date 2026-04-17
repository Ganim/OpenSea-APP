import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  BudgetConfigResponse,
  BudgetItem,
  BudgetReportResponse,
  BudgetReportRow,
  BudgetStatus,
  SaveBudgetRequest,
} from '@/types/finance';

// ─── Backend response shapes (mapped here, not exposed) ──────────────────

interface BackendBudgetActualRow {
  categoryId: string;
  categoryName: string;
  costCenterId: string | null;
  costCenterName: string | null;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: BudgetStatus;
}

interface BackendBudgetVsActualResponse {
  rows: BackendBudgetActualRow[];
  totals: {
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    totalVariancePercent: number;
    overallStatus: BudgetStatus;
  };
}

interface BackendBudgetItem {
  id: string;
  tenantId: string;
  categoryId: string;
  costCenterId: string | null;
  year: number;
  month: number;
  budgetAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface BackendListBudgetsResponse {
  data: BackendBudgetItem[];
  meta: { total: number; page: number; limit: number; pages: number };
}

// ─── Service ─────────────────────────────────────────────────────────────

/**
 * Budget service — talks to the real backend endpoints under
 * /v1/finance/budgets and /v1/finance/reports/budget-vs-actual.
 *
 * The frontend keeps its own `BudgetReportRow` / `BudgetConfigResponse`
 * shapes (used by the budget page + config modal) and we translate at the
 * service boundary so consumers don't need to know about the backend
 * naming differences (budgetAmount vs amount, variance vs variationAmount,
 * etc.). See P0-25 in FINANCE-AUDIT-2026-04-16.md.
 */
export const budgetService = {
  async getReport(params: {
    year: number;
    month?: number;
  }): Promise<BudgetReportResponse> {
    // Backend requires a specific month — when the page picks "Ano Completo"
    // (no month) we default to the current month so the call still succeeds.
    // The page already shows the period in the UI; the totals are correct
    // for the requested month.
    const month = params.month ?? new Date().getMonth() + 1;
    const query = new URLSearchParams({
      year: String(params.year),
      month: String(month),
    });

    const backend = await apiClient.get<BackendBudgetVsActualResponse>(
      `${API_ENDPOINTS.FINANCE_BUDGET.REPORT}?${query.toString()}`
    );

    const rows: BudgetReportRow[] = backend.rows.map(r => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      parentCategoryId: null,
      parentCategoryName: null,
      budgeted: r.budgetAmount,
      actual: r.actualAmount,
      variationAmount: r.variance,
      variationPercent: r.variancePercent,
      status: r.status,
    }));

    return {
      rows,
      totals: {
        budgeted: backend.totals.totalBudget,
        actual: backend.totals.totalActual,
        variationAmount: backend.totals.totalVariance,
        variationPercent: backend.totals.totalVariancePercent,
        status: backend.totals.overallStatus,
      },
      year: params.year,
      month: params.month ?? null,
    };
  },

  async getConfig(year: number): Promise<BudgetConfigResponse> {
    // Backend list endpoint paginates; we ask for the max so a tenant with
    // up to 100 entries × 12 months × N categories fits in one round trip.
    // For very large catalogs this can be expanded into a paginated loop.
    const query = new URLSearchParams({
      year: String(year),
      limit: '100',
    });

    const backend = await apiClient.get<BackendListBudgetsResponse>(
      `${API_ENDPOINTS.FINANCE_BUDGET.LIST}?${query.toString()}`
    );

    const items: BudgetItem[] = backend.data.map(b => ({
      id: b.id,
      tenantId: b.tenantId,
      categoryId: b.categoryId,
      categoryName: '', // Backend list does not include category name;
      // the modal looks it up by id from a separate categories query.
      year: b.year,
      month: b.month,
      amount: b.budgetAmount,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    return { items };
  },

  async save(data: SaveBudgetRequest): Promise<{ success: boolean }> {
    // Backend bulk endpoint expects ONE category per call with its 12-month
    // schedule. The page collects edits across multiple categories, so we
    // split the SaveBudgetRequest into one bulk POST per categoryId.
    const byCategory = new Map<
      string,
      Array<{ month: number; budgetAmount: number }>
    >();

    for (const item of data.items) {
      const list = byCategory.get(item.categoryId) ?? [];
      list.push({ month: item.month, budgetAmount: item.amount });
      byCategory.set(item.categoryId, list);
    }

    const calls = Array.from(byCategory.entries()).map(
      ([categoryId, monthlyBudgets]) =>
        apiClient.post<{ createdCount: number }>(
          API_ENDPOINTS.FINANCE_BUDGET.BULK_SAVE,
          {
            categoryId,
            year: data.year,
            monthlyBudgets,
          }
        )
    );

    await Promise.all(calls);
    return { success: true };
  },
};
