// POS Terminal Zone (Emporion Fase 1)
// Maps which Zones are linked to a POS Terminal and their tier (PRIMARY or SECONDARY).

export type PosZoneTier = 'PRIMARY' | 'SECONDARY';

export interface PosTerminalZone {
  id: string;
  terminalId: string;
  zoneId: string;
  tier: PosZoneTier;
  tenantId: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Zone link enriched with the related Zone fields (name, code, fractional flag,
 * warehouse), used by the POS Terminal "Zonas" tab.
 */
export interface PosTerminalZoneWithZone extends PosTerminalZone {
  zone: {
    id: string;
    name: string;
    code: string;
    allowsFractionalSale: boolean;
    warehouseId: string;
    warehouseName?: string;
  };
}

export interface AssignTerminalZoneRequest {
  tier: PosZoneTier;
}

export interface AssignTerminalZoneResponse {
  terminalZone: PosTerminalZone;
}

export interface ListTerminalZonesResponse {
  zones: PosTerminalZoneWithZone[];
}
