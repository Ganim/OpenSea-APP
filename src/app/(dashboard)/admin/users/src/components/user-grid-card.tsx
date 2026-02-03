/**
 * User Grid Card Component
 * Renderiza um cartão de usuário em modo grid
 */

'use client';

import { UniversalCard } from '@/core';
import { Calendar, Shield, UserCircle } from 'lucide-react';
import type { UserGridCardProps } from '../types/users.types';
import { formatLastLogin, getFullName } from '../utils';

export function UserGridCard({
  user,
  isSelected,
  onSelectionChange,
  onClick,
  onDoubleClick,
  onManageGroups,
}: UserGridCardProps) {
  const fullName = getFullName(user);

  return (
    <UniversalCard
      id={user.id}
      variant="grid"
      title={user.username}
      subtitle={user.email}
      icon={UserCircle}
      iconBgColor="bg-linear-to-br from-green-500 to-teal-600"
      metadata={
        <div className="flex flex-col gap-1 text-xs">
          {fullName && <span>{fullName}</span>}
          {user.lastLoginAt && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Último acesso: {formatLastLogin(user.lastLoginAt)}
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
      actions={[
        {
          id: 'manage-groups',
          label: 'Gerenciar Grupos de Permissões',
          icon: Shield,
          onClick: () => onManageGroups(user),
        },
      ]}
    />
  );
}
