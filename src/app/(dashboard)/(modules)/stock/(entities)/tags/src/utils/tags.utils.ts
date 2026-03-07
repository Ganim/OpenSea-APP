import type { Tag } from '@/types/stock';

export function formatTagWithColor(tag: Tag): string {
  return `${tag.name} (${tag.color || '#default'})`;
}
