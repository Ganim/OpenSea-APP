export type BoardMemberRole = 'VIEWER' | 'EDITOR';

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  role: BoardMemberRole;
  joinedAt: string;
}

export interface AddBoardMemberRequest {
  userId: string;
  role?: BoardMemberRole;
}

export interface UpdateBoardMemberRequest {
  role: BoardMemberRole;
}

export interface BoardMembersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: BoardMemberRole;
}
