/**
 * User List Card Component
 * Renderiza um cartão de usuário em modo lista
 */

'use client';

import { EntityCard } from '@/core';
import { Calendar, UserCircle } from 'lucide-react';
import type { UserListCardProps } from '../types/users.types';
import { formatLastLogin, getFullName } from '../utils';

export function UserListCard({
  user,
  isSelected,
  onSelectionChange,
  onClick,
  onDoubleClick,
}: UserListCardProps) {
  const fullName = getFullName(user);

  return (
    <EntityCard
      id={user.id}
      variant="list"
      title={user.username}
      subtitle={user.email}
      icon={UserCircle}
      iconBgColor="bg-linear-to-br from-green-500 to-teal-600"
      metadata={
        <div className="flex items-center gap-4 text-xs">
          {fullName && <span>{fullName}</span>}
          {user.lastLoginAt && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatLastLogin(user.lastLoginAt)}
            </span>
          )}
        </div>
      }
      isSelected={isSelected}
      showSelection={true}
      onSelectionChange={onSelectionChange}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      createdAt={user.createdAt}
      updatedAt={user.updatedAt ?? undefined}
      showStatusBadges={false}
    />
  );
}
