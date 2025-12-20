/* eslint-disable @typescript-eslint/no-explicit-any */
// Stock Types

// Enums
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
export type MovementType = 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT';
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

// Product Types
export interface Product {
  id: string;
  name: string;
  code?: string; // Opcional - auto-gerado pelo backend
  description?: string;
  status: ProductStatus;
  // unitOfMeasure removido - agora está no Template
  attributes: Record<string, any>;
  templateId: string;
  supplierId?: string;
  manufacturerId?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateProductRequest {
  name: string;
  code?: string; // Opcional - será auto-gerado se não fornecido
  description?: string;
  // status omitido - será ACTIVE por padrão no backend
  // unitOfMeasure removido - vem do Template
  attributes?: Record<string, any>;
  templateId: string;
  supplierId?: string;
  manufacturerId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  code?: string;
  description?: string;
  status?: ProductStatus;
  // unitOfMeasure removido
  attributes?: Record<string, any>;
  templateId?: string;
  supplierId?: string;
  manufacturerId?: string;
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
  sku?: string; // Opcional - auto-gerado pelo backend
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
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateVariantRequest {
  productId: string;
  sku?: string; // Opcional - será auto-gerado se não fornecido
  name: string;
  price: number; // Obrigatório para controle financeiro
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  costPrice?: number;
  profitMargin?: number;
  barcode?: string;
  qrCode?: string;
  eanCode?: string;
  upcCode?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface UpdateVariantRequest {
  sku?: string;
  name?: string;
  price?: number;
  imageUrl?: string;
  attributes?: Record<string, unknown>;
  costPrice?: number;
  profitMargin?: number;
  barcode?: string;
  qrCode?: string;
  eanCode?: string;
  upcCode?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
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
  locationId: string;
  uniqueCode: string;
  initialQuantity: number;
  currentQuantity: number;
  status: ItemStatus;
  entryDate: Date;
  attributes: Record<string, unknown>;
  batchNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface RegisterItemEntryRequest {
  uniqueCode: string;
  variantId: string;
  locationId: string;
  quantity: number;
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
  destinationLocationId: string;
  reasonCode?: string;
  notes?: string;
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
  parentId?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
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
  name: string;
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

// Tipo para resposta da API (campos diferentes)
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

export interface CreateLocationRequest {
  titulo?: string;
  type?: LocationType;
  parentId?: string;
  capacity?: number;
  currentOccupancy?: number;
  isActive?: boolean;
}

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
export interface Template {
  id: string;
  name: string;
  code?: string; // Opcional - auto-gerado pelo backend
  unitOfMeasure: UnitOfMeasure; // NOVO: Movido de Product para cá
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
  careInstructions?: CareInstructions; // NOVO: Etiquetas de conservação
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateTemplateRequest {
  name: string;
  code?: string; // Opcional - será auto-gerado se não fornecido
  unitOfMeasure: UnitOfMeasure; // OBRIGATÓRIO
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
  careInstructions?: CareInstructions; // Opcional
}

export interface UpdateTemplateRequest {
  name?: string;
  code?: string;
  unitOfMeasure?: UnitOfMeasure;
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
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
