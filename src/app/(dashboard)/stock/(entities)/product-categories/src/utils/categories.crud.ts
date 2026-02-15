/**
 * Product Categories Module CRUD Operations
 */

import { categoriesService } from '@/services/stock';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/stock';

export async function createCategory(
  data: CreateCategoryRequest
): Promise<Category> {
  const response = await categoriesService.createCategory(data);
  return response.category;
}

export async function getCategory(id: string): Promise<Category> {
  const response = await categoriesService.getCategory(id);
  return response.category;
}

export async function listCategories(): Promise<Category[]> {
  const response = await categoriesService.listCategories();
  return response.categories;
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest
): Promise<Category> {
  const response = await categoriesService.updateCategory(id, data);
  return response.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await categoriesService.deleteCategory(id);
}
