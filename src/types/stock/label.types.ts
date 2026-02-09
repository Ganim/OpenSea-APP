// Label Generation Types

export interface GenerateLabelRequest {
  entityType: 'ITEM' | 'VARIANT' | 'PRODUCT' | 'VOLUME' | 'LOCATION';
  entityIds: string[];
  labelType: 'QR' | 'BARCODE' | 'COMBINED';
  format?: 'PDF' | 'PNG' | 'ZPL';
  template?: string;
  options?: {
    includePrice?: boolean;
    includeName?: boolean;
    includeLocation?: boolean;
    copies?: number;
  };
}

export interface GenerateLabelResponse {
  labels: Array<{
    entityId: string;
    labelUrl?: string;
    labelData?: string; // Base64 or ZPL
  }>;
}
