import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
    ItemEntryResponse,
    ItemExitResponse,
    ItemMovementsQuery,
    ItemMovementsResponse,
    ItemResponse,
    ItemsResponse,
    ItemTransferResponse,
    RegisterItemEntryRequest,
    RegisterItemExitRequest,
    TransferItemRequest,
} from '@/types/stock';

export const itemsService = {
  // GET /v1/items or /v1/items?variantId=:variantId
  async listItems(variantId?: string): Promise<ItemsResponse> {
    const url = variantId
      ? `${API_ENDPOINTS.ITEMS.LIST}?variantId=${variantId}`
      : API_ENDPOINTS.ITEMS.LIST;
    return apiClient.get<ItemsResponse>(url);
  },

  // GET /v1/items/:itemId
  async getItem(itemId: string): Promise<ItemResponse> {
    return apiClient.get<ItemResponse>(API_ENDPOINTS.ITEMS.GET(itemId));
  },

  // POST /v1/items/entry
  async registerEntry(
    data: RegisterItemEntryRequest
  ): Promise<ItemEntryResponse> {
    return apiClient.post<ItemEntryResponse>(API_ENDPOINTS.ITEMS.ENTRY, data);
  },

  // POST /v1/items/exit
  async registerExit(data: RegisterItemExitRequest): Promise<ItemExitResponse> {
    return apiClient.post<ItemExitResponse>(API_ENDPOINTS.ITEMS.EXIT, data);
  },

  // POST /v1/items/transfer
  async transferItem(data: TransferItemRequest): Promise<ItemTransferResponse> {
    return apiClient.post<ItemTransferResponse>(
      API_ENDPOINTS.ITEMS.TRANSFER,
      data
    );
  },

  // DELETE /v1/items/:itemId
  async deleteItem(itemId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.ITEMS.DELETE(itemId));
  },
};

export const itemMovementsService = {
  // GET /v1/item-movements
  async listMovements(
    query?: ItemMovementsQuery
  ): Promise<ItemMovementsResponse> {
    return apiClient.get<ItemMovementsResponse>(
      API_ENDPOINTS.ITEM_MOVEMENTS.LIST,
      { params: query as Record<string, string> }
    );
  },
};
