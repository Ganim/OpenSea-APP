/**
 * Dashboard Types
 * Tipos e interfaces para o sistema de dashboard
 */

export type ModuleStatus = 'active' | 'coming-soon' | 'disabled';

export type ModuleCategory =
  | 'inventory'
  | 'sales'
  | 'analytics'
  | 'team'
  | 'documents'
  | 'chat'
  | 'settings'
  | 'productivity';

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: ModuleStatus;
  category: ModuleCategory;
  href: string;
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
  };
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'product' | 'supplier' | 'category' | 'location' | 'order' | 'customer';
  icon: string;
  href: string;
}

// ── Legacy (frontend-only) ──
/** @deprecated Use BackendNotification for real API data */
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  icon?: string;
}

// ── Backend-aligned notification ──
export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'SUCCESS'
  | 'REMINDER';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';

export interface BackendNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  actionUrl?: string | null;
  actionText?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  isSent: boolean;
  scheduledFor?: string | null;
  readAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface NotificationListResponse {
  notifications: BackendNotification[];
  total: number;
  totalPages: number;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  startDate?: string;
  endDate?: string;
}

export interface ProductivityItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count?: number;
  href: string;
}
