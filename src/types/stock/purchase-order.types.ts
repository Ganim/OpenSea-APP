// Purchase Order Types

export type PurchaseOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalPrice: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreatePurchaseOrderRequest {
  orderNumber: string;
  supplierId: string;
  status?: PurchaseOrderStatus;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
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
