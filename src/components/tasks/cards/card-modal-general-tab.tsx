'use client';

import { AttachmentSection } from './attachment-section';
import { CustomFieldsSection } from './custom-fields-section';
import { MemberAvatar } from '@/components/tasks/shared/member-avatar';
import { CommentInput } from '@/components/tasks/shared/comment-input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CardAttachment, CustomField } from '@/types/tasks';

interface CommentPreview {
  id: string;
  content: string;
  authorName: string | null;
  authorAvatarUrl?: string | null;
  createdAt: string;
}

interface CardModalGeneralTabProps {
  // Description
  description: string;
  onDescriptionChange: (value: string) => void;
  onDescriptionBlur: () => void;
  // Attachments
  attachments: CardAttachment[];
  onUploadAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onLinkStorageFile?: (file: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
  }) => void;
  // Custom fields
  boardId: string;
  customFields: CustomField[];
  customFieldValues: Record<string, string>;
  onCustomFieldChange: (fieldId: string, value: string) => void;
  // Comments preview
  recentComments: CommentPreview[];
  totalComments?: number;
  onAddComment?: (content: string) => void;
  onViewAllComments?: () => void;
  // Current user (for comment input avatar)
  currentUserName?: string | null;
  currentUserAvatarUrl?: string | null;
  // Mode
  isCreateMode?: boolean;
}

export function CardModalGeneralTab({
  description,
  onDescriptionChange,
  onDescriptionBlur,
  attachments,
  onUploadAttachment,
  onRemoveAttachment,
  onLinkStorageFile,
  boardId,
  customFields,
  customFieldValues,
  onCustomFieldChange,
  recentComments,
  totalComments,
  onAddComment,
  onViewAllComments,
  currentUserName,
  currentUserAvatarUrl,
  isCreateMode = false,
}: CardModalGeneralTabProps) {
  const showAttachments = !isCreateMode || attachments.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {/* Description */}
        <div>
          <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
            Descrição
          </p>
          <Textarea
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            onBlur={onDescriptionBlur}
            placeholder="Adicionar descrição..."
            rows={3}
            className="text-sm resize-none border-border bg-muted/30 dark:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-primary/40"
          />
        </div>

        {/* Attachments — hidden in create mode when empty */}
        {showAttachments && (
          <AttachmentSection
            attachments={attachments}
            onUpload={onUploadAttachment}
            onRemove={onRemoveAttachment}
            onLinkStorageFile={onLinkStorageFile}
          />
        )}

        {/* Custom Fields */}
        <CustomFieldsSection
          boardId={boardId}
          fields={customFields}
          values={customFieldValues}
          onChange={onCustomFieldChange}
        />

        {/* Recent Comments Preview */}
        {!isCreateMode && (
          <div className="space-y-2">
            {recentComments.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">
                  Últimos comentários
                </p>
                {onViewAllComments && (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[10px] text-primary hover:underline transition-colors"
                    onClick={onViewAllComments}
                  >
                    Ver todos
                    {totalComments != null ? ` (${totalComments})` : ''}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {recentComments.length > 0 ? (
              <div className="space-y-2">
                {recentComments.slice(0, 3).map(comment => (
                  <div
                    key={comment.id}
                    className="flex gap-2 rounded-md border border-border bg-muted/40 dark:bg-white/[0.04] p-2.5"
                  >
                    <MemberAvatar
                      name={comment.authorName}
                      avatarUrl={comment.authorAvatarUrl}
                      size="sm"
                      className="h-5 w-5 text-[8px] shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium truncate">
                          {comment.authorName ?? 'Desconhecido'}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {format(new Date(comment.createdAt), 'dd/MM HH:mm', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground py-2">
                <MessageSquare className="h-3.5 w-3.5 opacity-50" />
                Nenhum comentário ainda
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky comment input — "With avatar and actions" style */}
      {!isCreateMode && onAddComment && (
        <div className="shrink-0 border-t border-border/50 pt-3 mt-3">
          <CommentInput
            userName={currentUserName}
            userAvatarUrl={currentUserAvatarUrl}
            onSubmit={onAddComment}
            placeholder="Escrever comentário..."
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
