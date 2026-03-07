export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string | null;
  position: number;
  isDefault: boolean;
  isDone: boolean;
  wipLimit: number | null;
  archivedAt: string | null;
  createdAt: string;
  _count?: {
    cards: number;
  };
}

export interface CreateColumnRequest {
  title: string;
  color?: string | null;
  position?: number;
  isDefault?: boolean;
}

export interface UpdateColumnRequest {
  title?: string;
  color?: string | null;
  position?: number;
  isDefault?: boolean;
}

export interface ReorderColumnsRequest {
  columns: { id: string; position: number }[];
}
