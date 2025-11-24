/* eslint-disable @typescript-eslint/no-explicit-any */
// Stock Types

// Enums
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type UnitOfMeasure = 'METERS' | 'KILOGRAMS' | 'UNITS';
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

// Product Types
export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: ProductStatus;
  unitOfMeasure: UnitOfMeasure;
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
  code: string;
  description?: string;
  status?: ProductStatus;
  unitOfMeasure: UnitOfMeasure;
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
  unitOfMeasure?: UnitOfMeasure;
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
  sku: string;
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
  sku: string;
  name: string;
  price: number;
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
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateTemplateRequest {
  name: string;
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
}

export interface UpdateTemplateRequest {
  name?: string;
  productAttributes?: Record<string, unknown>;
  variantAttributes?: Record<string, unknown>;
  itemAttributes?: Record<string, unknown>;
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
