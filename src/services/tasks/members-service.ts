import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  BoardMember,
  AddBoardMemberRequest,
  UpdateBoardMemberRequest,
} from '@/types/tasks';

export interface MemberResponse {
  member: BoardMember;
}

export const membersService = {
  async invite(
    boardId: string,
    data: AddBoardMemberRequest,
  ): Promise<MemberResponse> {
    return apiClient.post<MemberResponse>(
      API_ENDPOINTS.TASKS.BOARDS.MEMBERS.INVITE(boardId),
      data,
    );
  },

  async updateRole(
    boardId: string,
    memberId: string,
    data: UpdateBoardMemberRequest,
  ): Promise<MemberResponse> {
    return apiClient.patch<MemberResponse>(
      API_ENDPOINTS.TASKS.BOARDS.MEMBERS.UPDATE(boardId, memberId),
      data,
    );
  },

  async remove(boardId: string, memberId: string): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.BOARDS.MEMBERS.REMOVE(boardId, memberId),
    );
  },
};
