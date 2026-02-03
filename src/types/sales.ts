// Sales Types

// Enums
export type CustomerType = 'INDIVIDUAL' | 'BUSINESS';
export type SalesOrderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

// Customer Types
export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateCustomerRequest {
  name: string;
  type: CustomerType;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

export interface CustomersResponse {
  customers: Customer[];
}

export interface CustomerResponse {
  customer: Customer;
}

// Sales Order Types
export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  variantId: string;
  itemId?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes?: string | null;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  createdBy?: string | null;
  status: SalesOrderStatus;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  notes?: string | null;
  items: SalesOrderItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  orderNumber: string;
  status?: 'DRAFT' | 'PENDING' | 'CONFIRMED';
  discount?: number;
  notes?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    notes?: string;
  }>;
  createdBy?: string;
}

export interface UpdateSalesOrderStatusRequest {
  status: SalesOrderStatus;
}

export interface SalesOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SalesOrdersResponse {
  salesOrders: SalesOrder[];
}

export interface SalesOrderResponse {
  salesOrder: SalesOrder;
}

// Comment Types
export interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateCommentRequest {
  entityType: string;
  entityId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface CommentResponse {
  comment: Comment;
}

// Variant Promotion Types
export interface VariantPromotion {
  id: string;
  variantId: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateVariantPromotionRequest {
  variantId: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateVariantPromotionRequest {
  discountType?: string;
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  notes?: string;
}

export interface VariantPromotionsResponse {
  promotions: VariantPromotion[];
}

export interface VariantPromotionResponse {
  promotion: VariantPromotion;
}

// Item Reservation Types
export interface ItemReservation {
  id: string;
  itemId: string;
  salesOrderId?: string;
  quantity: number;
  expiresAt: Date;
  status: string;
  createdAt: Date;
}

export interface CreateItemReservationRequest {
  itemId: string;
  salesOrderId?: string;
  quantity: number;
  expiresAt: Date;
}

export interface ReleaseItemReservationRequest {
  releaseQuantity: number;
}

export interface ItemReservationsResponse {
  reservations: ItemReservation[];
}

export interface ItemReservationResponse {
  reservation: ItemReservation;
}

// Notification Preference Types
export interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: string;
  channel: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateNotificationPreferenceRequest {
  userId: string;
  notificationType: string;
  channel: string;
  isEnabled?: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  notificationType?: string;
  channel?: string;
  isEnabled?: boolean;
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
}

export interface NotificationPreferenceResponse {
  preference: NotificationPreference;
}
