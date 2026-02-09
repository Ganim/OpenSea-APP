// Comment Types

export interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateCommentRequest {
  entityType: string;
  entityId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface CommentResponse {
  comment: Comment;
}
