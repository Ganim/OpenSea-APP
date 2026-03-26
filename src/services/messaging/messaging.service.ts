import { apiClient } from '@/lib/api-client';
import type {
  CreateAccountRequest,
  MessagingAccountsResponse,
  MessagingContactsResponse,
  MessagingMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/types/messaging';

const BASE = '/v1/messaging';

export const messagingService = {
  // ─── Accounts ──────────────────────────────────────────────────────────────

  async listAccounts(): Promise<MessagingAccountsResponse> {
    return apiClient.get<MessagingAccountsResponse>(`${BASE}/accounts`);
  },

  async createAccount(
    body: CreateAccountRequest
  ): Promise<{ account: { id: string } }> {
    return apiClient.post<{ account: { id: string } }>(
      `${BASE}/accounts`,
      body
    );
  },

  async deleteAccount(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE}/accounts/${id}`);
  },

  // ─── Contacts ──────────────────────────────────────────────────────────────

  async listContacts(params?: {
    page?: number;
    limit?: number;
    channel?: string;
    search?: string;
  }): Promise<MessagingContactsResponse> {
    return apiClient.get<MessagingContactsResponse>(`${BASE}/contacts`, {
      params: {
        ...(params?.page ? { page: String(params.page) } : {}),
        ...(params?.limit ? { limit: String(params.limit) } : {}),
        ...(params?.channel ? { channel: params.channel } : {}),
        ...(params?.search ? { search: params.search } : {}),
      },
    });
  },

  // ─── Messages ──────────────────────────────────────────────────────────────

  async listMessages(
    contactId: string,
    params?: { page?: number; limit?: number }
  ): Promise<MessagingMessagesResponse> {
    return apiClient.get<MessagingMessagesResponse>(
      `${BASE}/contacts/${contactId}/messages`,
      {
        params: {
          ...(params?.page ? { page: String(params.page) } : {}),
          ...(params?.limit ? { limit: String(params.limit) } : {}),
        },
      }
    );
  },

  async sendMessage(body: SendMessageRequest): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>(`${BASE}/messages`, body);
  },
};
