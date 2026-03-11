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
        const waitSec = match
          ? parseInt(match[1], 10) + 2
          : (attempt + 1) * 5;
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

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Tags
// ═════════════════════════════════════════════════════════════════════════

export interface TagPayload {
  name: string;
  description?: string;
  color?: string;
}

export async function createTagViaApi(
  token: string,
  payload: TagPayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Create tag failed (${res.status}): ${await res.text()}`
    );
  }

  const data = await res.json();
  const tag = data.tag ?? data;
  return { id: tag.id, name: tag.name };
}

export async function deleteTagViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/tags/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete tag failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Categories
// ═════════════════════════════════════════════════════════════════════════

export interface CategoryPayload {
  name: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function createCategoryViaApi(
  token: string,
  payload: CategoryPayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Create category failed (${res.status}): ${await res.text()}`
    );
  }

  const data = await res.json();
  const category = data.category ?? data;
  return { id: category.id, name: category.name };
}

export async function deleteCategoryViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete category failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Manufacturers
// ═════════════════════════════════════════════════════════════════════════

export interface ManufacturerPayload {
  name: string;
  legalName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  rating?: number;
}

export async function createManufacturerViaApi(
  token: string,
  payload: ManufacturerPayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/manufacturers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Create manufacturer failed (${res.status}): ${await res.text()}`
    );
  }

  const data = await res.json();
  const manufacturer = data.manufacturer ?? data;
  return { id: manufacturer.id, name: manufacturer.name };
}

export async function deleteManufacturerViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/manufacturers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete manufacturer failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Templates
// ═════════════════════════════════════════════════════════════════════════

export interface TemplatePayload {
  name: string;
  unitOfMeasure?: string;
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
}

export async function createTemplateViaApi(
  token: string,
  payload: TemplatePayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Create template failed (${res.status}): ${await res.text()}`
    );
  }

  const data = await res.json();
  const template = data.template ?? data;
  return { id: template.id, name: template.name };
}

export async function deleteTemplateViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/templates/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete template failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// UI HELPERS — Navigation
// ═════════════════════════════════════════════════════════════════════════

export async function navigateToStockPage(
  page: Page,
  entity: 'tags' | 'product-categories' | 'manufacturers' | 'templates' | 'products' | 'locations'
): Promise<void> {
  await page.goto(`/stock/${entity}`);
  await page.waitForLoadState('networkidle');
  // Wait for page heading to confirm page is loaded (not "Carregando...")
  await expect(
    page.getByRole('heading', { level: 1 })
  ).toBeVisible({ timeout: 15_000 });
}

// ═════════════════════════════════════════════════════════════════════════
// UI HELPERS — Toast
// ═════════════════════════════════════════════════════════════════════════

export async function waitForToast(
  page: Page,
  text: string,
  timeout = 10_000
): Promise<Locator> {
  const toast = page.locator(`[data-sonner-toast] :text("${text}")`).first();
  await expect(toast).toBeVisible({ timeout });
  return toast;
}

// ═════════════════════════════════════════════════════════════════════════
// UI HELPERS — Context Menu
// ═════════════════════════════════════════════════════════════════════════

export async function openContextMenu(
  page: Page,
  itemName: string
): Promise<void> {
  const card = page.locator(`text="${itemName}"`).first();
  await expect(card).toBeVisible({ timeout: 10_000 });
  await card.click({ button: 'right' });
  await page.waitForTimeout(300);
}

export async function clickContextAction(
  page: Page,
  actionLabel: string
): Promise<void> {
  const menuItem = page
    .locator('[role="menuitem"]')
    .filter({ hasText: actionLabel })
    .first();
  await expect(menuItem).toBeVisible({ timeout: 5_000 });
  // Radix context menus render outside viewport — focus + Enter
  await menuItem.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
}

// ═════════════════════════════════════════════════════════════════════════
// UI HELPERS — Dialogs
// ═════════════════════════════════════════════════════════════════════════

export async function confirmDelete(page: Page): Promise<void> {
  const deleteBtn = page
    .locator('[role="alertdialog"] button, [role="dialog"] button')
    .filter({ hasText: /^Excluir$/ })
    .first();
  await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
  await deleteBtn.click();
}

export async function cancelDialog(page: Page): Promise<void> {
  const cancelBtn = page
    .locator('[role="alertdialog"] button, [role="dialog"] button')
    .filter({ hasText: 'Cancelar' })
    .first();
  await expect(cancelBtn).toBeVisible({ timeout: 5_000 });
  await cancelBtn.click();
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Products
// ═════════════════════════════════════════════════════════════════════════

export interface ProductPayload {
  name: string;
  templateId: string;
  description?: string;
  status?: string;
  outOfLine?: boolean;
  attributes?: Record<string, unknown>;
  supplierId?: string;
  manufacturerId?: string;
  categoryIds?: string[];
}

export async function createProductViaApi(
  token: string,
  payload: ProductPayload
): Promise<{ id: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Create product failed (${res.status}): ${await res.text()}`
    );
  }

  const data = await res.json();
  const product = data.product ?? data;
  return { id: product.id, name: product.name };
}

export async function deleteProductViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete product failed (${res.status}): ${await res.text()}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════
// API HELPERS — Warehouses
// ═════════════════════════════════════════════════════════════════════════

export interface WarehousePayload {
  code: string;
  name: string;
  description?: string;
  address?: string;
  isActive?: boolean;
}

export async function createWarehouseViaApi(
  token: string,
  payload: WarehousePayload
): Promise<{ id: string; code: string; name: string }> {
  const res = await fetchWithRetry(`${API_URL}/v1/warehouses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Create warehouse failed (${res.status}): ${await res.text()}`
    );
  }

  const data = await res.json();
  const warehouse = data.warehouse ?? data;
  return { id: warehouse.id, code: warehouse.code, name: warehouse.name };
}

export async function deleteWarehouseViaApi(
  token: string,
  id: string
): Promise<void> {
  const res = await fetchWithRetry(`${API_URL}/v1/warehouses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Delete warehouse failed (${res.status}): ${await res.text()}`
    );
  }
}
