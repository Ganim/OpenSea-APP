export type EmailFolderType =
  | 'INBOX'
  | 'SENT'
  | 'DRAFTS'
  | 'TRASH'
  | 'SPAM'
  | 'CUSTOM';

export interface EmailFolder {
  id: string;
  accountId: string;
  remoteName: string;
  displayName: string;
  type: EmailFolderType;
  uidValidity: number | null;
  lastUid: number | null;
  totalMessages: number;
  unreadMessages: number;
  updatedAt: string;
}

export interface EmailFoldersResponse {
  data: EmailFolder[];
}
