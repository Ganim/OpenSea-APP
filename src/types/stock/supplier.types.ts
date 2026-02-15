// Supplier Types

export interface Supplier {
  id: string;
  name: string;
  sequentialCode?: number;
  cnpj?: string;
  taxId?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  paymentTerms?: string;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateSupplierRequest {
  name: string;
  cnpj?: string;
  taxId?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  paymentTerms?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  cnpj?: string;
  taxId?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  paymentTerms?: string;
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
