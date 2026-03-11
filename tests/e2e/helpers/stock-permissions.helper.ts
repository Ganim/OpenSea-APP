import { createUserWithPermissions } from './permissions.helper';

// ─── Stock Permission Codes ─────────────────────────────────────────────

export const STOCK_PERMISSIONS = {
  // Tags
  TAGS_CREATE: 'stock.tags.create',
  TAGS_READ: 'stock.tags.read',
  TAGS_UPDATE: 'stock.tags.update',
  TAGS_DELETE: 'stock.tags.delete',
  TAGS_LIST: 'stock.tags.list',

  // Categories
  CATEGORIES_CREATE: 'stock.categories.create',
  CATEGORIES_READ: 'stock.categories.read',
  CATEGORIES_UPDATE: 'stock.categories.update',
  CATEGORIES_DELETE: 'stock.categories.delete',
  CATEGORIES_LIST: 'stock.categories.list',

  // Manufacturers
  MANUFACTURERS_CREATE: 'stock.manufacturers.create',
  MANUFACTURERS_READ: 'stock.manufacturers.read',
  MANUFACTURERS_UPDATE: 'stock.manufacturers.update',
  MANUFACTURERS_DELETE: 'stock.manufacturers.delete',
  MANUFACTURERS_LIST: 'stock.manufacturers.list',
  MANUFACTURERS_MANAGE: 'stock.manufacturers.manage',

  // Templates
  TEMPLATES_CREATE: 'stock.templates.create',
  TEMPLATES_READ: 'stock.templates.read',
  TEMPLATES_UPDATE: 'stock.templates.update',
  TEMPLATES_DELETE: 'stock.templates.delete',
  TEMPLATES_LIST: 'stock.templates.list',

  // Products
  PRODUCTS_CREATE: 'stock.products.create',
  PRODUCTS_READ: 'stock.products.read',
  PRODUCTS_UPDATE: 'stock.products.update',
  PRODUCTS_DELETE: 'stock.products.delete',
  PRODUCTS_LIST: 'stock.products.list',
  PRODUCTS_MANAGE: 'stock.products.manage',

  // Suppliers
  SUPPLIERS_CREATE: 'stock.suppliers.create',
  SUPPLIERS_READ: 'stock.suppliers.read',
  SUPPLIERS_UPDATE: 'stock.suppliers.update',
  SUPPLIERS_DELETE: 'stock.suppliers.delete',
  SUPPLIERS_LIST: 'stock.suppliers.list',

  // Items
  ITEMS_CREATE: 'stock.items.create',
  ITEMS_READ: 'stock.items.read',
  ITEMS_UPDATE: 'stock.items.update',
  ITEMS_DELETE: 'stock.items.delete',
  ITEMS_LIST: 'stock.items.list',
  ITEMS_MANAGE: 'stock.items.manage',

  // Variants
  VARIANTS_CREATE: 'stock.variants.create',
  VARIANTS_READ: 'stock.variants.read',
  VARIANTS_UPDATE: 'stock.variants.update',
  VARIANTS_DELETE: 'stock.variants.delete',
  VARIANTS_LIST: 'stock.variants.list',

  // Warehouses
  WAREHOUSES_CREATE: 'stock.warehouses.create',
  WAREHOUSES_READ: 'stock.warehouses.read',
  WAREHOUSES_UPDATE: 'stock.warehouses.update',
  WAREHOUSES_DELETE: 'stock.warehouses.delete',
  WAREHOUSES_LIST: 'stock.warehouses.list',

  // Zones
  ZONES_CREATE: 'stock.zones.create',
  ZONES_READ: 'stock.zones.read',
  ZONES_UPDATE: 'stock.zones.update',
  ZONES_DELETE: 'stock.zones.delete',
  ZONES_LIST: 'stock.zones.list',

  // UI Menu
  UI_MENU_STOCK: 'ui.menu.stock',
  UI_MENU_TAGS: 'ui.menu.stock.tags',
  UI_MENU_CATEGORIES: 'ui.menu.stock.categories',
  UI_MENU_MANUFACTURERS: 'ui.menu.stock.manufacturers',
  UI_MENU_TEMPLATES: 'ui.menu.stock.templates',
  UI_MENU_PRODUCTS: 'ui.menu.stock.products',
  UI_MENU_SUPPLIERS: 'ui.menu.stock.suppliers',
  UI_MENU_WAREHOUSES: 'ui.menu.stock.warehouses',
} as const;

// ─── Permission Groups ──────────────────────────────────────────────────

export const TAGS_FULL_PERMISSIONS = [
  STOCK_PERMISSIONS.TAGS_CREATE,
  STOCK_PERMISSIONS.TAGS_READ,
  STOCK_PERMISSIONS.TAGS_UPDATE,
  STOCK_PERMISSIONS.TAGS_DELETE,
  STOCK_PERMISSIONS.TAGS_LIST,
  STOCK_PERMISSIONS.UI_MENU_STOCK,
  STOCK_PERMISSIONS.UI_MENU_TAGS,
];

export const CATEGORIES_FULL_PERMISSIONS = [
  STOCK_PERMISSIONS.CATEGORIES_CREATE,
  STOCK_PERMISSIONS.CATEGORIES_READ,
  STOCK_PERMISSIONS.CATEGORIES_UPDATE,
  STOCK_PERMISSIONS.CATEGORIES_DELETE,
  STOCK_PERMISSIONS.CATEGORIES_LIST,
  STOCK_PERMISSIONS.UI_MENU_STOCK,
  STOCK_PERMISSIONS.UI_MENU_CATEGORIES,
];

export const MANUFACTURERS_FULL_PERMISSIONS = [
  STOCK_PERMISSIONS.MANUFACTURERS_CREATE,
  STOCK_PERMISSIONS.MANUFACTURERS_READ,
  STOCK_PERMISSIONS.MANUFACTURERS_UPDATE,
  STOCK_PERMISSIONS.MANUFACTURERS_DELETE,
  STOCK_PERMISSIONS.MANUFACTURERS_LIST,
  STOCK_PERMISSIONS.MANUFACTURERS_MANAGE,
  STOCK_PERMISSIONS.UI_MENU_STOCK,
  STOCK_PERMISSIONS.UI_MENU_MANUFACTURERS,
];

export const TEMPLATES_FULL_PERMISSIONS = [
  STOCK_PERMISSIONS.TEMPLATES_CREATE,
  STOCK_PERMISSIONS.TEMPLATES_READ,
  STOCK_PERMISSIONS.TEMPLATES_UPDATE,
  STOCK_PERMISSIONS.TEMPLATES_DELETE,
  STOCK_PERMISSIONS.TEMPLATES_LIST,
  STOCK_PERMISSIONS.UI_MENU_STOCK,
  STOCK_PERMISSIONS.UI_MENU_TEMPLATES,
];

export const PRODUCTS_FULL_PERMISSIONS = [
  STOCK_PERMISSIONS.PRODUCTS_CREATE,
  STOCK_PERMISSIONS.PRODUCTS_READ,
  STOCK_PERMISSIONS.PRODUCTS_UPDATE,
  STOCK_PERMISSIONS.PRODUCTS_DELETE,
  STOCK_PERMISSIONS.PRODUCTS_LIST,
  STOCK_PERMISSIONS.PRODUCTS_MANAGE,
  STOCK_PERMISSIONS.VARIANTS_CREATE,
  STOCK_PERMISSIONS.VARIANTS_READ,
  STOCK_PERMISSIONS.VARIANTS_UPDATE,
  STOCK_PERMISSIONS.VARIANTS_DELETE,
  STOCK_PERMISSIONS.VARIANTS_LIST,
  STOCK_PERMISSIONS.ITEMS_CREATE,
  STOCK_PERMISSIONS.ITEMS_READ,
  STOCK_PERMISSIONS.ITEMS_UPDATE,
  STOCK_PERMISSIONS.ITEMS_DELETE,
  STOCK_PERMISSIONS.ITEMS_LIST,
  STOCK_PERMISSIONS.ITEMS_MANAGE,
  STOCK_PERMISSIONS.TEMPLATES_LIST,
  STOCK_PERMISSIONS.MANUFACTURERS_LIST,
  STOCK_PERMISSIONS.CATEGORIES_LIST,
  STOCK_PERMISSIONS.TAGS_LIST,
  STOCK_PERMISSIONS.UI_MENU_STOCK,
  STOCK_PERMISSIONS.UI_MENU_PRODUCTS,
];

export const WAREHOUSES_FULL_PERMISSIONS = [
  STOCK_PERMISSIONS.WAREHOUSES_CREATE,
  STOCK_PERMISSIONS.WAREHOUSES_READ,
  STOCK_PERMISSIONS.WAREHOUSES_UPDATE,
  STOCK_PERMISSIONS.WAREHOUSES_DELETE,
  STOCK_PERMISSIONS.WAREHOUSES_LIST,
  STOCK_PERMISSIONS.ZONES_CREATE,
  STOCK_PERMISSIONS.ZONES_READ,
  STOCK_PERMISSIONS.ZONES_UPDATE,
  STOCK_PERMISSIONS.ZONES_DELETE,
  STOCK_PERMISSIONS.ZONES_LIST,
  STOCK_PERMISSIONS.UI_MENU_STOCK,
  STOCK_PERMISSIONS.UI_MENU_WAREHOUSES,
];

/** All stock permissions combined */
export const STOCK_ALL_PERMISSIONS = Object.values(STOCK_PERMISSIONS);

// ─── User Factory ───────────────────────────────────────────────────────

export async function createStockUser(
  permissionCodes: string[],
  groupName?: string
) {
  return createUserWithPermissions(permissionCodes, groupName);
}
