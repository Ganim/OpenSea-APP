export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CreateLabelRequest {
  name: string;
  color: string;
}

export interface UpdateLabelRequest {
  name?: string;
  color?: string;
}
