// ============================================
// QUERY KEYS
// ============================================

export const QUERY_KEYS = {
  // Warehouses
  warehouses: ['warehouses'] as const,
  warehouse: (id: string) => ['warehouses', id] as const,
  warehouseZones: (warehouseId: string) =>
    ['warehouses', warehouseId, 'zones'] as const,

  // Zones
  zones: ['zones'] as const,
  zone: (id: string) => ['zones', id] as const,
  zoneStructure: (zoneId: string) => ['zones', zoneId, 'structure'] as const,
  zoneLayout: (zoneId: string) => ['zones', zoneId, 'layout'] as const,
  zoneBins: (zoneId: string) => ['zones', zoneId, 'bins'] as const,
  zoneOccupancy: (zoneId: string) => ['zones', zoneId, 'occupancy'] as const,
  zoneItemStats: (zoneId: string) => ['zones', zoneId, 'item-stats'] as const,
  zoneReconfigPreview: (zoneId: string) => ['zones', zoneId, 'reconfig-preview'] as const,

  // Bins
  bins: ['bins'] as const,
  bin: (id: string) => ['bins', id] as const,
  binByAddress: (address: string) => ['bins', 'address', address] as const,
  binDetail: (id: string) => ['bins', id, 'detail'] as const,
  binSearch: (query: string) => ['bins', 'search', query] as const,
  binSuggestions: (partial: string) =>
    ['bins', 'suggestions', partial] as const,

  // Labels
  labelPreview: (binId: string) => ['labels', 'preview', binId] as const,
};

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Warehouses
  warehouses: {
    list: '/v1/warehouses',
    get: (id: string) => `/v1/warehouses/${id}`,
    create: '/v1/warehouses',
    update: (id: string) => `/v1/warehouses/${id}`,
    delete: (id: string) => `/v1/warehouses/${id}`,
  },

  // Zones
  zones: {
    list: '/v1/zones',
    listByWarehouse: (warehouseId: string) =>
      `/v1/zones?warehouseId=${warehouseId}`,
    get: (id: string) => `/v1/zones/${id}`,
    create: '/v1/zones',
    update: (id: string) => `/v1/zones/${id}`,
    delete: (id: string) => `/v1/zones/${id}`,
    structure: (id: string) => `/v1/zones/${id}/structure`,
    structurePreview: (id: string) => `/v1/zones/${id}/structure/preview`,
    layout: (id: string) => `/v1/zones/${id}/layout`,
    layoutReset: (id: string) => `/v1/zones/${id}/layout/reset`,
    reconfigPreview: (id: string) => `/v1/zones/${id}/reconfiguration-preview`,
    itemStats: (id: string) => `/v1/zones/${id}/item-stats`,
  },

  // Bins
  bins: {
    list: '/v1/bins',
    listByZone: (zoneId: string) => `/v1/bins?zoneId=${zoneId}`,
    get: (id: string) => `/v1/bins/${id}`,
    getByAddress: (address: string) => `/v1/bins/address/${address}`,
    update: (id: string) => `/v1/bins/${id}`,
    block: (id: string) => `/v1/bins/${id}/block`,
    unblock: (id: string) => `/v1/bins/${id}/unblock`,
    search: '/v1/bins/search',
    available: '/v1/bins/available',
    occupancy: '/v1/bins/occupancy',
    occupancyByZone: (zoneId: string) => `/v1/bins/occupancy?zoneId=${zoneId}`,
    suggest: '/v1/address/suggest',
  },

  // Labels
  labels: {
    generate: '/v1/labels/generate',
    generateByZone: '/v1/labels/generate-by-zone',
    preview: (binId: string) => `/v1/labels/preview/${binId}`,
  },

  // Address utilities
  address: {
    parse: (address: string) => `/v1/address/parse/${address}`,
    validate: (address: string) => `/v1/address/validate/${address}`,
  },

  // Items (movimentação)
  items: {
    list: '/v1/items',
    get: (id: string) => `/v1/items/${id}`,
    byVariant: (variantId: string) => `/v1/items/by-variant/${variantId}`,
    byProduct: (productId: string) => `/v1/items/by-product/${productId}`,
    entry: '/v1/items/entry',
    exit: '/v1/items/exit',
    transfer: '/v1/items/transfer',
  },

  // Item Movements (histórico)
  itemMovements: {
    list: '/v1/item-movements',
  },

  // Item Reservations
  itemReservations: {
    list: '/v1/item-reservations',
    get: (id: string) => `/v1/item-reservations/${id}`,
    release: (id: string) => `/v1/item-reservations/${id}/release`,
  },
};
