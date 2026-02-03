import type { Tag } from '@/types/stock';

export interface TagFormData {
  name: string;
  description?: string;
  color?: string;
}

export type { Tag };
