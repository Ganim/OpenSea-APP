/**
 * Permission Groups Module Types
 * Tipos específicos do módulo de grupos de permissões
 */

import type { PermissionGroup } from '@/types/rbac';

// ============================================================================
// MODAL TYPES
// ============================================================================

export interface CreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface DetailModalProps {
  group: PermissionGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface EditModalProps {
  group: PermissionGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface NewPermissionGroupData {
  name: string;
  slug?: string;
  description?: string;
  priority?: number;
  isActive?: boolean;
  isSystem?: boolean;
}

export interface UpdatePermissionGroupData {
  name?: string;
  slug?: string;
  description?: string;
  priority?: number;
  isActive?: boolean;
}

// ============================================================================
// CARD TYPES
// ============================================================================

export interface PermissionGroupCardProps {
  group: PermissionGroup;
  isSelected: boolean;
}
