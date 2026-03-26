// Message Template Types

import type { PaginatedQuery } from '../pagination';

export type MessageChannel = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'NOTIFICATION';

export const MESSAGE_CHANNEL_LABELS: Record<MessageChannel, string> = {
  EMAIL: 'E-mail',
  WHATSAPP: 'WhatsApp',
  SMS: 'SMS',
  NOTIFICATION: 'Notificação',
};

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMessageTemplateRequest {
  name: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
}

export interface UpdateMessageTemplateRequest {
  name?: string;
  channel?: MessageChannel;
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export interface MessageTemplatesQuery extends PaginatedQuery {
  channel?: MessageChannel;
  isActive?: boolean;
}
