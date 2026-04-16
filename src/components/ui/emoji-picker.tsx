/**
 * Emoji Picker
 *
 * Popover compacto com 16 emojis comuns para reactions tipo Slack/Lattice.
 * Ao clicar em um emoji, dispara `onSelect(emoji)` e fecha o popover.
 */

'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Curated 16-emoji palette covering positive workplace reactions. */
export const COMMON_REACTION_EMOJIS = [
  '👏',
  '🎉',
  '❤️',
  '🔥',
  '🚀',
  '⭐',
  '💪',
  '🙌',
  '✨',
  '💯',
  '🏆',
  '🎯',
  '💡',
  '🌟',
  '👍',
  '🤝',
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  /** Disables the trigger and prevents opening the popover. */
  disabled?: boolean;
  /** Replaces the default trigger button. */
  trigger?: ReactNode;
  /** Side where the popover should open. Defaults to "top". */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment relative to the trigger. Defaults to "start". */
  align?: 'start' | 'center' | 'end';
  /** Optional data-testid prefix for the trigger and grid buttons. */
  testIdPrefix?: string;
}

export function EmojiPicker({
  onSelect,
  disabled,
  trigger,
  side = 'top',
  align = 'start',
  testIdPrefix = 'emoji-picker',
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {trigger ?? (
          <button
            type="button"
            disabled={disabled}
            data-testid={`${testIdPrefix}-trigger`}
            aria-label="Adicionar reacao"
            className={cn(
              'inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-border bg-transparent px-2 text-xs text-muted-foreground transition-colors',
              'hover:border-primary/40 hover:bg-primary/5 hover:text-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        className="w-auto p-2"
        data-testid={`${testIdPrefix}-content`}
      >
        <div className="grid grid-cols-4 gap-1">
          {COMMON_REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              data-testid={`${testIdPrefix}-emoji-${emoji}`}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md text-lg transition-transform',
                'hover:scale-125 hover:bg-accent',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              aria-label={`Reagir com ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
