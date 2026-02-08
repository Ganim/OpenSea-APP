/* eslint-disable @typescript-eslint/no-explicit-any */
// Stock Types

import type { PaginationMeta, PaginatedQuery } from './pagination';

// ============================================
// ENUMS
// ============================================

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type UnitOfMeasure =
  | 'UNITS'
  | 'KILOGRAMS'
  | 'GRAMS'
  | 'LITERS'
  | 'MILLILITERS'
  | 'METERS'
  | 'CENTIMETERS'
  | 'MILLIMETERS'
  | 'SQUARE_METERS'
  | 'CUBIC_METERS'
  | 'PIECES'
  | 'BOXES'
  | 'PACKAGES'
  | 'BAGS'
  | 'BOTTLES'
  | 'CANS'
  | 'TUBES'
  | 'ROLLS'
  | 'SHEETS'
  | 'BARS'
  | 'COILS'
  | 'POUNDS'
  | 'OUNCES'
  | 'GALLONS'
  | 'QUARTS'
  | 'PINTS'
  | 'CUPS'
  | 'TABLESPOONS'
  | 'TEASPOONS'
  | 'CUSTOM';
export type ItemStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DAMAGED';
export type MovementType =
  | 'ENTRY'
  | 'EXIT'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'ZONE_RECONFIGURE';
export type ExitMovementType = 'SALE' | 'PRODUCTION' | 'SAMPLE' | 'LOSS';
export type PurchaseOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'CANCELLED';
export type LocationType =
  | 'WAREHOUSE'
  | 'ZONE'
  | 'AISLE'
  | 'SHELF'
  | 'BIN'
  | 'OTHER';

// New enums for extended features
export type MovementStatus =
  | 'PENDING_APPROVAL'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';
export type VolumeStatus = 'OPEN' | 'CLOSED' | 'DELIVERED' | 'RETURNED';
export type SerializedLabelStatus = 'AVAILABLE' | 'USED' | 'VOIDED';
export type InventoryCycleStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';
export type InventoryCountStatus =
  | 'PENDING'
  | 'COUNTED'
  | 'ADJUSTED'
  | 'VERIFIED';
export type ScanEntityType =
  | 'ITEM'
  | 'VARIANT'
  | 'PRODUCT'
  | 'LOCATION'
  | 'VOLUME'
  | 'LABEL';
export type ImportStatus =
  | 'VALIDATING'
  | 'VALIDATED'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED';
export type CompanyType = 'MANUFACTURER' | 'SUPPLIER' | 'BOTH';

// Care Instructions Types (Etiquetas de Conservação - NBR 16365:2015)
export type WashingInstruction =
  | 'HAND_WASH' // Lavar à mão
  | 'MACHINE_30' // Máquina 30°C
  | 'MACHINE_40' // Máquina 40°C
  | 'MACHINE_60' // Máquina 60°C
  | 'DO_NOT_WASH'; // Não lavar

export type BleachingInstruction =
  | 'ANY_BLEACH' // Pode usar qualquer alvejante
  | 'NON_CHLORINE' // Apenas alvejante sem cloro
  | 'DO_NOT_BLEACH'; // Não alvejar

export type DryingInstruction =
  | 'TUMBLE_DRY_LOW' // Secadora temperatura baixa
  | 'TUMBLE_DRY_MEDIUM' // Secadora temperatura média
  | 'LINE_DRY' // Secar à sombra
  | 'DRIP_DRY' // Secar pingando
  | 'DO_NOT_TUMBLE_DRY'; // Não usar secadora

export type IroningInstruction =
  | 'IRON_LOW' // Passar com ferro baixo (110°C)
  | 'IRON_MEDIUM' // Passar com ferro médio (150°C)
  | 'IRON_HIGH' // Passar com ferro alto (200°C)
  | 'DO_NOT_IRON'; // Não passar

export type ProfessionalCleaningInstruction =
  | 'DRY_CLEAN_ANY' // Limpeza a seco - qualquer solvente
  | 'DRY_CLEAN_PETROLEUM' // Limpeza a seco - só petróleo
  | 'WET_CLEAN' // Limpeza úmida profissional
  | 'DO_NOT_DRY_CLEAN'; // Não fazer limpeza a seco

export interface FiberComposition {
  fiber: string; // Ex: "Algodão", "Poliéster", "Elastano"
  percentage: number; // Ex: 95, 5
}

export interface CustomSymbol {
  code: string;
  description: string;
  svgPath?: string; // SVG personalizado
}

export interface CareInstructions {
  // Composição têxtil (obrigatório por lei)
  composition: FiberComposition[];

  // Instruções de lavagem
  washing?: WashingInstruction;

  // Instruções de alvejamento
  bleaching?: BleachingInstruction;

  // Instruções de secagem
  drying?: DryingInstruction;

  // Instruções de passagem
  ironing?: IroningInstruction;

  // Limpeza profissional
  professionalCleaning?: ProfessionalCleaningInstruction;

  // Avisos especiais
  warnings?: string[];

  // Símbolos personalizados (para casos especiais)
  customSymbols?: CustomSymbol[];
}

// ============================================
// SUPPLIER TYPE
// ============================================

export interface Supplier {
  id: string;
  name: string;
  sequentialCode?: number;
  cnpj?: string;
  taxId?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  paymentTerms?: string;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================
// PRODUCT CATEGORY TYPE
// ============================================

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

// ============================================
// PRODUCT TAG TYPE
// ============================================

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  description?: string | null;
}

// ============================================
// PRODUCT TYPE
// ============================================

/**
 * Product - Tipo principal que retorna do backend JÁ COM DADOS EXPANDIDOS
 * O backend retorna todas as relações: template, supplier, manufacturer, variants, categories, tags
 */
export interface Product {
  id: string;
  name: string;
  /** Codigo completo gerado pelo backend (read-only) */
  fullCode?: string;
  /** Codigo sequencial auto-incrementado por tenant (read-only) */
  sequentialCode?: number;
  description?: string;
  status: ProductStatus;
  outOfLine: boolean;
  attributes: Record<string, any>;
  careInstructionIds: string[];
  templateId: string;
  template?: {
    id: string;
    name: string;
    unitOfMeasure: string;
    sequentialCode?: number;
    productAttributes?: TemplateAttributes;
    variantAttributes?: TemplateAttributes;
    itemAttributes?: TemplateAttributes;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
  };
  supplierId?: string;
  supplier?: Supplier | null;
  manufacturerId?: string;
  manufacturer?: Manufacturer | null;
  /** @deprecated Mapped to tenantId on backend - do not use */
  organizationId?: string;
  variants?: Array<{
    id: string;
    sku?: string;
    fullCode?: string;
    sequentialCode?: number;
    name: string;
    price: number;
    costPrice?: number;
    profitMargin?: number;
    imageUrl?: string;
    barcode?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }>;
  productCategories?: ProductCategory[];
  productTags?: ProductTag[];
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateProductRequest {
  name: string;
  // fullCode e sequentialCode sao gerados pelo backend (nao enviar)
  description?: string;
  // status omitido - sera ACTIVE por padrao no backend
  // unitOfMeasure removido - vem do Template
  attributes?: Record<string, any>;
  templateId: string;
  supplierId?: string;
  manufacturerId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  // code e fullCode são IMUTÁVEIS após criação
  description?: string;
  status?: ProductStatus;
  outOfLine?: boolean;
  // unitOfMeasure removido
  attributes?: Record<string, any>;
  supplierId?: string;
  manufacturerId?: string;
  categoryIds?: string[];
}

export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

// Variant Types
export interface Variant {
  id: string;
  productId: string;
  sku?: string;
  fullCode?: string;
  sequentialCode?: number;
  name: string;
  price: number;
  imageUrl?: string;
  attributes: Record<string, unknown>;
  costPrice?: number;
  profitMargin?: number;
  barcode?: string;
  qrCode?: string;
  eanCode?: string;
  upcCode?: string;
  colorHex?: string;
  colorPantone?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  reference?: string;
  similars?: unknown[];
  outOfLine: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateVariantRequest {
  productId: string;
  sku?: string; // Opcional - será auto-gerado se não fornecido (max: 100)
  name: string; // Obrigatório (1-255 chars)
  price?: number; // Opcional, default 0 (nonnegative)
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  costPrice?: number; // Positive
  profitMargin?: number;
  barcode?: string; // Max: 100
  qrCode?: string; // Max: 100
  eanCode?: string; // Max: 100
  upcCode?: string; // Max: 100
  reference?: string; // Max: 128
  colorHex?: string; // Max: 7 (hex color)
  colorPantone?: string; // Max: 50
  minStock?: number; // Int, min: 0
  maxStock?: number; // Int, min: 0
  reorderPoint?: number; // Int, min: 0
  reorderQuantity?: number; // Int, min: 0
  outOfLine?: boolean; // Optional, default false
  isActive?: boolean; // Optional, default true
  similars?: unknown[]; // Array of unknown
}

export interface UpdateVariantRequest {
  sku?: string; // Max: 100
  name?: string; // 1-255 chars
  price?: number; // Nonnegative
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  costPrice?: number; // Positive
  profitMargin?: number;
  barcode?: string; // Max: 100
  qrCode?: string; // Max: 100
  eanCode?: string; // Max: 100
  upcCode?: string; // Max: 100
  colorHex?: string; // Max: 7
  colorPantone?: string; // Max: 50
  minStock?: number; // Int, min: 0
  maxStock?: number; // Int, min: 0
  reorderPoint?: number; // Int, min: 0
  reorderQuantity?: number; // Int, min: 0
  reference?: string; // Max: 128
  similars?: unknown[];
  outOfLine?: boolean; // Optional, default false
  isActive?: boolean; // Optional, default true
}

export interface VariantsResponse {
  variants: Variant[];
}

export interface VariantResponse {
  variant: Variant;
}

// Item Types
export interface Item {
  id: string;
  variantId: string;
  binId?: string; // ID da bin onde o item está armazenado
  locationId?: string; // @deprecated - use binId (mantido para retrocompatibilidade)
  resolvedAddress?: string; // Endereço resolvido da bin (ex: "FAB-EST-102-B")
  lastKnownAddress?: string; // Ultimo endereco conhecido (persistido mesmo quando bin e removido)
  uniqueCode?: string;
  fullCode?: string;
  sequentialCode?: number;
  initialQuantity: number;
  currentQuantity: number;
  unitCost?: number;
  totalCost?: number;
  status: ItemStatus;
  entryDate: Date;
  attributes: Record<string, unknown>;
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  // Campos desnormalizados do produto/variante
  productCode?: string;
  productName?: string;
  variantSku?: string;
  variantName?: string;
  // Relação expandida (opcional)
  bin?: {
    id: string;
    address: string;
    zone?: {
      id: string;
      warehouseId: string;
      code: string;
      name: string;
    };
  };
}

// Item Label Data (presenter endpoint response)
export interface ItemLabelData {
  item: {
    id: string;
    uniqueCode: string | null;
    fullCode: string;
    sequentialCode: number;
    currentQuantity: number;
    initialQuantity: number;
    unitCost: number | null;
    status: string;
    entryDate: string;
    resolvedAddress: string | null;
    lastKnownAddress: string | null;
    batchNumber: string | null;
    manufacturingDate: string | null;
    expiryDate: string | null;
    barcode: string;
    eanCode: string;
    attributes: Record<string, unknown>;
  };
  variant: {
    id: string;
    name: string;
    sku: string | null;
    fullCode: string | null;
    price: number;
    costPrice: number | null;
    barcode: string | null;
    reference: string | null;
    colorHex: string | null;
    attributes: Record<string, unknown>;
  };
  product: {
    id: string;
    name: string;
    fullCode: string | null;
    description: string | null;
    attributes: Record<string, unknown>;
  };
  manufacturer: {
    id: string;
    name: string;
    legalName: string | null;
    cnpj: string | null;
    country: string;
  } | null;
  supplier: {
    id: string;
    name: string;
    cnpj: string | null;
  } | null;
  template: {
    id: string;
    name: string;
    unitOfMeasure: string;
    productAttributes: Record<string, unknown> | null;
    variantAttributes: Record<string, unknown> | null;
    itemAttributes: Record<string, unknown> | null;
  };
  location: {
    binId: string;
    binAddress: string;
    zoneId: string;
    zoneCode: string;
    zoneName: string;
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
  } | null;
  tenant: {
    id: string;
    name: string;
  };
}

export interface ItemLabelDataResponse {
  labelData: ItemLabelData[];
}

export interface RegisterItemEntryRequest {
  variantId: string;
  binId?: string;
  quantity: number;
  uniqueCode?: string;
  unitCost?: number;
  attributes?: Record<string, unknown>;
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  notes?: string;
}

export interface RegisterItemExitRequest {
  itemId: string;
  quantity: number;
  movementType: ExitMovementType;
  reasonCode?: string;
  destinationRef?: string;
  notes?: string;
}

export interface TransferItemRequest {
  itemId: string;
  destinationBinId: string;
  reasonCode?: string;
  notes?: string;
}

export interface BatchTransferItemsRequest {
  itemIds: string[];
  destinationBinId: string;
  notes?: string;
}

export interface BatchTransferResponse {
  transferred: number;
  movements: ItemMovement[];
}

export interface LocationHistoryEntry {
  id: string;
  date: Date;
  type: string;
  from: string | null;
  to: string | null;
  userId: string;
  notes: string | null;
}

export interface LocationHistoryResponse {
  data: LocationHistoryEntry[];
}

export interface ItemsResponse {
  items: Item[];
}

export interface ItemResponse {
  item: Item;
}

export interface ItemEntryResponse {
  item: Item;
  movement: ItemMovement;
}

export interface ItemExitResponse {
  item: Item;
  movement: ItemMovement;
}

export interface ItemTransferResponse {
  item: Item;
  movement: ItemMovement;
}

// Item Movement Types
export interface ItemMovement {
  id: string;
  itemId: string;
  userId: string;
  quantity: number;
  quantityBefore?: number | null;
  quantityAfter?: number | null;
  movementType: MovementType;
  reasonCode?: string | null;
  originRef?: string | null;
  destinationRef?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
  approvedBy?: string | null;
  salesOrderId?: string | null;
  createdAt: Date;
}

export interface ItemMovementsQuery {
  itemId?: string;
  userId?: string;
  movementType?: MovementType;
  salesOrderId?: string;
  batchNumber?: string;
  pendingApproval?: boolean;
}

export interface ItemMovementsResponse {
  movements: ItemMovement[];
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string | null;
  parentId?: string;
  displayOrder?: number;
  isActive: boolean;
  childrenCount?: number;
  productCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  iconUrl?: string | null;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}

// Manufacturer Types
export interface Manufacturer {
  id: string;
  code: string; // Código hierárquico auto-gerado (3 dígitos: 001)
  sequentialCode?: number;
  name: string;
  legalName?: string;
  cnpj?: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateManufacturerRequest {
  name: string;
  legalName?: string;
  cnpj?: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface UpdateManufacturerRequest {
  name?: string;
  legalName?: string;
  cnpj?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface ManufacturersResponse {
  manufacturers: Manufacturer[];
}

export interface ManufacturerResponse {
  manufacturer: Manufacturer;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateSupplierRequest {
  name: string;
  cnpj?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  cnpj?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface SuppliersResponse {
  suppliers: Supplier[];
}

export interface SupplierResponse {
  supplier: Supplier;
}

// Location Types
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

// Tag Types
export interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface TagsResponse {
  tags: Tag[];
}

export interface TagResponse {
  tag: Tag;
}

// Template Types

/**
 * Tipo do atributo de template
 */
export type TemplateAttributeType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select';

/**
 * Definição de um atributo de template
 * Usado em productAttributes, variantAttributes e itemAttributes
 */
export interface TemplateAttribute {
  /** Tipo do dado */
  type: TemplateAttributeType;
  /** Label exibido no formulário (opcional - se não informado, usa a key) */
  label?: string;
  /** Se é obrigatório */
  required?: boolean;
  /** Valor padrão */
  defaultValue?: unknown;
  /** Unidade de medida (ex: "kg", "cm", "m²") */
  unitOfMeasure?: string;
  /** Máscara do input (ex: "###.###.###-##" para CPF) */
  mask?: string;
  /** Placeholder do input */
  placeholder?: string;
  /** Habilitar impressão na etiqueta */
  enablePrint?: boolean;
  /** Habilitar visualização */
  enableView?: boolean;
  /** Opções para tipo select */
  options?: string[];
  /** Descrição do atributo */
  description?: string;
}

/**
 * Mapa de atributos de template
 * Chave é o slug do atributo, valor é a definição
 */
export type TemplateAttributes = Record<string, TemplateAttribute>;

/**
 * Template de produto
 */
export interface Template {
  id: string;
  code?: string; // Código hierárquico (3 dígitos: 001)
  sequentialCode?: number;
  name: string;
  /** URL do ícone SVG do template */
  iconUrl?: string;
  unitOfMeasure: UnitOfMeasure;
  productAttributes?: TemplateAttributes;
  variantAttributes?: TemplateAttributes;
  itemAttributes?: TemplateAttributes;
  careInstructions?: CareInstructions;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateTemplateRequest {
  name: string;
  code?: string;
  iconUrl?: string;
  unitOfMeasure: UnitOfMeasure;
  productAttributes?: TemplateAttributes;
  variantAttributes?: TemplateAttributes;
  itemAttributes?: TemplateAttributes;
  careInstructions?: CareInstructions;
}

export interface UpdateTemplateRequest {
  name?: string;
  code?: string;
  iconUrl?: string;
  unitOfMeasure?: UnitOfMeasure;
  productAttributes?: TemplateAttributes;
  variantAttributes?: TemplateAttributes;
  itemAttributes?: TemplateAttributes;
  careInstructions?: CareInstructions;
}

export interface TemplatesResponse {
  templates: Template[];
}

export interface TemplateResponse {
  template: Template;
}

// Purchase Order Types
export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalPrice: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreatePurchaseOrderRequest {
  orderNumber: string;
  supplierId: string;
  status?: PurchaseOrderStatus;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

export interface UpdatePurchaseOrderStatusRequest {
  status: PurchaseOrderStatus;
}

export interface PurchaseOrdersResponse {
  purchaseOrders: PurchaseOrder[];
}

export interface PurchaseOrderResponse {
  purchaseOrder: PurchaseOrder;
}

// Template Request Types (User requests)
export type TemplateRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export interface TemplateRequest {
  id: string;
  templateName: string;
  category?: string;
  justification: string;
  examples?: string;
  status: TemplateRequestStatus;
  requestedBy: string;
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  completedTemplateId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateTemplateRequestRequest {
  templateName: string;
  category?: string;
  justification: string;
  examples?: string;
}

export interface UpdateTemplateRequestRequest {
  status?: TemplateRequestStatus;
  reviewNotes?: string;
  completedTemplateId?: string;
}

export interface TemplateRequestsResponse {
  requests: TemplateRequest[];
}

export interface TemplateRequestResponse {
  request: TemplateRequest;
}

// ============================================
// EXTENDED VARIANT TYPES (Cost Management)
// ============================================

export interface VariantWithCost extends Variant {
  averageCost?: number;
  lastCost?: number;
  totalCostValue?: number;
  totalQuantity?: number;
}

export interface VariantStockSummary {
  variantId: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  averageCost?: number;
  totalValue?: number;
}

// ============================================
// EXTENDED ITEM TYPES
// ============================================

export interface ItemExtended extends Item {
  volumeId?: string;
  categoryId?: string;
  lastMovementAt?: Date;
  variant?: Variant;
  location?: Location;
}

// ============================================
// EXTENDED MOVEMENT TYPES (Approval Workflow)
// ============================================

export interface ItemMovementExtended extends ItemMovement {
  status: MovementStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  unitCost?: number;
  unitPrice?: number;
  volumeId?: string;
  periodKey?: string; // YYYY-MM format for analytics
  // Invoice fields (Nota Fiscal)
  invoiceNumber?: string;
  invoiceAccessKey?: string;
  invoiceSeries?: string;
  invoiceDate?: Date;
  invoiceDescription?: string;
  // Relations
  item?: Item;
  user?: { id: string; name: string };
  approver?: { id: string; name: string };
}

export interface RegisterItemEntryExtendedRequest
  extends RegisterItemEntryRequest {
  unitCost?: number;
  purchaseOrderId?: string;
  generateLabel?: boolean;
  // Invoice fields
  invoiceNumber?: string;
  invoiceAccessKey?: string;
  invoiceSeries?: string;
  invoiceDate?: Date;
  invoiceDescription?: string;
}

export interface RegisterItemExitExtendedRequest
  extends RegisterItemExitRequest {
  unitPrice?: number;
  volumeId?: string;
  requiresApproval?: boolean;
}

export interface BatchEntryRequest {
  items: RegisterItemEntryExtendedRequest[];
  commonData?: {
    locationId?: string;
    purchaseOrderId?: string;
    invoiceNumber?: string;
    invoiceAccessKey?: string;
    invoiceSeries?: string;
    invoiceDate?: Date;
  };
}

export interface BatchTransferRequest {
  items: Array<{
    itemId: string;
    destinationLocationId: string;
  }>;
  notes?: string;
}

export interface MovementApprovalRequest {
  movementId: string;
  notes?: string;
}

export interface MovementRejectionRequest {
  movementId: string;
  reason: string;
}

export interface BatchApprovalRequest {
  movementIds: string[];
  notes?: string;
}

export interface MovementHistoryQuery {
  productId?: string;
  variantId?: string;
  itemId?: string;
  locationId?: string;
  movementType?: MovementType;
  status?: MovementStatus;
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface MovementHistoryResponse {
  movements: ItemMovementExtended[];
  pagination: PaginationMeta;
}

export interface PendingApprovalsResponse {
  movements: ItemMovementExtended[];
  total: number;
}

// ============================================
// VOLUME TYPES (Shipping Containers)
// ============================================

export interface Volume {
  id: string;
  code: string;
  name?: string;
  status: VolumeStatus;
  serializedLabelId?: string;
  serializedLabel?: SerializedLabel;
  destinationRef?: string;
  notes?: string;
  closedAt?: Date;
  closedBy?: string;
  deliveredAt?: Date;
  deliveredBy?: string;
  returnedAt?: Date;
  returnedBy?: string;
  itemCount?: number;
  items?: VolumeItem[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface VolumeItem {
  id: string;
  volumeId: string;
  itemId: string;
  addedAt: Date;
  addedBy: string;
  item?: Item;
}

export interface CreateVolumeRequest {
  name?: string;
  serializedLabelCode?: string;
  destinationRef?: string;
  notes?: string;
}

export interface UpdateVolumeRequest {
  name?: string;
  destinationRef?: string;
  notes?: string;
}

export interface AddItemToVolumeRequest {
  itemId: string;
}

export interface VolumeActionRequest {
  notes?: string;
}

export interface VolumesResponse {
  volumes: Volume[];
  pagination?: PaginationMeta;
}

export interface VolumeResponse {
  volume: Volume;
}

export interface VolumeRomaneio {
  volume: Volume;
  items: Array<{
    item: Item;
    variant: Variant;
    product: Product;
  }>;
  generatedAt: Date;
}

// ============================================
// SERIALIZED LABEL TYPES
// ============================================

export interface SerializedLabel {
  id: string;
  code: string;
  status: SerializedLabelStatus;
  linkedEntityType?: ScanEntityType;
  linkedEntityId?: string;
  printedAt?: Date;
  printedBy?: string;
  usedAt?: Date;
  usedBy?: string;
  voidedAt?: Date;
  voidedBy?: string;
  createdAt: Date;
}

export interface GenerateSerializedLabelsRequest {
  quantity: number;
  prefix?: string;
  startSequence?: number;
}

export interface LinkLabelRequest {
  entityType: ScanEntityType;
  entityId: string;
}

export interface SerializedLabelsResponse {
  labels: SerializedLabel[];
  pagination?: PaginationMeta;
}

export interface SerializedLabelResponse {
  label: SerializedLabel;
}

// ============================================
// SCAN TYPES
// ============================================

export interface ScanRequest {
  code: string;
  context?: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'INFO' | 'INVENTORY';
}

export interface ScanResult {
  entityType: ScanEntityType;
  entityId: string;
  entity: Item | Variant | Product | Location | Volume | SerializedLabel;
  suggestions?: ScanSuggestion[];
}

export interface ScanSuggestion {
  action: string;
  label: string;
  endpoint: string;
  method: string;
}

export interface BatchScanRequest {
  codes: string[];
  context?: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'INFO' | 'INVENTORY';
}

export interface BatchScanResponse {
  results: Array<{
    code: string;
    success: boolean;
    result?: ScanResult;
    error?: string;
  }>;
}

// ============================================
// INVENTORY CYCLE TYPES
// ============================================

export interface InventoryCycle {
  id: string;
  name: string;
  description?: string;
  status: InventoryCycleStatus;
  warehouseId?: string;
  zoneIds?: string[];
  startedAt?: Date;
  startedBy?: string;
  completedAt?: Date;
  completedBy?: string;
  totalBins?: number;
  countedBins?: number;
  adjustedBins?: number;
  counts?: InventoryCount[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface InventoryCount {
  id: string;
  cycleId: string;
  binId: string;
  bin?: Location;
  status: InventoryCountStatus;
  expectedQuantity?: number;
  countedQuantity?: number;
  adjustedQuantity?: number;
  variance?: number;
  countedAt?: Date;
  countedBy?: string;
  adjustedAt?: Date;
  adjustedBy?: string;
  notes?: string;
  items?: Array<{
    itemId: string;
    expectedQuantity: number;
    countedQuantity?: number;
    variance?: number;
  }>;
}

export interface CreateInventoryCycleRequest {
  name: string;
  description?: string;
  warehouseId?: string;
  zoneIds?: string[];
  binIds?: string[];
}

export interface StartCycleRequest {
  notes?: string;
}

export interface CompleteCycleRequest {
  notes?: string;
  autoAdjust?: boolean;
}

export interface SubmitCountRequest {
  countedQuantity: number;
  itemCounts?: Array<{
    itemId: string;
    countedQuantity: number;
  }>;
  notes?: string;
}

export interface AdjustCountRequest {
  adjustedQuantity: number;
  reason: string;
}

export interface InventoryCyclesResponse {
  cycles: InventoryCycle[];
  pagination?: PaginationMeta;
}

export interface InventoryCycleResponse {
  cycle: InventoryCycle;
}

export interface InventoryCountsResponse {
  counts: InventoryCount[];
}

// ============================================
// IMPORT TYPES
// ============================================

export interface ImportValidationRequest {
  type: 'PRODUCTS' | 'VARIANTS' | 'ITEMS';
  data: Record<string, unknown>[];
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: unknown;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  preview?: Record<string, unknown>[];
}

export interface ImportRequest {
  type: 'PRODUCTS' | 'VARIANTS' | 'ITEMS';
  data: Record<string, unknown>[];
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    dryRun?: boolean;
  };
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  createdIds?: string[];
}

export interface ImportTemplateResponse {
  headers: string[];
  requiredFields: string[];
  optionalFields: string[];
  sampleData: Record<string, unknown>[];
  instructions: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface StockSummary {
  totalProducts: number;
  totalVariants: number;
  totalItems: number;
  totalValue: number;
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    itemCount: number;
    value: number;
  }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    itemCount: number;
    value: number;
  }>;
  lowStockAlerts: Array<{
    variantId: string;
    variantName: string;
    currentStock: number;
    minStock: number;
    reorderPoint: number;
  }>;
}

export interface MovementsSummary {
  period: string;
  totalEntries: number;
  totalExits: number;
  totalTransfers: number;
  totalAdjustments: number;
  entriesValue: number;
  exitsValue: number;
  netChange: number;
  pendingApprovals: number;
  byDay: Array<{
    date: string;
    entries: number;
    exits: number;
    transfers: number;
  }>;
}

export interface DashboardData {
  stockSummary: StockSummary;
  movementsSummary: MovementsSummary;
  recentMovements: ItemMovementExtended[];
  pendingApprovals: ItemMovementExtended[];
  alerts: Array<{
    type: 'LOW_STOCK' | 'EXPIRED' | 'PENDING_APPROVAL' | 'INVENTORY_VARIANCE';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    entityType?: string;
    entityId?: string;
  }>;
}

// ============================================
// LABEL GENERATION TYPES
// ============================================

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

// ============================================
// PAGINATION & COMMON TYPES
// ============================================

// PaginationMeta and PaginatedQuery are imported from '@/types/pagination'
export type { PaginationMeta, PaginatedQuery } from './pagination';

export interface ProductsQuery extends PaginatedQuery {
  templateId?: string;
  categoryId?: string;
  status?: ProductStatus;
  search?: string;
  manufacturerId?: string;
  supplierId?: string;
}

export interface VariantsQuery extends PaginatedQuery {
  productId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
}

export interface ItemsQuery extends PaginatedQuery {
  variantId?: string;
  locationId?: string;
  warehouseId?: string;
  status?: ItemStatus;
  volumeId?: string;
  search?: string;
}

export interface VolumesQuery extends PaginatedQuery {
  status?: VolumeStatus;
  search?: string;
}

export interface LabelsQuery extends PaginatedQuery {
  status?: SerializedLabelStatus;
  search?: string;
}

// ============================================
// CARE INSTRUCTIONS TYPES (ISO 3758)
// ============================================

export type CareCategory = 'WASH' | 'BLEACH' | 'DRY' | 'IRON' | 'PROFESSIONAL';

export interface CareOption {
  id: string;
  code: string;
  category: CareCategory;
  assetPath: string;
  label: string;
}

export interface CareOptionsResponse {
  options: {
    WASH: CareOption[];
    BLEACH: CareOption[];
    DRY: CareOption[];
    IRON: CareOption[];
    PROFESSIONAL: CareOption[];
  };
}

export interface SetProductCareRequest {
  careInstructionIds: string[];
}

export interface SetProductCareResponse {
  careInstructionIds: string[];
  careInstructions: CareOption[];
}

export interface CategoryMeta {
  key: CareCategory;
  label: string;
  icon: string;
  description: string;
}

// ============================================
// API RESPONSE WRAPPERS (Paginated)
// ============================================

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface PaginatedVariantsResponse {
  variants: VariantWithCost[];
  pagination: PaginationMeta;
}

export interface PaginatedItemsResponse {
  items: ItemExtended[];
  pagination: PaginationMeta;
}
