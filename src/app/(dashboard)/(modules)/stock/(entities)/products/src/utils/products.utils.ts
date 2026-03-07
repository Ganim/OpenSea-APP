import type { Product } from '@/types/stock';

export function formatProductInfo(product: Product): string {
  return `${product.name} • Template ID: ${product.templateId || 'Sem template'}`;
}
