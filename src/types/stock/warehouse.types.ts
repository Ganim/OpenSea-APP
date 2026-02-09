// Warehouse & Location Types

export type LocationType =
  | 'WAREHOUSE'
  | 'ZONE'
  | 'AISLE'
  | 'SHELF'
  | 'BIN'
  | 'OTHER';

/** @deprecated Use Warehouse -> Zone -> Bin hierarchy instead */
export interface Location {
  id: string;
  code: string;
  name?: string;
  type: LocationType;
  locationType?: string; // Campo da API
  parentId?: string;
  capacity?: number;
  currentOccupancy?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/** @deprecated Use Warehouse -> Zone -> Bin hierarchy instead */
export interface ApiLocation {
  id: string;
  code: string;
  titulo?: string; // Campo da API
  type: string; // Campo da API
  parentId?: string;
  capacity?: number;
  currentOccupancy?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/** @deprecated Use Warehouse -> Zone -> Bin hierarchy instead */
export interface CreateLocationRequest {
  titulo?: string;
  type?: LocationType;
  parentId?: string;
  capacity?: number;
  currentOccupancy?: number;
  isActive?: boolean;
}

/** @deprecated Use Warehouse -> Zone -> Bin hierarchy instead */
export interface UpdateLocationRequest {
  titulo?: string;
  type?: LocationType;
  parentId?: string;
  capacity?: number;
  currentOccupancy?: number;
  isActive?: boolean;
}

export interface LocationsResponse {
  locations: ApiLocation[];
}

export interface LocationResponse {
  location: ApiLocation;
}
