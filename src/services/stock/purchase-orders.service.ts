import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderResponse,
  PurchaseOrdersResponse,
  PurchaseOrderStatus,
  PaginationMeta,
} from '@/types/stock';

export interface PurchaseOrdersQuery {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPurchaseOrdersResponse {
  purchaseOrders: PurchaseOrder[];
  pagination: PaginationMeta;
}

export const purchaseOrdersService = {
  // GET /v1/purchase-orders - List all purchase orders
  async list(
    query?: PurchaseOrdersQuery
  ): Promise<PaginatedPurchaseOrdersResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);
    if (query?.supplierId) params.append('supplierId', query.supplierId);
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const url = params.toString()
      ? `${API_ENDPOINTS.PURCHASE_ORDERS.LIST}?${params.toString()}`
      : API_ENDPOINTS.PURCHASE_ORDERS.LIST;

    return apiClient.get<PaginatedPurchaseOrdersResponse>(url);
  },

  // GET /v1/purchase-orders (legacy - no pagination)
  async listAll(): Promise<PurchaseOrdersResponse> {
    return apiClient.get<PurchaseOrdersResponse>(
      API_ENDPOINTS.PURCHASE_ORDERS.LIST
    );
  },

  // GET /v1/purchase-orders/:id
  async get(id: string): Promise<PurchaseOrderResponse> {
    return apiClient.get<PurchaseOrderResponse>(
      API_ENDPOINTS.PURCHASE_ORDERS.GET(id)
    );
  },

  // POST /v1/purchase-orders
  async create(
    data: CreatePurchaseOrderRequest
  ): Promise<PurchaseOrderResponse> {
    return apiClient.post<PurchaseOrderResponse>(
      API_ENDPOINTS.PURCHASE_ORDERS.CREATE,
      data
    );
  },

  // PATCH /v1/purchase-orders/:id/status
  async updateStatus(
    id: string,
    status: PurchaseOrderStatus
  ): Promise<PurchaseOrderResponse> {
    return apiClient.patch<PurchaseOrderResponse>(
      API_ENDPOINTS.PURCHASE_ORDERS.UPDATE_STATUS(id),
      { status }
    );
  },

  // POST /v1/purchase-orders/:id/cancel
  async cancel(id: string): Promise<PurchaseOrderResponse> {
    return apiClient.post<PurchaseOrderResponse>(
      `${API_ENDPOINTS.PURCHASE_ORDERS.GET(id)}/cancel`,
      {}
    );
  },

  // POST /v1/purchase-orders/:id/receive - Receive items from purchase order
  async receive(
    id: string,
    items: Array<{ itemId: string; receivedQuantity: number }>
  ): Promise<PurchaseOrderResponse> {
    return apiClient.post<PurchaseOrderResponse>(
      `${API_ENDPOINTS.PURCHASE_ORDERS.GET(id)}/receive`,
      { items }
    );
  },
};
