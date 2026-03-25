export type AiConversationContext =
  | 'DEDICATED'
  | 'INLINE'
  | 'COMMAND_BAR'
  | 'VOICE';
export type AiConversationStatus = 'ACTIVE' | 'ARCHIVED';

export interface AiConversation {
  id: string;
  tenantId: string;
  userId: string;
  title: string | null;
  status: AiConversationStatus;
  context: AiConversationContext;
  contextModule: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export type AiMessageRole =
  | 'USER'
  | 'ASSISTANT'
  | 'SYSTEM'
  | 'TOOL_CALL'
  | 'TOOL_RESULT';
export type AiMessageContentType =
  | 'TEXT'
  | 'CHART'
  | 'TABLE'
  | 'KPI_CARD'
  | 'ACTION_CARD'
  | 'IMAGE'
  | 'ERROR'
  | 'LOADING';

export interface AiMessage {
  id: string;
  conversationId?: string;
  role: AiMessageRole;
  content: string | null;
  contentType: AiMessageContentType;
  renderData?: Record<string, unknown> | null;
  attachments?: Record<string, unknown> | null;
  aiModel?: string | null;
  aiLatencyMs?: number | null;
  toolCalls?: Record<string, unknown> | null;
  actionsTaken?: Record<string, unknown> | null;
  audioUrl?: string | null;
  transcription?: string | null;
  createdAt: string;
}

// ── Action Card render data ──────────────────────────────────────────
export type ActionCardStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'EXECUTED'
  | 'FAILED'
  | 'CANCELLED';

export type ActionCardModule = 'stock' | 'finance' | 'hr' | 'sales';

export interface ActionCardField {
  label: string;
  value: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge';
}

export interface ActionCardResult {
  success: boolean;
  message: string;
  entityId?: string;
  entityUrl?: string;
}

export interface ActionCardRenderData {
  type: 'ACTION_CARD';
  actionId: string;
  toolName: string;
  displayName: string;
  module: ActionCardModule;
  status: ActionCardStatus;
  fields: ActionCardField[];
  result?: ActionCardResult;
}

export interface SendMessageRequest {
  conversationId?: string;
  content: string;
  context?: AiConversationContext;
  contextModule?: string;
  contextEntityType?: string;
  contextEntityId?: string;
}

export interface SendMessageResponse {
  conversationId: string;
  userMessage: AiMessage;
  assistantMessage: AiMessage;
}
