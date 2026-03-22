export interface CardMember {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
  addedAt: string;
}

export interface CardMembersResponse {
  members: CardMember[];
}

export interface CardMemberResponse {
  member: CardMember;
}
