'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useUpdateComment,
  useDeleteComment,
  useAddReaction,
} from '@/hooks/tasks/use-comments';
import { MemberAvatar } from '@/components/tasks/shared/member-avatar';
import { EmojiPicker } from '@/components/tasks/shared/emoji-picker';
import { formatRelativeTime } from '@/components/tasks/tabs/_utils';
import type { Comment } from '@/types/tasks';

interface CommentItemProps {
  comment: Comment;
  boardId: string;
  cardId: string;
  currentUserId: string | undefined;
}

export function CommentItem({
  comment,
  boardId,
  cardId,
  currentUserId,
}: CommentItemProps) {
  const updateComment = useUpdateComment(boardId, cardId);
  const deleteComment = useDeleteComment(boardId, cardId);
  const addReaction = useAddReaction(boardId, cardId);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const isOwner = currentUserId === comment.authorId;

  const handleStartEdit = useCallback(() => {
    setEditContent(comment.content);
    setIsEditing(true);
  }, [comment.content]);

  const handleSaveEdit = useCallback(() => {
    const content = editContent.trim();
    if (!content || content === comment.content) {
      setIsEditing(false);
      return;
    }
    updateComment.mutate(
      { commentId: comment.id, data: { content } },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Comentário atualizado');
        },
        onError: () =>
          toast.error(
            'Não foi possível atualizar o comentário. Tente novamente.'
          ),
      }
    );
  }, [comment.id, comment.content, editContent, updateComment]);

  const handleDelete = useCallback(() => {
    deleteComment.mutate(comment.id, {
      onSuccess: () => toast.success('Comentário excluído'),
      onError: () =>
        toast.error('Não foi possível excluir o comentário. Tente novamente.'),
    });
  }, [comment.id, deleteComment]);

  const handleToggleReaction = useCallback(
    (emoji: string) => {
      addReaction.mutate(
        { commentId: comment.id, emoji },
        {
          onError: () =>
            toast.error(
              'Não foi possível atualizar a reação. Tente novamente.'
            ),
        }
      );
    },
    [comment.id, addReaction]
  );

  // Group reactions by emoji
  const groupedReactions = (comment.reactions ?? []).reduce(
    (acc, r) => {
      if (!acc[r.emoji]) {
        acc[r.emoji] = { count: 0, userReacted: false };
      }
      acc[r.emoji].count += 1;
      if (r.userId === currentUserId) {
        acc[r.emoji].userReacted = true;
      }
      return acc;
    },
    {} as Record<string, { count: number; userReacted: boolean }>
  );

  return (
    <div className="flex gap-2.5 py-2.5 group/comment">
      <MemberAvatar
        name={comment.authorName}
        avatarUrl={comment.authorAvatarUrl}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {comment.authorName ?? 'Usuário'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {comment.updatedAt && (
            <span className="text-[10px] text-muted-foreground italic">
              (editado)
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1.5 space-y-1.5">
            <Textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={2}
              autoFocus
              className="text-sm"
            />
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleSaveEdit}
                disabled={updateComment.isPending}
              >
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm mt-0.5 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}

        {/* Reactions + Actions */}
        <div className="flex items-center justify-between mt-1.5 gap-2">
          {/* Existing reactions */}
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <button
                key={emoji}
                type="button"
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] border transition-colors',
                  data.userReacted
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted text-foreground'
                )}
                onClick={() => handleToggleReaction(emoji)}
              >
                <span>{emoji}</span>
                <span className="font-semibold">{data.count}</span>
              </button>
            ))}
          </div>

          {/* Action buttons — right side, visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover/comment:opacity-100 transition-opacity shrink-0">
            <EmojiPicker
              onSelect={handleToggleReaction}
              triggerClassName="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-colors"
            />
            {isOwner && (
              <>
                <button
                  type="button"
                  title="Editar"
                  className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-colors"
                  onClick={handleStartEdit}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Excluir"
                  className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
