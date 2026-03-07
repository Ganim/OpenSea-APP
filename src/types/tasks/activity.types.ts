export type CardActivityType =
  | 'CARD_CREATED'
  | 'CARD_UPDATED'
  | 'CARD_MOVED'
  | 'CARD_ARCHIVED'
  | 'MEMBER_ASSIGNED'
  | 'MEMBER_UNASSIGNED'
  | 'LABEL_ADDED'
  | 'LABEL_REMOVED'
  | 'COMMENT_ADDED'
  | 'FIELD_CHANGED'
  | 'SUBTASK_ADDED'
  | 'SUBTASK_UPDATED'
  | 'SUBTASK_REMOVED'
  | 'SUBTASK_REOPENED'
  | 'CHECKLIST_ITEM_COMPLETED'
  | 'CHECKLIST_ITEM_UNCOMPLETED';

export interface CardActivity {
  id: string;
  cardId: string | null;
  boardId: string;
  userId: string;
  userName: string | null;
  type: CardActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivitiesQuery {
  page?: number;
  limit?: number;
  cardId?: string;
  type?: CardActivityType;
}
