import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { CardAttachment, AddAttachmentRequest } from '@/types/tasks';

export interface AttachmentsResponse {
  attachments: CardAttachment[];
}

export interface AttachmentResponse {
  attachment: CardAttachment;
}

export const attachmentsService = {
  async list(boardId: string, cardId: string): Promise<AttachmentsResponse> {
    return apiClient.get<AttachmentsResponse>(
      API_ENDPOINTS.TASKS.ATTACHMENTS.LIST(boardId, cardId)
    );
  },

  async upload(
    boardId: string,
    cardId: string,
    data: AddAttachmentRequest
  ): Promise<AttachmentResponse> {
    return apiClient.post<AttachmentResponse>(
      API_ENDPOINTS.TASKS.ATTACHMENTS.UPLOAD(boardId, cardId),
      data
    );
  },

  async delete(
    boardId: string,
    cardId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.ATTACHMENTS.DELETE(boardId, cardId, attachmentId)
    );
  },
};
