/**
 * Product Categories Module Types
 */

import type { Category } from '@/types/stock';

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoryGridCardProps {
  category: Category;
  isSelected: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onDoubleClick?: (id: string) => void;
}

export interface CategoryListCardProps {
  category: Category;
  isSelected: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onClick?: (id: string, event: React.MouseEvent) => void;
  onDoubleClick?: (id: string) => void;
}
