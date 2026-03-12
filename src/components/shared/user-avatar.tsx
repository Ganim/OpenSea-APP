'use client';

import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { storageFilesService } from '@/services/storage/files.service';

interface UserAvatarProps {
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Gera uma cor de fundo baseada no nome do usuário
 * Usa um hash simples para gerar cores consistentes para o mesmo nome
 */
function generateColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Extrai as iniciais do nome
 */
function getInitials(
  name?: string | null,
  surname?: string | null,
  email?: string | null
): string {
  if (name && surname) {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  }

  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return 'U';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

export function UserAvatar({
  name,
  surname,
  email,
  avatarUrl,
  size = 'md',
  className,
}: UserAvatarProps) {
  const initials = getInitials(name, surname, email);
  const displayName = name || surname || email || 'User';
  const bgColor = generateColorFromName(displayName);

  // Resolve storage serve URLs (e.g. /v1/storage/files/:id/serve) to full URLs with auth token
  const resolvedAvatarUrl = useMemo(() => {
    if (!avatarUrl) return null;
    const match = avatarUrl.match(/\/v1\/storage\/files\/([^/]+)\/serve/);
    if (match) return storageFilesService.getServeUrl(match[1]);
    return avatarUrl;
  }, [avatarUrl]);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {resolvedAvatarUrl && (
        <AvatarImage src={resolvedAvatarUrl} alt={displayName} />
      )}
      <AvatarFallback
        className={cn(
          bgColor,
          'text-white font-semibold',
          'flex items-center justify-center'
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
