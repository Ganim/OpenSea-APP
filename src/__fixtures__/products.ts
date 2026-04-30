export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
}

export const mockProduct = (
  overrides: Partial<MockProduct> = {}
): MockProduct => ({
  id: 'prod-1',
  name: 'Camiseta Algodão Premium',
  sku: 'CAM-001',
  price: 89.9,
  stock: 42,
  active: true,
  createdAt: '2026-04-01T10:00:00.000Z',
  ...overrides,
});

// Deterministic generator (seeded from index) — stories must render
// identically every run, otherwise visual regression tests + Storybook
// snapshots break on benign re-renders.
export const mockProducts = (count: number): MockProduct[] =>
  Array.from({ length: count }, (_, i) =>
    mockProduct({
      id: `prod-${i + 1}`,
      name: `Produto Demo ${i + 1}`,
      sku: `DEMO-${String(i + 1).padStart(3, '0')}`,
      price: Math.round((50 + ((i * 37) % 500)) * 100) / 100,
      stock: ((i * 13) % 200) + 5,
    })
  );
