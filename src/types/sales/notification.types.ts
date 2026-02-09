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
