import type { Card, CreateCardRequest } from './card.types';

// Subtasks are cards with a parentCardId set.
// Re-export Card as Subtask for semantic clarity.
export type Subtask = Card;

export type CreateSubtaskRequest = Omit<CreateCardRequest, 'parentCardId'>;

export interface CompleteSubtaskRequest {
  completed: boolean;
}
