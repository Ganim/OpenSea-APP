export type TeamMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  color: string | null;
  isActive: boolean;
  permissionGroupId: string | null;
  storageFolderId: string | null;
  settings: Record<string, unknown>;
  emailAccountId: string | null;
  membersCount: number;
  createdBy: string;
  creatorName: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: string;
  leftAt: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
}

export interface CreateTeamData {
  name: string;
  description?: string | null;
  color?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateTeamData {
  name?: string;
  description?: string | null;
  color?: string | null;
  avatarUrl?: string | null;
  emailAccountId?: string | null;
}

export interface AddTeamMembersData {
  members: Array<{
    userId: string;
    role?: Exclude<TeamMemberRole, 'OWNER'>;
  }>;
}

export interface ChangeTeamMemberRoleData {
  role: Exclude<TeamMemberRole, 'OWNER'>;
}

export interface TransferOwnershipData {
  userId: string;
}

export const TEAM_MEMBER_ROLE_LABELS: Record<TeamMemberRole, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
};

// Team Email Account (junction table with role-based permission config)
export interface TeamEmailAccount {
  id: string;
  teamId: string;
  accountId: string;
  accountAddress?: string;
  accountDisplayName?: string | null;
  ownerCanRead: boolean;
  ownerCanSend: boolean;
  ownerCanManage: boolean;
  adminCanRead: boolean;
  adminCanSend: boolean;
  adminCanManage: boolean;
  memberCanRead: boolean;
  memberCanSend: boolean;
  memberCanManage: boolean;
  linkedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkTeamEmailData {
  accountId: string;
  ownerCanRead?: boolean;
  ownerCanSend?: boolean;
  ownerCanManage?: boolean;
  adminCanRead?: boolean;
  adminCanSend?: boolean;
  adminCanManage?: boolean;
  memberCanRead?: boolean;
  memberCanSend?: boolean;
  memberCanManage?: boolean;
}

export interface UpdateTeamEmailPermissionsData {
  ownerCanRead?: boolean;
  ownerCanSend?: boolean;
  ownerCanManage?: boolean;
  adminCanRead?: boolean;
  adminCanSend?: boolean;
  adminCanManage?: boolean;
  memberCanRead?: boolean;
  memberCanSend?: boolean;
  memberCanManage?: boolean;
}
