import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface TextileConfig {
  defaultWastagePercent: number;
  defaultFabricWidth: number;
  sizeConsumptionFactors: Record<string, number>;
}

export interface CutPlanResult {
  layers: number;
  piecesPerLayer: number;
  totalFabricLength: number;
  wastePercent: number;
  pieces: Array<{ size: string; quantity: number }>;
}

export interface BundleTicket {
  bundleNumber: string;
  size: string;
  quantity: number;
  color: string;
  layer: number;
}

export const textileService = {
  async getConfig() {
    return apiClient.get<TextileConfig>(
      API_ENDPOINTS.PRODUCTION.TEXTILE.CONFIG,
    );
  },
  async generateCutPlan(data: {
    productionOrderId: string;
    fabricWidth?: number;
    wastagePercent?: number;
  }) {
    return apiClient.post<CutPlanResult>(
      API_ENDPOINTS.PRODUCTION.TEXTILE.CUT_PLAN,
      data,
    );
  },
  async generateBundleTickets(data: {
    productionOrderId: string;
    bundleSize?: number;
  }) {
    return apiClient.post<{ tickets: BundleTicket[] }>(
      API_ENDPOINTS.PRODUCTION.TEXTILE.BUNDLE_TICKETS,
      data,
    );
  },
};
