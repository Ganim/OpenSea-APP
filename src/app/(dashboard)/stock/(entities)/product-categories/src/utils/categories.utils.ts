/**
 * Product Categories Module Utilities
 */

import type { Category } from '@/types/stock';

export function getCategoryPath(
  category: Category,
  allCategories: Category[]
): string {
  const path: string[] = [category.name];
  let current = category;

  while (current.parentId) {
    const parent = allCategories.find(c => c.id === current.parentId);
    if (!parent) break;
    path.unshift(parent.name);
    current = parent;
  }

  return path.join(' > ');
}

export function isChildCategory(
  childId: string,
  parentId: string,
  allCategories: Category[]
): boolean {
  const child = allCategories.find(c => c.id === childId);
  if (!child || !child.parentId) return false;
  if (child.parentId === parentId) return true;
  return isChildCategory(child.parentId, parentId, allCategories);
}
