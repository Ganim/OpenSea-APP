// Item Reservation Types

export type ItemReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export const ITEM_RESERVATION_STATUS_LABELS: Record<
  ItemReservationStatus,
  string
> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

export interface ItemReservation {
  id: string;
  itemId: string;
  salesOrderId?: string;
  quantity: number;
  expiresAt: string;
  status: ItemReservationStatus;
  createdAt: string;
  updatedAt?: string;
  item?: {
    id: string;
    sku?: string;
    product?: {
      id: string;
      name: string;
    };
  };
  salesOrder?: {
    id: string;
    code?: string;
  };
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
