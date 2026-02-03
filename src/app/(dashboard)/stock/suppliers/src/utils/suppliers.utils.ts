import type { Supplier } from '@/types/stock';

export function formatSupplierInfo(supplier: Supplier): string {
  const parts = [supplier.name, supplier.city, supplier.cnpj].filter(Boolean);
  return parts.join(' • ');
}
