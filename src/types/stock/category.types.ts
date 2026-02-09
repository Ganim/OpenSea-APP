// Category & Tag Types

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  description?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string | null;
  parentId?: string;
  displayOrder?: number;
  isActive: boolean;
  childrenCount?: number;
  productCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  iconUrl?: string | null;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface TagsResponse {
  tags: Tag[];
}

export interface TagResponse {
  tag: Tag;
}
