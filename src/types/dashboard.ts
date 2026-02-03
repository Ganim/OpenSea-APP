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

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  icon?: string;
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
