import type {
  CreateManufacturerRequest,
  Manufacturer,
  UpdateManufacturerRequest,
} from '@/types/stock';
import { logger } from '@/lib/logger';
import { manufacturersApi } from '../api';

export async function createManufacturer(
  data: Partial<Manufacturer>
): Promise<Manufacturer> {
  const payload: CreateManufacturerRequest = {
    name: data.name || '',
    legalName: data.legalName ?? undefined,
    cnpj: data.cnpj ?? undefined,
    country: data.country || 'Brasil',
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    website: data.website ?? undefined,
    addressLine1: data.addressLine1 ?? undefined,
    addressLine2: data.addressLine2 ?? undefined,
    city: data.city ?? undefined,
    state: data.state ?? undefined,
    postalCode: data.postalCode ?? undefined,
    isActive: data.isActive ?? true,
    rating: data.rating ?? undefined,
    notes: data.notes ?? undefined,
  };
  return manufacturersApi.create(payload);
}

export async function updateManufacturer(
  id: string,
  data: Partial<Manufacturer>
): Promise<Manufacturer> {
  const payload: UpdateManufacturerRequest = {
    name: data.name ?? undefined,
    legalName: data.legalName ?? undefined,
    cnpj: data.cnpj ?? undefined,
    country: data.country ?? undefined,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    website: data.website ?? undefined,
    addressLine1: data.addressLine1 ?? undefined,
    addressLine2: data.addressLine2 ?? undefined,
    city: data.city ?? undefined,
    state: data.state ?? undefined,
    postalCode: data.postalCode ?? undefined,
    isActive: data.isActive ?? undefined,
    rating: data.rating ?? undefined,
    notes: data.notes ?? undefined,
  };
  return manufacturersApi.update(id, payload);
}

export async function deleteManufacturer(id: string): Promise<void> {
  try {
    await manufacturersApi.delete(id);
  } catch (error) {
    logger.error(
      '[deleteManufacturer] Erro ao deletar fabricante',
      error instanceof Error ? error : undefined
    );
    throw error;
  }
}

export async function duplicateManufacturer(
  id: string,
  override?: Partial<Manufacturer>
): Promise<Manufacturer> {
  const original = await manufacturersApi.get(id);

  const duplicatePayload: CreateManufacturerRequest = {
    name:
      override?.name || `${original.name} (Cópia)`.replace(/\s+/g, ' ').trim(),
    legalName: original.legalName ?? undefined,
    cnpj: original.cnpj ?? undefined,
    country: original.country ?? 'Brasil',
    email: original.email ?? undefined,
    phone: original.phone ?? undefined,
    website: original.website ?? undefined,
    addressLine1: original.addressLine1 ?? undefined,
    addressLine2: original.addressLine2 ?? undefined,
    city: original.city ?? undefined,
    state: original.state ?? undefined,
    postalCode: original.postalCode ?? undefined,
    isActive: original.isActive ?? undefined,
    rating: original.rating ?? undefined,
    notes: original.notes ?? undefined,
  };

  return manufacturersApi.create(duplicatePayload);
}
