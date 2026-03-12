/**
 * OpenSea OS - Teams Service
 * Serviço para comunicação com os endpoints de equipes
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  AddTeamMembersData,
  ChangeTeamMemberRoleData,
  CreateTeamData,
  LinkTeamEmailData,
  Team,
  TeamEmailAccount,
  TeamMember,
  TransferOwnershipData,
  UpdateTeamData,
  UpdateTeamEmailPermissionsData,
} from '@/types/core';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface TeamsListResponse {
  data: Team[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TeamResponse {
  team: Team;
}

export interface TeamMemberResponse {
  member: TeamMember;
}

export interface TeamMembersListResponse {
  data: TeamMember[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface BulkAddMembersResponse {
  added: TeamMember[];
  skipped: string[];
}

export interface TeamEmailsListResponse {
  emailAccounts: TeamEmailAccount[];
}

export interface TeamEmailResponse {
  teamEmail: TeamEmailAccount;
}

export interface ListTeamMembersParams {
  page?: number;
  limit?: number;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
  search?: string;
}

export interface ListTeamsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ============================================================================
// SERVICE
// ============================================================================

export const teamsService = {
  // GET /v1/teams
  async listTeams(params?: ListTeamsParams): Promise<TeamsListResponse> {
    const queryParams: Record<string, string> = {};

    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.search) queryParams.search = params.search;
    if (params?.isActive !== undefined)
      queryParams.isActive = String(params.isActive);

    return apiClient.get<TeamsListResponse>(API_ENDPOINTS.TEAMS.LIST, {
      params: queryParams,
    });
  },

  // GET /v1/teams/:id
  async getTeam(id: string): Promise<TeamResponse> {
    return apiClient.get<TeamResponse>(API_ENDPOINTS.TEAMS.GET(id));
  },

  // POST /v1/teams
  async createTeam(data: CreateTeamData): Promise<TeamResponse> {
    return apiClient.post<TeamResponse>(API_ENDPOINTS.TEAMS.CREATE, data);
  },

  // PUT /v1/teams/:id
  async updateTeam(id: string, data: UpdateTeamData): Promise<TeamResponse> {
    return apiClient.put<TeamResponse>(API_ENDPOINTS.TEAMS.UPDATE(id), data);
  },

  // DELETE /v1/teams/:id
  async deleteTeam(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TEAMS.DELETE(id));
  },

  // GET /v1/teams/my
  async listMyTeams(params?: {
    page?: number;
    limit?: number;
  }): Promise<TeamsListResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    return apiClient.get<TeamsListResponse>(API_ENDPOINTS.TEAMS.MY, {
      params: queryParams,
    });
  },

  // GET /v1/teams/:teamId/members
  async listTeamMembers(
    teamId: string,
    params?: ListTeamMembersParams
  ): Promise<TeamMembersListResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.role) queryParams.role = params.role;
    if (params?.search) queryParams.search = params.search;
    return apiClient.get<TeamMembersListResponse>(
      API_ENDPOINTS.TEAMS.MEMBERS.LIST(teamId),
      { params: queryParams }
    );
  },

  // POST /v1/teams/:teamId/members
  async addTeamMember(
    teamId: string,
    data: { userId: string; role?: 'ADMIN' | 'MEMBER' }
  ): Promise<TeamMemberResponse> {
    return apiClient.post<TeamMemberResponse>(
      API_ENDPOINTS.TEAMS.MEMBERS.ADD(teamId),
      data
    );
  },

  // POST /v1/teams/:teamId/members/bulk
  async bulkAddMembers(
    teamId: string,
    data: AddTeamMembersData
  ): Promise<BulkAddMembersResponse> {
    return apiClient.post<BulkAddMembersResponse>(
      API_ENDPOINTS.TEAMS.MEMBERS.BULK_ADD(teamId),
      data
    );
  },

  // DELETE /v1/teams/:teamId/members/:memberId
  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.TEAMS.MEMBERS.REMOVE(teamId, memberId)
    );
  },

  // PATCH /v1/teams/:teamId/members/:memberId/role
  async changeTeamMemberRole(
    teamId: string,
    memberId: string,
    data: ChangeTeamMemberRoleData
  ): Promise<TeamMemberResponse> {
    return apiClient.patch<TeamMemberResponse>(
      API_ENDPOINTS.TEAMS.MEMBERS.CHANGE_ROLE(teamId, memberId),
      data
    );
  },

  // POST /v1/teams/:teamId/transfer-ownership
  async transferOwnership(
    teamId: string,
    data: TransferOwnershipData
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.TEAMS.TRANSFER_OWNERSHIP(teamId), data);
  },

  // GET /v1/teams/:teamId/emails
  async listTeamEmails(teamId: string): Promise<TeamEmailsListResponse> {
    return apiClient.get<TeamEmailsListResponse>(
      API_ENDPOINTS.TEAMS.EMAILS.LIST(teamId)
    );
  },

  // POST /v1/teams/:teamId/emails
  async linkEmailToTeam(
    teamId: string,
    data: LinkTeamEmailData
  ): Promise<TeamEmailResponse> {
    return apiClient.post<TeamEmailResponse>(
      API_ENDPOINTS.TEAMS.EMAILS.LINK(teamId),
      data
    );
  },

  // PATCH /v1/teams/:teamId/emails/:accountId
  async updateTeamEmailPermissions(
    teamId: string,
    accountId: string,
    data: UpdateTeamEmailPermissionsData
  ): Promise<TeamEmailResponse> {
    return apiClient.patch<TeamEmailResponse>(
      API_ENDPOINTS.TEAMS.EMAILS.UPDATE_PERMISSIONS(teamId, accountId),
      data
    );
  },

  // DELETE /v1/teams/:teamId/emails/:accountId
  async unlinkEmailFromTeam(teamId: string, accountId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.TEAMS.EMAILS.UNLINK(teamId, accountId)
    );
  },
};
