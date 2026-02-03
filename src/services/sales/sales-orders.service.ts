import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CommentResponse,
  CommentsResponse,
  CreateCommentRequest,
  CreateSalesOrderRequest,
  SalesOrderResponse,
  SalesOrdersResponse,
  UpdateCommentRequest,
  UpdateSalesOrderStatusRequest,
} from '@/types/sales';

// Sales Orders Service
export const salesOrdersService = {
  // GET /v1/sales-orders
  async listSalesOrders(): Promise<SalesOrdersResponse> {
    return apiClient.get<SalesOrdersResponse>(API_ENDPOINTS.SALES_ORDERS.LIST);
  },

  // GET /v1/sales-orders/:id
  async getSalesOrder(id: string): Promise<SalesOrderResponse> {
    return apiClient.get<SalesOrderResponse>(
      API_ENDPOINTS.SALES_ORDERS.GET(id)
    );
  },

  // POST /v1/sales-orders
  async createSalesOrder(
    data: CreateSalesOrderRequest
  ): Promise<SalesOrderResponse> {
    return apiClient.post<SalesOrderResponse>(
      API_ENDPOINTS.SALES_ORDERS.CREATE,
      data
    );
  },

  // PATCH /v1/sales-orders/:id/status
  async updateSalesOrderStatus(
    id: string,
    data: UpdateSalesOrderStatusRequest
  ): Promise<SalesOrderResponse> {
    return apiClient.put<SalesOrderResponse>(
      API_ENDPOINTS.SALES_ORDERS.UPDATE_STATUS(id),
      data
    );
  },

  // DELETE /v1/sales-orders/:id
  async deleteSalesOrder(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.SALES_ORDERS.DELETE(id));
  },
};

// Comments Service
export const commentsService = {
  // GET /v1/comments/:salesOrderId
  async listComments(salesOrderId: string): Promise<CommentsResponse> {
    return apiClient.get<CommentsResponse>(
      API_ENDPOINTS.COMMENTS.LIST(salesOrderId)
    );
  },

  // GET /v1/comments/comment/:commentId
  async getComment(commentId: string): Promise<CommentResponse> {
    return apiClient.get<CommentResponse>(
      API_ENDPOINTS.COMMENTS.GET(commentId)
    );
  },

  // POST /v1/comments
  async createComment(data: CreateCommentRequest): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(API_ENDPOINTS.COMMENTS.CREATE, data);
  },

  // PATCH /v1/comments/:commentId
  async updateComment(
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse> {
    return apiClient.put<CommentResponse>(
      API_ENDPOINTS.COMMENTS.UPDATE(commentId),
      data
    );
  },

  // DELETE /v1/comments/:commentId
  async deleteComment(commentId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.COMMENTS.DELETE(commentId));
  },
};
