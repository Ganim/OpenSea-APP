'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  useUpdateComment,
  useDeleteComment,
  useAddReaction,
  useRemoveReaction,
} from '@/hooks/tasks/use-comments';
import { MemberAvatar } from '@/components/tasks/shared/member-avatar';
import { formatRelativeTime } from '@/components/tasks/tabs/_utils';
import { CommentEmojiPicker } from './comment-emoji-picker';
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
  const removeReaction = useRemoveReaction(boardId, cardId);

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
      const existingReaction = comment.reactions?.find(
        r => r.emoji === emoji && r.userId === currentUserId
      );
      if (existingReaction) {
        removeReaction.mutate(
          { commentId: comment.id, emoji },
          {
            onError: () =>
              toast.error(
                'Não foi possível remover a reação. Tente novamente.'
              ),
          }
        );
      } else {
        addReaction.mutate(
          { commentId: comment.id, emoji },
          {
            onError: () =>
              toast.error(
                'Não foi possível adicionar a reação. Tente novamente.'
              ),
          }
        );
      }
    },
    [comment.id, comment.reactions, currentUserId, addReaction, removeReaction]
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

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-auto opacity-0 group-hover/comment:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartEdit}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <button
                key={emoji}
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] border transition-colors ${
                  data.userReacted
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border hover:bg-muted'
                }`}
                onClick={() => handleToggleReaction(emoji)}
              >
                <span>{emoji}</span>
                <span className="font-medium">{data.count}</span>
              </button>
            ))}

            <CommentEmojiPicker onSelectEmoji={handleToggleReaction} />
          </div>
        )}
      </div>
    </div>
  );
}
