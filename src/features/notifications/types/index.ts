/**
 * Public types for the notifications v2 feature.
 * Mirror the backend's `@/modules/notifications/public/types.ts`.
 */

export enum NotificationKind {
  INFORMATIONAL = 'INFORMATIONAL',
  LINK = 'LINK',
  ACTIONABLE = 'ACTIONABLE',
  APPROVAL = 'APPROVAL',
  FORM = 'FORM',
  PROGRESS = 'PROGRESS',
  SYSTEM_BANNER = 'SYSTEM_BANNER',
  IMAGE_BANNER = 'IMAGE_BANNER',
  REPORT = 'REPORT',
  EMAIL_PREVIEW = 'EMAIL_PREVIEW',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationState {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
}

export enum NotificationFrequency {
  INSTANT = 'INSTANT',
  HOURLY_DIGEST = 'HOURLY_DIGEST',
  DAILY_DIGEST = 'DAILY_DIGEST',
  WEEKLY_DIGEST = 'WEEKLY_DIGEST',
  DISABLED = 'DISABLED',
}

export interface NotificationFormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'boolean';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
}

export interface NotificationActionDefinition {
  key: string;
  label: string;
  style?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  icon?: string;
  requiresReason?: boolean;
  formSchema?: NotificationFormField[];
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind | null;
  priority: NotificationPriority;
  state: NotificationState | null;
  actionUrl?: string | null;
  fallbackUrl?: string | null;
  actions?: NotificationActionDefinition[] | null;
  resolvedAction?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  progress?: number | null;
  progressTotal?: number | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface NotificationCategoryManifest {
  id: string;
  code: string;
  name: string;
  description: string | null;
  defaultKind: string;
  defaultPriority: string;
  defaultChannels: string[];
  digestSupported: boolean;
  mandatory: boolean;
  order: number;
}

export interface NotificationModuleManifest {
  code: string;
  displayName: string;
  icon: string | null;
  order: number;
  categories: NotificationCategoryManifest[];
}

export interface UserNotificationSettings {
  doNotDisturb: boolean;
  dndStart: string | null;
  dndEnd: string | null;
  timezone: string;
  digestSchedule: string | null;
  soundEnabled: boolean;
  masterInApp: boolean;
  masterEmail: boolean;
  masterPush: boolean;
  masterSms: boolean;
  masterWhatsapp: boolean;
}

export interface NotificationPreferenceRow {
  categoryCode: string;
  channel: NotificationChannel;
  isEnabled: boolean;
  frequency: NotificationFrequency;
}

export interface NotificationPreferencesBundle {
  modules: Array<{ code: string; isEnabled: boolean }>;
  preferences: NotificationPreferenceRow[];
}

export interface PushDeviceRow {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}
