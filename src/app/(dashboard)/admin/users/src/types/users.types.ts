/**
 * Users Module Types
 * Definições de tipos específicas do módulo de usuários
 */

import type { User } from '@/types/auth';
import type { GroupWithExpiration, PermissionGroup } from '@/types/rbac';

export interface UserGridCardProps {
  user: User;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onManageGroups: (user: User) => void;
}

export interface UserListCardProps {
  user: User;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

export interface DetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  onManageGroups: (user: User) => void;
}

export interface CreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: () => Promise<void>;
  newUser: NewUserData;
  setNewUser: (user: NewUserData) => void;
}

export interface ManageGroupsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  userGroups: GroupWithExpiration[];
  availableGroups: PermissionGroup[];
  onAssignGroup: (groupId: string) => Promise<void>;
  onRemoveGroup: (groupId: string) => Promise<void>;
  isLoading?: boolean;
}

export interface NewUserData {
  username: string;
  email: string;
  password: string;
}
