export interface AttachmentFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

export interface CardAttachment {
  id: string;
  cardId: string;
  fileId: string;
  fileName: string | null;
  addedBy: string;
  addedByName: string | null;
  createdAt: string;
  file?: AttachmentFile;
}

export interface AddAttachmentRequest {
  fileId: string;
  fileName?: string | null;
}

export interface AttachmentsQuery {
  page?: number;
  limit?: number;
}
