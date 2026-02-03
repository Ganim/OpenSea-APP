import type { Variant } from '@/types/stock';

export function formatVariantInfo(variant: Variant): string {
  return `${variant.sku} • ${variant.name || 'Sem nome'}`;
}
