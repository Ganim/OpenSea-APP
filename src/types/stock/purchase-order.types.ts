// Purchase Order Types

export type PurchaseOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  createdBy?: string | null;
  status: PurchaseOrderStatus;
  totalCost: number;
  expectedDate?: string | null;
  receivedDate?: string | null;
  notes?: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreatePurchaseOrderRequest {
  orderNumber: string;
  supplierId: string;
  expectedDate?: string;
  status?: PurchaseOrderStatus;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export interface UpdatePurchaseOrderStatusRequest {
  status: PurchaseOrderStatus;
}

export interface PurchaseOrdersResponse {
  purchaseOrders: PurchaseOrder[];
}

export interface PurchaseOrderResponse {
  purchaseOrder: PurchaseOrder;
}
