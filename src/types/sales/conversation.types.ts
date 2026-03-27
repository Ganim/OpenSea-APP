// Conversation Types

import type { PaginatedQuery } from '../pagination';

export type ConversationStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export const CONVERSATION_STATUS_LABELS: Record<ConversationStatus, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
  ARCHIVED: 'Arquivada',
};

export type MessageSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export const MESSAGE_SENTIMENT_LABELS: Record<MessageSentiment, string> = {
  POSITIVE: 'Positivo',
  NEUTRAL: 'Neutro',
  NEGATIVE: 'Negativo',
};

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId?: string;
  senderName: string;
  senderType: 'AGENT' | 'SYSTEM';
  content: string;
  readAt?: string;
  sentiment?: MessageSentiment;
  createdAt: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  customerName?: string;
  subject: string;
  status: ConversationStatus;
  lastMessageAt?: string;
  createdBy: string;
  isActive: boolean;
  overallSentiment?: MessageSentiment;
  createdAt: string;
  updatedAt?: string;
  messages?: ConversationMessage[];
}

export interface CreateConversationRequest {
  customerId: string;
  subject: string;
  initialMessage?: string;
}

export interface SendConversationMessageRequest {
  content: string;
}

export interface ConversationsQuery extends PaginatedQuery {
  status?: ConversationStatus;
  customerId?: string;
}
