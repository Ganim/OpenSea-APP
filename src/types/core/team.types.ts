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
