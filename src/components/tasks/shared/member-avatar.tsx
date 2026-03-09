'use client';

import { cn } from '@/lib/utils';
import { storageFilesService } from '@/services/storage/files.service';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMemo } from 'react';

interface MemberAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-orange-500',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
} as const;

export function MemberAvatar({
  name,
  avatarUrl,
  size = 'sm',
  className,
}: MemberAvatarProps) {
  const displayName = name || '?';
  const initials = getInitials(displayName);
  const colorClass = getColorFromName(displayName);

  const resolvedAvatarUrl = useMemo(() => {
    if (!avatarUrl) return null;
    const match = avatarUrl.match(/\/v1\/storage\/files\/([^/]+)\/serve/);
    if (match) return storageFilesService.getServeUrl(match[1]);
    return avatarUrl;
  }, [avatarUrl]);

  const avatar = resolvedAvatarUrl ? (
    <img
      src={resolvedAvatarUrl}
      alt={displayName}
      className={cn(
        'rounded-full object-cover shrink-0',
        sizeClasses[size],
        className
      )}
    />
  ) : (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white shrink-0',
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );

  if (!name) return avatar;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
