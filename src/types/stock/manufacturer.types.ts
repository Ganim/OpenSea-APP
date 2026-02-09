// Manufacturer Types

export interface Manufacturer {
  id: string;
  code: string; // Codigo hierarquico auto-gerado (3 digitos: 001)
  sequentialCode?: number;
  name: string;
  legalName?: string;
  cnpj?: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateManufacturerRequest {
  name: string;
  legalName?: string;
  cnpj?: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface UpdateManufacturerRequest {
  name?: string;
  legalName?: string;
  cnpj?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface ManufacturersResponse {
  manufacturers: Manufacturer[];
}

export interface ManufacturerResponse {
  manufacturer: Manufacturer;
}
