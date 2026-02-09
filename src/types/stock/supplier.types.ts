// Supplier Types

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateSupplierRequest {
  name: string;
  cnpj?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  cnpj?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface SuppliersResponse {
  suppliers: Supplier[];
}

export interface SupplierResponse {
  supplier: Supplier;
}
