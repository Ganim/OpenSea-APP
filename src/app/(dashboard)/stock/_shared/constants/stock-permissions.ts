/**
 * OpenSea OS - Stock Permissions Constants
 *
 * Constantes de permissões para o módulo de estoque.
 * Usar com PermissionGate para controle de acesso em componentes.
 *
 * @example
 * ```tsx
 * import { STOCK_PERMISSIONS } from '@/app/(dashboard)/stock/_shared/constants';
 *
 * // Uso com hook
 * const { hasPermission } = usePermissions();
 * if (hasPermission(STOCK_PERMISSIONS.PRODUCTS.CREATE)) {
 *   // Pode criar produtos
 * }
 *
 * // Uso com componente
 * <PermissionGate permission={STOCK_PERMISSIONS.ITEMS.DELETE}>
 *   <DeleteButton />
 * </PermissionGate>
 * ```
 */

import {
  DATA_PERMISSIONS,
  STOCK_PERMISSIONS as STOCK_CODES,
} from '@/config/rbac/permission-codes';

export const STOCK_PERMISSIONS = {
  /**
   * Permissões de Produtos
   */
  PRODUCTS: {
    /** Listar produtos */
    LIST: STOCK_CODES.PRODUCTS.LIST,
    /** Visualizar detalhes de produto */
    VIEW: STOCK_CODES.PRODUCTS.READ,
    /** Criar novo produto */
    CREATE: STOCK_CODES.PRODUCTS.CREATE,
    /** Atualizar produto existente */
    UPDATE: STOCK_CODES.PRODUCTS.UPDATE,
    /** Excluir produto */
    DELETE: STOCK_CODES.PRODUCTS.DELETE,
    /** Exportar produtos */
    EXPORT: DATA_PERMISSIONS.EXPORT.PRODUCTS,
    /** Importar produtos */
    IMPORT: DATA_PERMISSIONS.IMPORT.PRODUCTS,
    /** Solicitar produto */
    REQUEST: STOCK_CODES.PRODUCTS.REQUEST,
    /** Aprovar produto */
    APPROVE: STOCK_CODES.PRODUCTS.APPROVE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.PRODUCTS.MANAGE,
  },

  /**
   * Permissões de Variantes
   */
  VARIANTS: {
    /** Listar variantes */
    LIST: STOCK_CODES.VARIANTS.LIST,
    /** Visualizar detalhes de variante */
    VIEW: STOCK_CODES.VARIANTS.READ,
    /** Criar nova variante */
    CREATE: STOCK_CODES.VARIANTS.CREATE,
    /** Atualizar variante existente */
    UPDATE: STOCK_CODES.VARIANTS.UPDATE,
    /** Excluir variante */
    DELETE: STOCK_CODES.VARIANTS.DELETE,
    /** Exportar variantes */
    EXPORT: DATA_PERMISSIONS.EXPORT.VARIANTS,
    /** Importar variantes */
    IMPORT: DATA_PERMISSIONS.IMPORT.VARIANTS,
    /** Solicitar variante */
    REQUEST: STOCK_CODES.VARIANTS.REQUEST,
    /** Aprovar variante */
    APPROVE: STOCK_CODES.VARIANTS.APPROVE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.VARIANTS.MANAGE,
  },

  /**
   * Permissões de Itens
   */
  ITEMS: {
    /** Listar itens */
    LIST: STOCK_CODES.ITEMS.LIST,
    /** Visualizar detalhes de item */
    VIEW: STOCK_CODES.ITEMS.READ,
    /** Criar novo item */
    CREATE: STOCK_CODES.ITEMS.CREATE,
    /** Atualizar item existente */
    UPDATE: STOCK_CODES.ITEMS.UPDATE,
    /** Excluir item */
    DELETE: STOCK_CODES.ITEMS.DELETE,
    /** Registrar entrada */
    ENTRY: STOCK_CODES.ITEMS.ENTRY,
    /** Registrar saída */
    EXIT: STOCK_CODES.ITEMS.EXIT,
    /** Transferir item */
    TRANSFER: STOCK_CODES.ITEMS.TRANSFER,
    /** Solicitar item */
    REQUEST: STOCK_CODES.ITEMS.REQUEST,
    /** Aprovar item */
    APPROVE: STOCK_CODES.ITEMS.APPROVE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.ITEMS.MANAGE,
  },

  /**
   * Permissões de Movimentações
   */
  MOVEMENTS: {
    /** Listar movimentações */
    LIST: STOCK_CODES.MOVEMENTS.LIST,
    /** Visualizar detalhes de movimentação */
    VIEW: STOCK_CODES.MOVEMENTS.READ,
    /** Criar movimentação */
    CREATE: STOCK_CODES.MOVEMENTS.CREATE,
    /** Aprovar movimentação */
    APPROVE: STOCK_CODES.MOVEMENTS.APPROVE,
    /** Exportar movimentações */
    EXPORT: DATA_PERMISSIONS.EXPORT.MOVEMENTS,
  },

  /**
   * Permissões de Localizações
   */
  LOCATIONS: {
    /** Listar localizações */
    LIST: STOCK_CODES.LOCATIONS.LIST,
    /** Visualizar detalhes de localização */
    VIEW: STOCK_CODES.LOCATIONS.READ,
    /** Criar nova localização */
    CREATE: STOCK_CODES.LOCATIONS.CREATE,
    /** Atualizar localização existente */
    UPDATE: STOCK_CODES.LOCATIONS.UPDATE,
    /** Excluir localização */
    DELETE: STOCK_CODES.LOCATIONS.DELETE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.LOCATIONS.MANAGE,
  },

  /**
   * Permissões de Armazéns
   */
  WAREHOUSES: {
    /** Listar armazéns */
    LIST: STOCK_CODES.WAREHOUSES.LIST,
    /** Visualizar detalhes de armazém */
    VIEW: STOCK_CODES.WAREHOUSES.READ,
    /** Criar novo armazém */
    CREATE: STOCK_CODES.WAREHOUSES.CREATE,
    /** Atualizar armazém existente */
    UPDATE: STOCK_CODES.WAREHOUSES.UPDATE,
    /** Excluir armazém */
    DELETE: STOCK_CODES.WAREHOUSES.DELETE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.WAREHOUSES.MANAGE,
  },

  /**
   * Permissões de Zonas
   */
  ZONES: {
    /** Listar zonas */
    LIST: STOCK_CODES.ZONES.LIST,
    /** Visualizar detalhes de zona */
    VIEW: STOCK_CODES.ZONES.READ,
    /** Criar nova zona */
    CREATE: STOCK_CODES.ZONES.CREATE,
    /** Atualizar zona existente */
    UPDATE: STOCK_CODES.ZONES.UPDATE,
    /** Excluir zona */
    DELETE: STOCK_CODES.ZONES.DELETE,
    /** Configurar zona */
    CONFIGURE: STOCK_CODES.ZONES.CONFIGURE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.ZONES.MANAGE,
  },

  /**
   * Permissões de Bins
   */
  BINS: {
    /** Listar bins */
    LIST: STOCK_CODES.BINS.LIST,
    /** Visualizar detalhes de bin */
    VIEW: STOCK_CODES.BINS.READ,
    /** Atualizar bin existente */
    UPDATE: STOCK_CODES.BINS.UPDATE,
    /** Pesquisar bins */
    SEARCH: STOCK_CODES.BINS.SEARCH,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.BINS.MANAGE,
  },

  /**
   * Permissões de Templates
   */
  TEMPLATES: {
    /** Listar templates */
    LIST: STOCK_CODES.TEMPLATES.LIST,
    /** Visualizar detalhes de template */
    VIEW: STOCK_CODES.TEMPLATES.READ,
    /** Criar novo template */
    CREATE: STOCK_CODES.TEMPLATES.CREATE,
    /** Atualizar template existente */
    UPDATE: STOCK_CODES.TEMPLATES.UPDATE,
    /** Excluir template */
    DELETE: STOCK_CODES.TEMPLATES.DELETE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.TEMPLATES.MANAGE,
  },

  /**
   * Permissões de Categorias
   */
  CATEGORIES: {
    /** Listar categorias */
    LIST: STOCK_CODES.CATEGORIES.LIST,
    /** Visualizar detalhes de categoria */
    VIEW: STOCK_CODES.CATEGORIES.READ,
    /** Criar nova categoria */
    CREATE: STOCK_CODES.CATEGORIES.CREATE,
    /** Atualizar categoria existente */
    UPDATE: STOCK_CODES.CATEGORIES.UPDATE,
    /** Excluir categoria */
    DELETE: STOCK_CODES.CATEGORIES.DELETE,
    /** Importar categorias */
    IMPORT: DATA_PERMISSIONS.IMPORT.CATEGORIES,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.CATEGORIES.MANAGE,
  },

  /**
   * Permissões de Fabricantes
   */
  MANUFACTURERS: {
    /** Listar fabricantes */
    LIST: STOCK_CODES.MANUFACTURERS.LIST,
    /** Visualizar detalhes de fabricante */
    VIEW: STOCK_CODES.MANUFACTURERS.READ,
    /** Criar novo fabricante */
    CREATE: STOCK_CODES.MANUFACTURERS.CREATE,
    /** Atualizar fabricante existente */
    UPDATE: STOCK_CODES.MANUFACTURERS.UPDATE,
    /** Excluir fabricante */
    DELETE: STOCK_CODES.MANUFACTURERS.DELETE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.MANUFACTURERS.MANAGE,
  },

  /**
   * Permissões de Fornecedores
   */
  SUPPLIERS: {
    /** Listar fornecedores */
    LIST: STOCK_CODES.SUPPLIERS.LIST,
    /** Visualizar detalhes de fornecedor */
    VIEW: STOCK_CODES.SUPPLIERS.READ,
    /** Criar novo fornecedor */
    CREATE: STOCK_CODES.SUPPLIERS.CREATE,
    /** Atualizar fornecedor existente */
    UPDATE: STOCK_CODES.SUPPLIERS.UPDATE,
    /** Excluir fornecedor */
    DELETE: STOCK_CODES.SUPPLIERS.DELETE,
    /** Exportar fornecedores */
    EXPORT: DATA_PERMISSIONS.EXPORT.SUPPLIERS,
    /** Importar fornecedores */
    IMPORT: DATA_PERMISSIONS.IMPORT.SUPPLIERS,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.SUPPLIERS.MANAGE,
  },

  /**
   * Permissões de Tags
   */
  TAGS: {
    /** Listar tags */
    LIST: STOCK_CODES.TAGS.LIST,
    /** Visualizar detalhes de tag */
    VIEW: STOCK_CODES.TAGS.READ,
    /** Criar nova tag */
    CREATE: STOCK_CODES.TAGS.CREATE,
    /** Atualizar tag existente */
    UPDATE: STOCK_CODES.TAGS.UPDATE,
    /** Excluir tag */
    DELETE: STOCK_CODES.TAGS.DELETE,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.TAGS.MANAGE,
  },

  /**
   * Permissões de Pedidos de Compra
   */
  PURCHASE_ORDERS: {
    /** Listar pedidos de compra */
    LIST: STOCK_CODES.PURCHASE_ORDERS.LIST,
    /** Visualizar detalhes de pedido */
    VIEW: STOCK_CODES.PURCHASE_ORDERS.READ,
    /** Criar novo pedido */
    CREATE: STOCK_CODES.PURCHASE_ORDERS.CREATE,
    /** Atualizar pedido existente */
    UPDATE: STOCK_CODES.PURCHASE_ORDERS.UPDATE,
    /** Excluir pedido */
    DELETE: STOCK_CODES.PURCHASE_ORDERS.DELETE,
    /** Aprovar pedido */
    APPROVE: STOCK_CODES.PURCHASE_ORDERS.APPROVE,
    /** Cancelar pedido */
    CANCEL: STOCK_CODES.PURCHASE_ORDERS.CANCEL,
    /** Gerenciamento completo */
    MANAGE: STOCK_CODES.PURCHASE_ORDERS.MANAGE,
  },

  /**
   * Permissões de Cuidados/Conservação
   */
  CARE: {
    /** Listar instruções */
    LIST: STOCK_CODES.CARE.LIST,
    /** Visualizar instruções */
    VIEW: STOCK_CODES.CARE.READ,
    /** Definir instruções */
    SET: STOCK_CODES.CARE.SET,
  },

  /**
   * Permissões de Impressão
   */
  PRINT: {
    /** Imprimir códigos de barras */
    BARCODES: DATA_PERMISSIONS.PRINT.BARCODES,
  },
} as const;

// Type exports
export type StockProductsPermission =
  (typeof STOCK_PERMISSIONS.PRODUCTS)[keyof typeof STOCK_PERMISSIONS.PRODUCTS];

export type StockVariantsPermission =
  (typeof STOCK_PERMISSIONS.VARIANTS)[keyof typeof STOCK_PERMISSIONS.VARIANTS];

export type StockItemsPermission =
  (typeof STOCK_PERMISSIONS.ITEMS)[keyof typeof STOCK_PERMISSIONS.ITEMS];

export type StockMovementsPermission =
  (typeof STOCK_PERMISSIONS.MOVEMENTS)[keyof typeof STOCK_PERMISSIONS.MOVEMENTS];

export type StockLocationsPermission =
  (typeof STOCK_PERMISSIONS.LOCATIONS)[keyof typeof STOCK_PERMISSIONS.LOCATIONS];

export type StockWarehousesPermission =
  (typeof STOCK_PERMISSIONS.WAREHOUSES)[keyof typeof STOCK_PERMISSIONS.WAREHOUSES];

export type StockZonesPermission =
  (typeof STOCK_PERMISSIONS.ZONES)[keyof typeof STOCK_PERMISSIONS.ZONES];

export type StockBinsPermission =
  (typeof STOCK_PERMISSIONS.BINS)[keyof typeof STOCK_PERMISSIONS.BINS];

export type StockTemplatesPermission =
  (typeof STOCK_PERMISSIONS.TEMPLATES)[keyof typeof STOCK_PERMISSIONS.TEMPLATES];

export type StockCategoriesPermission =
  (typeof STOCK_PERMISSIONS.CATEGORIES)[keyof typeof STOCK_PERMISSIONS.CATEGORIES];

export type StockManufacturersPermission =
  (typeof STOCK_PERMISSIONS.MANUFACTURERS)[keyof typeof STOCK_PERMISSIONS.MANUFACTURERS];

export type StockSuppliersPermission =
  (typeof STOCK_PERMISSIONS.SUPPLIERS)[keyof typeof STOCK_PERMISSIONS.SUPPLIERS];

export type StockTagsPermission =
  (typeof STOCK_PERMISSIONS.TAGS)[keyof typeof STOCK_PERMISSIONS.TAGS];

export type StockPurchaseOrdersPermission =
  (typeof STOCK_PERMISSIONS.PURCHASE_ORDERS)[keyof typeof STOCK_PERMISSIONS.PURCHASE_ORDERS];

export type StockCarePermission =
  (typeof STOCK_PERMISSIONS.CARE)[keyof typeof STOCK_PERMISSIONS.CARE];

export type StockPermission =
  | StockProductsPermission
  | StockVariantsPermission
  | StockItemsPermission
  | StockMovementsPermission
  | StockLocationsPermission
  | StockWarehousesPermission
  | StockZonesPermission
  | StockBinsPermission
  | StockTemplatesPermission
  | StockCategoriesPermission
  | StockManufacturersPermission
  | StockSuppliersPermission
  | StockTagsPermission
  | StockPurchaseOrdersPermission
  | StockCarePermission;

export default STOCK_PERMISSIONS;
