'use client';

import { useState, useRef, useCallback } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MemberAvatar } from './member-avatar';
import { EmojiPicker } from './emoji-picker';

interface CommentInputProps {
  /** User display name for the avatar */
  userName?: string | null;
  /** User avatar URL */
  userAvatarUrl?: string | null;
  /** Called when the user submits a comment */
  onSubmit: (content: string) => void;
  /** Disable while sending */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Number of visible rows */
  rows?: number;
  /** Additional class for the root container */
  className?: string;
}

export function CommentInput({
  userName,
  userAvatarUrl,
  onSubmit,
  disabled = false,
  placeholder = 'Escrever comentário...',
  rows = 3,
  className,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setContent('');
  }, [content, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.slice(0, start) + emoji + content.slice(end);
        setContent(newContent);
        // Restore cursor after emoji
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + emoji.length;
          textarea.focus();
        });
      } else {
        setContent(prev => prev + emoji);
      }
    },
    [content]
  );

  return (
    <div className={cn('flex items-start gap-3', className)}>
      {/* Avatar */}
      <MemberAvatar
        name={userName}
        avatarUrl={userAvatarUrl}
        size="md"
        className="h-9 w-9 text-xs shrink-0 mt-0.5"
      />

      {/* Comment box */}
      <div
        className={cn(
          'flex-1 rounded-lg border border-slate-300 bg-slate-50 transition-shadow',
          'focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200',
          'dark:border-slate-600 dark:bg-slate-800/60',
          'dark:focus-within:border-slate-500 dark:focus-within:ring-slate-600/30'
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(
            'block w-full resize-none rounded-t-lg bg-transparent px-3 py-2 text-sm',
            'text-foreground placeholder:text-slate-400',
            'focus:outline-none disabled:opacity-50',
            'dark:placeholder:text-slate-500',
            'scrollbar-thin'
          )}
        />

        {/* Action bar */}
        <div
          className={cn(
            'flex items-center justify-between border-t border-slate-200 bg-slate-100 px-3 py-1.5 rounded-b-lg',
            'dark:border-slate-700 dark:bg-slate-800'
          )}
        >
          {/* Left icons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700/60 transition-colors"
              title="Anexar arquivo"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <EmojiPicker
              onSelect={handleEmojiSelect}
              triggerClassName="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700/60 transition-colors"
            />
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !content.trim()}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm',
              'bg-slate-800 text-white',
              'hover:bg-slate-700',
              'dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <Send className="h-3 w-3" />
            Comentar
          </button>
        </div>
      </div>
    </div>
  );
}
