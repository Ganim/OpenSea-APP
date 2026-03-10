// Attachment Types

export interface Attachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  label?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttachmentRequest {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  label?: string;
  order?: number;
}
