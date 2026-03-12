import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  Comment,
  CommentsQuery,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '@/types/tasks';

export interface CommentsResponse {
  comments: Comment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CommentResponse {
  comment: Comment;
}

export const commentsService = {
  async list(
    boardId: string,
    cardId: string,
    params?: CommentsQuery
  ): Promise<CommentsResponse> {
    const query = new URLSearchParams();

    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString();
    const url = queryString
      ? `${API_ENDPOINTS.TASKS.COMMENTS.LIST(boardId, cardId)}?${queryString}`
      : API_ENDPOINTS.TASKS.COMMENTS.LIST(boardId, cardId);

    return apiClient.get<CommentsResponse>(url);
  },

  async create(
    boardId: string,
    cardId: string,
    data: CreateCommentRequest
  ): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(
      API_ENDPOINTS.TASKS.COMMENTS.CREATE(boardId, cardId),
      data
    );
  },

  async update(
    boardId: string,
    cardId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse> {
    return apiClient.patch<CommentResponse>(
      API_ENDPOINTS.TASKS.COMMENTS.UPDATE(boardId, cardId, commentId),
      data
    );
  },

  async delete(
    boardId: string,
    cardId: string,
    commentId: string
  ): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.COMMENTS.DELETE(boardId, cardId, commentId)
    );
  },

  async addReaction(
    boardId: string,
    cardId: string,
    commentId: string,
    emoji: string
  ): Promise<void> {
    await apiClient.post<void>(
      API_ENDPOINTS.TASKS.COMMENTS.ADD_REACTION(boardId, cardId, commentId),
      { emoji }
    );
  },

  async removeReaction(
    boardId: string,
    cardId: string,
    commentId: string,
    emoji: string
  ): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.COMMENTS.REMOVE_REACTION(
        boardId,
        cardId,
        commentId,
        emoji
      )
    );
  },
};
