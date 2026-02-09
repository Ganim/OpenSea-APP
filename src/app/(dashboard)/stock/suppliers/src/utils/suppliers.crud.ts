import type {
  CreateSupplierRequest,
  Supplier,
  UpdateSupplierRequest,
} from '@/types/stock';
import { logger } from '@/lib/logger';
import { suppliersApi } from '../api';

/**
 * Gera um CNPJ aleatorio para duplicacao
 * Formato: XX.XXX.XXX/0001-XX
 */
function generateRandomCnpj(): string {
  const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const n1 = random(0, 9);
  const n2 = random(0, 9);
  const n3 = random(0, 9);
  const n4 = random(0, 9);
  const n5 = random(0, 9);
  const n6 = random(0, 9);
  const n7 = random(0, 9);
  const n8 = random(0, 9);
  const n9 = 0;
  const n10 = 0;
  const n11 = 0;
  const n12 = 1;

  // Calculo do primeiro digito verificador
  let d1 =
    n12 * 2 +
    n11 * 3 +
    n10 * 4 +
    n9 * 5 +
    n8 * 6 +
    n7 * 7 +
    n6 * 8 +
    n5 * 9 +
    n4 * 2 +
    n3 * 3 +
    n2 * 4 +
    n1 * 5;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;

  // Calculo do segundo digito verificador
  let d2 =
    d1 * 2 +
    n12 * 3 +
    n11 * 4 +
    n10 * 5 +
    n9 * 6 +
    n8 * 7 +
    n7 * 8 +
    n6 * 9 +
    n5 * 2 +
    n4 * 3 +
    n3 * 4 +
    n2 * 5 +
    n1 * 6;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;

  return `${n1}${n2}.${n3}${n4}${n5}.${n6}${n7}${n8}/${n9}${n10}${n11}${n12}-${d1}${d2}`;
}

export async function createSupplier(
  data: Partial<Supplier>
): Promise<Supplier> {
  const payload: CreateSupplierRequest = {
    name: data.name || '',
    cnpj: data.cnpj ?? undefined,
    taxId: data.taxId ?? undefined,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    website: data.website ?? undefined,
    addressLine1: data.addressLine1 ?? undefined,
    addressLine2: data.addressLine2 ?? undefined,
    city: data.city ?? undefined,
    state: data.state ?? undefined,
    postalCode: data.postalCode ?? undefined,
    country: data.country || 'Brasil',
    isActive: data.isActive ?? true,
    rating: data.rating ?? undefined,
    notes: data.notes ?? undefined,
  };
  return suppliersApi.create(payload);
}

export async function updateSupplier(
  id: string,
  data: Partial<Supplier>
): Promise<Supplier> {
  const payload: UpdateSupplierRequest = {
    name: data.name ?? undefined,
    cnpj: data.cnpj ?? undefined,
    taxId: data.taxId ?? undefined,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    website: data.website ?? undefined,
    addressLine1: data.addressLine1 ?? undefined,
    addressLine2: data.addressLine2 ?? undefined,
    city: data.city ?? undefined,
    state: data.state ?? undefined,
    postalCode: data.postalCode ?? undefined,
    country: data.country ?? undefined,
    isActive: data.isActive ?? undefined,
    rating: data.rating ?? undefined,
    notes: data.notes ?? undefined,
  };
  return suppliersApi.update(id, payload);
}

export async function deleteSupplier(id: string): Promise<void> {
  try {
    await suppliersApi.delete(id);
  } catch (error) {
    logger.error(
      '[deleteSupplier] Erro ao deletar fornecedor',
      error instanceof Error ? error : undefined
    );
    throw error;
  }
}

export async function duplicateSupplier(
  id: string,
  override?: Partial<Supplier>
): Promise<Supplier> {
  const original = await suppliersApi.get(id);

  // Gera um novo CNPJ para a copia
  const newCnpj = generateRandomCnpj();

  const duplicatePayload: CreateSupplierRequest = {
    name:
      override?.name || `${original.name} (Copia)`.replace(/\s+/g, ' ').trim(),
    cnpj: newCnpj, // CNPJ regenerado
    taxId: undefined, // Tax ID nao deve ser copiado
    email: original.email ?? undefined,
    phone: original.phone ?? undefined,
    website: original.website ?? undefined,
    addressLine1: original.addressLine1 ?? undefined,
    addressLine2: original.addressLine2 ?? undefined,
    city: original.city ?? undefined,
    state: original.state ?? undefined,
    postalCode: original.postalCode ?? undefined,
    country: original.country ?? undefined,
    isActive: original.isActive ?? undefined,
    rating: original.rating ?? undefined,
    notes: original.notes ?? undefined,
  };

  return suppliersApi.create(duplicatePayload);
}
