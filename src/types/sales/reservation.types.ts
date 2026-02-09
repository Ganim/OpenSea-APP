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
