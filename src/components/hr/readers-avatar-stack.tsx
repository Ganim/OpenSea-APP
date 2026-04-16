'use client';

/**
 * ReadersAvatarStack
 *
 * Overlapping avatar stack used to show the most recent readers of an
 * announcement. Reference: Notion "viewers" stack and Slack reactions stack.
 *
 * - Avatars overlap with `-ml-2`.
 * - Tooltip shows full name + optional `readAt`.
 * - When the count exceeds `limit`, an extra `+N` chip is appended.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ReaderAvatar {
  id: string;
  fullName: string;
  photoUrl?: string | null;
  readAt?: string | null;
}

interface ReadersAvatarStackProps {
  readers: ReaderAvatar[];
  /** Maximum avatars rendered before the `+N` chip kicks in. Defaults to 5. */
  limit?: number;
  /** Optional className applied to the wrapper. */
  className?: string;
  /** Tailwind size class applied to each avatar. Defaults to `size-7`. */
  size?: 'size-6' | 'size-7' | 'size-8' | 'size-9';
  /** Total audience size (used by the +N tooltip). When omitted, falls back to readers length. */
  totalReaders?: number;
  /** data-testid for the wrapper element. */
  testId?: string;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

function formatReadAt(value?: string | null): string | null {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

export function ReadersAvatarStack({
  readers,
  limit = 5,
  className,
  size = 'size-7',
  totalReaders,
  testId = 'readers-stack',
}: ReadersAvatarStackProps) {
  const visibleReaders = readers.slice(0, limit);
  const remainingCount =
    (totalReaders ?? readers.length) - visibleReaders.length;

  if (visibleReaders.length === 0) {
    return (
      <span
        data-testid={testId}
        className="text-xs text-muted-foreground italic"
      >
        Ninguem leu ainda
      </span>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div data-testid={testId} className={cn('flex items-center', className)}>
        {visibleReaders.map((reader, index) => {
          const hue = hashHue(reader.fullName);
          const formattedReadAt = formatReadAt(reader.readAt);
          return (
            <Tooltip key={reader.id}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'relative inline-block',
                    index > 0 && '-ml-2',
                    'ring-2 ring-white dark:ring-slate-900 rounded-full transition-transform hover:-translate-y-0.5'
                  )}
                  style={{ zIndex: visibleReaders.length - index }}
                >
                  <Avatar className={size}>
                    {reader.photoUrl ? (
                      <AvatarImage
                        src={reader.photoUrl}
                        alt={reader.fullName}
                      />
                    ) : null}
                    <AvatarFallback
                      className="text-[0.625rem] font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 30) % 360}, 65%, 45%))`,
                      }}
                    >
                      {getInitials(reader.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="font-medium">{reader.fullName}</span>
                {formattedReadAt ? (
                  <span className="block text-[0.6875rem] opacity-80">
                    Leu em {formattedReadAt}
                  </span>
                ) : null}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  size,
                  '-ml-2 inline-flex items-center justify-center rounded-full',
                  'bg-slate-200 text-slate-700 ring-2 ring-white text-[0.625rem] font-semibold',
                  'dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-900'
                )}
                style={{ zIndex: 0 }}
              >
                +{remainingCount}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {remainingCount} outros leitores
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

export default ReadersAvatarStack;
