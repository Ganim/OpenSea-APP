'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const QUICK_EMOJIS = ['👍', '👎', '❤️', '🎉', '😄', '😮', '🤔', '👀'];

interface CommentEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
}

export function CommentEmojiPicker({ onSelectEmoji }: CommentEmojiPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(emoji: string) {
    onSelectEmoji(emoji);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-full h-5 w-5 border border-dashed border-border/50 text-muted-foreground hover:bg-muted transition-colors opacity-0 group-hover/comment:opacity-100">
          <SmilePlus className="h-2.5 w-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1.5" align="start">
        <div className="flex gap-0.5">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors text-sm"
              onClick={() => handleSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { QUICK_EMOJIS };
