import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  ScanRequest,
  ScanResult,
  BatchScanRequest,
  BatchScanResponse,
} from '@/types/stock';

export const scanService = {
  // POST /v1/scan
  async scan(data: ScanRequest): Promise<ScanResult> {
    return apiClient.post<ScanResult>(API_ENDPOINTS.SCAN.SINGLE, data);
  },

  // POST /v1/scan/batch
  async scanBatch(data: BatchScanRequest): Promise<BatchScanResponse> {
    return apiClient.post<BatchScanResponse>(API_ENDPOINTS.SCAN.BATCH, data);
  },

  // Convenience method for quick scan without context
  async quickScan(code: string): Promise<ScanResult> {
    return this.scan({ code, context: 'INFO' });
  },

  // Convenience method for entry context
  async scanForEntry(code: string): Promise<ScanResult> {
    return this.scan({ code, context: 'ENTRY' });
  },

  // Convenience method for exit context
  async scanForExit(code: string): Promise<ScanResult> {
    return this.scan({ code, context: 'EXIT' });
  },

  // Convenience method for transfer context
  async scanForTransfer(code: string): Promise<ScanResult> {
    return this.scan({ code, context: 'TRANSFER' });
  },

  // Convenience method for inventory context
  async scanForInventory(code: string): Promise<ScanResult> {
    return this.scan({ code, context: 'INVENTORY' });
  },
};
