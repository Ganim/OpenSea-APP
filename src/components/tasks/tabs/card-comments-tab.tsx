'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { useComments, useCreateComment } from '@/hooks/tasks/use-comments';
import { useAuth } from '@/contexts/auth-context';
import { CommentItem } from './comment-item';

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

  const [newContent, setNewContent] = useState('');

  // Auto-scroll to bottom when new comments arrive (messaging mode)
  useEffect(() => {
    if (messagingLayout && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length, messagingLayout]);

  const handleCreateComment = useCallback(() => {
    const content = newContent.trim();
    if (!content) return;

    createComment.mutate(
      { content },
      {
        onSuccess: () => {
          setNewContent('');
        },
        onError: () =>
          toast.error(
            'Não foi possível adicionar o comentário. Tente novamente.'
          ),
      }
    );
  }, [newContent, createComment]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleCreateComment();
      }
    },
    [handleCreateComment]
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
          <div className="flex items-end gap-2">
            <Textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva um comentário... (Enter para enviar)"
              rows={1}
              className="text-sm min-h-[36px] max-h-[100px] resize-none"
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleCreateComment}
              disabled={createComment.isPending || !newContent.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Original layout (used in tabs)
  return (
    <div className="space-y-4 flex-col w-full">
      {/* Comment input */}
      <div className="space-y-2">
        <Textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleCreateComment}
            disabled={createComment.isPending || !newContent.trim()}
          >
            Comentar
          </Button>
        </div>
      </div>

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
