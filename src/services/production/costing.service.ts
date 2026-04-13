import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface ProductionCost {
  id: string;
  productionOrderId: string;
  costType: string;
  description: string | null;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCostSummary {
  totalPlanned: number;
  totalActual: number;
  totalVariance: number;
  costs: ProductionCost[];
}

export const costingService = {
  async list(productionOrderId: string) {
    return apiClient.get<{ costs: ProductionCost[] }>(
      `${API_ENDPOINTS.PRODUCTION.COSTING.LIST}?productionOrderId=${productionOrderId}`,
    );
  },
  async create(data: {
    productionOrderId: string;
    costType: string;
    description?: string;
    plannedAmount: number;
    actualAmount: number;
  }) {
    return apiClient.post<{ cost: ProductionCost }>(
      API_ENDPOINTS.PRODUCTION.COSTING.CREATE,
      data,
    );
  },
  async update(
    id: string,
    data: { actualAmount?: number; description?: string },
  ) {
    return apiClient.patch<{ cost: ProductionCost }>(
      API_ENDPOINTS.PRODUCTION.COSTING.UPDATE(id),
      data,
    );
  },
  async calculateOrderCost(orderId: string) {
    return apiClient.post<OrderCostSummary>(
      API_ENDPOINTS.PRODUCTION.COSTING.CALCULATE(orderId),
    );
  },
};
