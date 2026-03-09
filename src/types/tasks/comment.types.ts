export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  userName: string | null;
  emoji: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  reactions?: CommentReaction[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsQuery {
  page?: number;
  limit?: number;
}

export interface AddReactionRequest {
  emoji: string;
}
