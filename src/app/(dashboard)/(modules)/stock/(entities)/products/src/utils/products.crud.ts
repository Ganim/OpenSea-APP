import { productsService } from '@/services/stock';
import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from '@/types/stock';

export async function createProduct(
  data: CreateProductRequest
): Promise<Product> {
  const response = await productsService.createProduct(data);
  return response.product;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await productsService.getProduct(id);
  return response.product;
}

export async function listProducts(): Promise<Product[]> {
  const response = await productsService.listProducts();
  return response.products;
}

export async function updateProduct(
  id: string,
  data: UpdateProductRequest
): Promise<Product> {
  const response = await productsService.updateProduct(id, data);
  return response.product;
}

export async function deleteProduct(id: string): Promise<void> {
  await productsService.deleteProduct(id);
}
