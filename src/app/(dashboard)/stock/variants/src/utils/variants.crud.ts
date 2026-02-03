import { variantsService } from '@/services/stock';
import type {
  CreateVariantRequest,
  UpdateVariantRequest,
  Variant,
} from '@/types/stock';

export async function createVariant(
  data: CreateVariantRequest
): Promise<Variant> {
  const response = await variantsService.createVariant(data);
  return response.variant;
}

export async function getVariant(id: string): Promise<Variant> {
  const response = await variantsService.getVariant(id);
  return response.variant;
}

export async function listVariants(): Promise<Variant[]> {
  const response = await variantsService.listVariants();
  return response.variants;
}

export async function updateVariant(
  id: string,
  data: UpdateVariantRequest
): Promise<Variant> {
  const response = await variantsService.updateVariant(id, data);
  return response.variant;
}

export async function deleteVariant(id: string): Promise<void> {
  await variantsService.deleteVariant(id);
}
