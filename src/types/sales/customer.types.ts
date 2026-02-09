// Customer Types

export type CustomerType = 'INDIVIDUAL' | 'BUSINESS';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateCustomerRequest {
  name: string;
  type: CustomerType;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

export interface CustomersResponse {
  customers: Customer[];
}

export interface CustomerResponse {
  customer: Customer;
}
