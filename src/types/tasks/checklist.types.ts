export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
}

export interface Checklist {
  id: string;
  cardId: string;
  title: string;
  position: number;
  createdAt: string;
  items: ChecklistItem[];
}

export interface CreateChecklistRequest {
  title: string;
  position?: number;
}

export interface UpdateChecklistRequest {
  title?: string;
  position?: number;
}

export interface CreateChecklistItemRequest {
  title: string;
  position?: number;
}

export interface UpdateChecklistItemRequest {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}
