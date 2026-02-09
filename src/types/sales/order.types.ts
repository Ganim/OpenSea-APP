// Sales Order Types

export type SalesOrderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  variantId: string;
  itemId?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes?: string | null;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  createdBy?: string | null;
  status: SalesOrderStatus;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  notes?: string | null;
  items: SalesOrderItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  orderNumber: string;
  status?: 'DRAFT' | 'PENDING' | 'CONFIRMED';
  discount?: number;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    notes?: string;
  }>;
  createdBy?: string;
}

export interface UpdateSalesOrderStatusRequest {
  status: SalesOrderStatus;
}

export interface SalesOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SalesOrdersResponse {
  salesOrders: SalesOrder[];
}

export interface SalesOrderResponse {
  salesOrder: SalesOrder;
}
