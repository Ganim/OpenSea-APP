import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  Card,
  CardsQuery,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
} from '@/types/tasks';

export interface CardsResponse {
  cards: Card[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CardResponse {
  card: Card;
}

export const cardsService = {
  async list(boardId: string, params?: CardsQuery): Promise<CardsResponse> {
    const query = new URLSearchParams();

    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.columnId) query.append('columnId', params.columnId);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.assigneeId) query.append('assigneeId', params.assigneeId);
    if (params?.labelId) query.append('labelId', params.labelId);
    if (params?.hasDueDate !== undefined) {
      query.append('hasDueDate', String(params.hasDueDate));
    }
    if (params?.includeArchived !== undefined) {
      query.append('includeArchived', String(params.includeArchived));
    }

    const queryString = query.toString();
    const url = queryString
      ? `${API_ENDPOINTS.TASKS.CARDS.LIST(boardId)}?${queryString}`
      : API_ENDPOINTS.TASKS.CARDS.LIST(boardId);

    return apiClient.get<CardsResponse>(url);
  },

  async get(boardId: string, cardId: string): Promise<CardResponse> {
    return apiClient.get<CardResponse>(
      API_ENDPOINTS.TASKS.CARDS.GET(boardId, cardId),
    );
  },

  async create(
    boardId: string,
    data: CreateCardRequest,
  ): Promise<CardResponse> {
    return apiClient.post<CardResponse>(
      API_ENDPOINTS.TASKS.CARDS.CREATE(boardId),
      data,
    );
  },

  async update(
    boardId: string,
    cardId: string,
    data: UpdateCardRequest,
  ): Promise<CardResponse> {
    return apiClient.patch<CardResponse>(
      API_ENDPOINTS.TASKS.CARDS.UPDATE(boardId, cardId),
      data,
    );
  },

  async delete(boardId: string, cardId: string): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.CARDS.DELETE(boardId, cardId),
    );
  },

  async move(
    boardId: string,
    cardId: string,
    data: MoveCardRequest,
  ): Promise<CardResponse> {
    return apiClient.patch<CardResponse>(
      API_ENDPOINTS.TASKS.CARDS.MOVE(boardId, cardId),
      data,
    );
  },

  async assign(
    boardId: string,
    cardId: string,
    data: { assigneeId: string | null },
  ): Promise<CardResponse> {
    return apiClient.patch<CardResponse>(
      API_ENDPOINTS.TASKS.CARDS.ASSIGN(boardId, cardId),
      data,
    );
  },

  async archive(
    boardId: string,
    cardId: string,
    archive: boolean,
  ): Promise<CardResponse> {
    return apiClient.patch<CardResponse>(
      API_ENDPOINTS.TASKS.CARDS.ARCHIVE(boardId, cardId),
      { archive },
    );
  },

  async manageLabels(
    boardId: string,
    cardId: string,
    data: { labelIds: string[] },
  ): Promise<CardResponse> {
    return apiClient.put<CardResponse>(
      API_ENDPOINTS.TASKS.CARDS.LABELS(boardId, cardId),
      data,
    );
  },
};
