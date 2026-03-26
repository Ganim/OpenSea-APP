export type MessagingChannel = 'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM';
export type MessagingDirection = 'INBOUND' | 'OUTBOUND';
export type MessagingMessageStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED';
export type MessagingMessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'DOCUMENT'
  | 'LOCATION'
  | 'TEMPLATE'
  | 'INTERACTIVE';
export type MessagingAccountStatus =
  | 'ACTIVE'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'SUSPENDED';

export interface MessagingAccountDTO {
  id: string;
  tenantId: string;
  channel: MessagingChannel;
  name: string;
  status: MessagingAccountStatus;
  phoneNumber?: string;
  tgBotUsername?: string;
  igAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessagingContactDTO {
  id: string;
  tenantId: string;
  accountId: string;
  channel: MessagingChannel;
  externalId: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface MessagingMessageDTO {
  id: string;
  tenantId: string;
  accountId: string;
  contactId: string;
  channel: MessagingChannel;
  direction: MessagingDirection;
  type: MessagingMessageType;
  status: MessagingMessageStatus;
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  templateName?: string;
  externalId?: string;
  replyToMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface MessagingContactsResponse {
  contacts: MessagingContactDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MessagingMessagesResponse {
  messages: MessagingMessageDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MessagingAccountsResponse {
  accounts: MessagingAccountDTO[];
}

export interface SendMessageRequest {
  accountId: string;
  contactId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface SendMessageResponse {
  message: MessagingMessageDTO;
}

export interface CreateAccountRequest {
  channel: MessagingChannel;
  name: string;
  phoneNumber?: string;
  tgBotToken?: string;
  igAccessToken?: string;
}
