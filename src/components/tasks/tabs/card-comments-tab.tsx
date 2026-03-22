'use client';

import { useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';
import { useComments, useCreateComment } from '@/hooks/tasks/use-comments';
import { useAuth } from '@/contexts/auth-context';
import { CommentItem } from './comment-item';
import { CommentInput } from '@/components/tasks/shared/comment-input';

interface CardCommentsTabProps {
  boardId: string;
  cardId: string;
  /** Render in messaging layout: scrollable messages above, input pinned below */
  messagingLayout?: boolean;
}

export function CardCommentsTab({
  boardId,
  cardId,
  messagingLayout,
}: CardCommentsTabProps) {
  const { user } = useAuth();
  const { data: commentsData, isLoading } = useComments(boardId, cardId);
  const createComment = useCreateComment(boardId, cardId);

  const comments = commentsData?.comments ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  const userName = user?.profile?.name
    ? `${user.profile.name}${user.profile.surname ? ` ${user.profile.surname}` : ''}`
    : (user?.username ?? null);
  const userAvatarUrl = user?.profile?.avatarUrl ?? null;

  // Auto-scroll to bottom when new comments arrive (messaging mode)
  useEffect(() => {
    if (messagingLayout && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length, messagingLayout]);

  const handleCreateComment = useCallback(
    (content: string) => {
      createComment.mutate(
        { content },
        {
          onError: () =>
            toast.error(
              'Não foi possível adicionar o comentário. Tente novamente.'
            ),
        }
      );
    },
    [createComment]
  );

  // Messaging layout: messages above, input pinned below
  if (messagingLayout) {
    return (
      <div className="flex flex-col h-full">
        {/* Scrollable messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">Nenhum comentário ainda</p>
              <p className="text-[10px] mt-1 opacity-60">
                Inicie uma conversa sobre esta tarefa
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 py-2">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  boardId={boardId}
                  cardId={cardId}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pinned input at bottom */}
        <div className="shrink-0 border-t border-border/50 p-3 bg-muted/30">
          <CommentInput
            userName={userName}
            userAvatarUrl={userAvatarUrl}
            onSubmit={handleCreateComment}
            disabled={createComment.isPending}
            placeholder="Escreva um comentário... (Enter para enviar)"
            rows={2}
          />
        </div>
      </div>
    );
  }

  // Original layout (used in tabs)
  return (
    <div className="space-y-4 flex-col w-full">
      {/* Comment input */}
      <CommentInput
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        onSubmit={handleCreateComment}
        disabled={createComment.isPending}
        rows={3}
      />

      {/* Comments list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Nenhum comentário</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              boardId={boardId}
              cardId={cardId}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
