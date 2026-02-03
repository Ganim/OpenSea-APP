import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateItemReservationRequest,
  CreateNotificationPreferenceRequest,
  CreateVariantPromotionRequest,
  ItemReservationResponse,
  ItemReservationsResponse,
  NotificationPreferenceResponse,
  NotificationPreferencesResponse,
  ReleaseItemReservationRequest,
  UpdateNotificationPreferenceRequest,
  UpdateVariantPromotionRequest,
  VariantPromotionResponse,
  VariantPromotionsResponse,
} from '@/types/sales';

// Variant Promotions Service
export const variantPromotionsService = {
  // GET /v1/variant-promotions
  async listPromotions(): Promise<VariantPromotionsResponse> {
    return apiClient.get<VariantPromotionsResponse>(
      API_ENDPOINTS.VARIANT_PROMOTIONS.LIST
    );
  },

  // GET /v1/variant-promotions/:id
  async getPromotion(id: string): Promise<VariantPromotionResponse> {
    return apiClient.get<VariantPromotionResponse>(
      API_ENDPOINTS.VARIANT_PROMOTIONS.GET(id)
    );
  },

  // POST /v1/variant-promotions
  async createPromotion(
    data: CreateVariantPromotionRequest
  ): Promise<VariantPromotionResponse> {
    return apiClient.post<VariantPromotionResponse>(
      API_ENDPOINTS.VARIANT_PROMOTIONS.CREATE,
      data
    );
  },

  // PATCH /v1/variant-promotions/:id
  async updatePromotion(
    id: string,
    data: UpdateVariantPromotionRequest
  ): Promise<VariantPromotionResponse> {
    return apiClient.put<VariantPromotionResponse>(
      API_ENDPOINTS.VARIANT_PROMOTIONS.UPDATE(id),
      data
    );
  },

  // DELETE /v1/variant-promotions/:id
  async deletePromotion(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.VARIANT_PROMOTIONS.DELETE(id));
  },
};

// Item Reservations Service
export const itemReservationsService = {
  // GET /v1/item-reservations
  async listReservations(): Promise<ItemReservationsResponse> {
    return apiClient.get<ItemReservationsResponse>(
      API_ENDPOINTS.ITEM_RESERVATIONS.LIST
    );
  },

  // GET /v1/item-reservations/:id
  async getReservation(id: string): Promise<ItemReservationResponse> {
    return apiClient.get<ItemReservationResponse>(
      API_ENDPOINTS.ITEM_RESERVATIONS.GET(id)
    );
  },

  // POST /v1/item-reservations
  async createReservation(
    data: CreateItemReservationRequest
  ): Promise<ItemReservationResponse> {
    return apiClient.post<ItemReservationResponse>(
      API_ENDPOINTS.ITEM_RESERVATIONS.CREATE,
      data
    );
  },

  // PATCH /v1/item-reservations/:id/release
  async releaseReservation(
    id: string,
    data: ReleaseItemReservationRequest
  ): Promise<ItemReservationResponse> {
    return apiClient.put<ItemReservationResponse>(
      API_ENDPOINTS.ITEM_RESERVATIONS.RELEASE(id),
      data
    );
  },
};

// Notification Preferences Service
export const notificationPreferencesService = {
  // GET /v1/notification-preferences
  async listPreferences(): Promise<NotificationPreferencesResponse> {
    return apiClient.get<NotificationPreferencesResponse>(
      API_ENDPOINTS.NOTIFICATION_PREFERENCES.LIST
    );
  },

  // GET /v1/notification-preferences/:id
  async getPreference(id: string): Promise<NotificationPreferenceResponse> {
    return apiClient.get<NotificationPreferenceResponse>(
      API_ENDPOINTS.NOTIFICATION_PREFERENCES.GET(id)
    );
  },

  // POST /v1/notification-preferences
  async createPreference(
    data: CreateNotificationPreferenceRequest
  ): Promise<NotificationPreferenceResponse> {
    return apiClient.post<NotificationPreferenceResponse>(
      API_ENDPOINTS.NOTIFICATION_PREFERENCES.CREATE,
      data
    );
  },

  // PATCH /v1/notification-preferences/:id
  async updatePreference(
    id: string,
    data: UpdateNotificationPreferenceRequest
  ): Promise<NotificationPreferenceResponse> {
    return apiClient.put<NotificationPreferenceResponse>(
      API_ENDPOINTS.NOTIFICATION_PREFERENCES.UPDATE(id),
      data
    );
  },

  // DELETE /v1/notification-preferences/:id
  async deletePreference(id: string): Promise<void> {
    return apiClient.delete<void>(
      API_ENDPOINTS.NOTIFICATION_PREFERENCES.DELETE(id)
    );
  },
};
