'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const ERP_EMOJIS = [
  { emoji: '👍', label: 'Concordo' },
  { emoji: '🎉', label: 'Ótimo' },
  { emoji: '🚀', label: 'Bora' },
  { emoji: '👀', label: 'Analisando' },
  { emoji: '✅', label: 'Feito' },
  { emoji: '🔥', label: 'Urgente' },
] as const;

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  triggerClassName?: string;
}

export function EmojiPicker({ onSelect, triggerClassName }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          title="Adicionar emoji"
        >
          <SmilePlus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-1.5 z-[60]"
        align="start"
        side="top"
        sideOffset={8}
      >
        <div className="flex items-center gap-0.5">
          {ERP_EMOJIS.map(({ emoji, label }) => (
            <button
              key={emoji}
              type="button"
              title={label}
              className="h-8 w-8 flex items-center justify-center rounded-md text-lg hover:bg-muted transition-colors"
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { ERP_EMOJIS };
