// ============================================
// WAREHOUSE (Armazém) TYPES
// ============================================

export interface Warehouse {
  id: string;
  code: string; // "FAB" - único, 2-5 chars
  name: string; // "Fábrica Principal"
  description?: string;
  address?: string; // Endereço físico

  // Metadados
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Estatísticas (calculadas)
  stats?: WarehouseStats;
}

export interface WarehouseStats {
  totalZones: number;
  totalBins: number;
  occupiedBins: number;
  occupancyPercentage: number;
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  description?: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateWarehouseRequest {
  code?: string;
  name?: string;
  description?: string;
  address?: string;
  isActive?: boolean;
}

export interface WarehouseResponse {
  warehouse: Warehouse;
}

export interface WarehousesResponse {
  warehouses: Warehouse[];
}

// ============================================
// Form Types
// ============================================

export interface WarehouseFormData {
  code: string;
  name: string;
  description: string;
  address: string;
  isActive: boolean;
}

export const defaultWarehouseFormData: WarehouseFormData = {
  code: '',
  name: '',
  description: '',
  address: '',
  isActive: true,
};
