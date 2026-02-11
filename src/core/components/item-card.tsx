/**
 * OpenSea OS - ItemCard Component
 * Componente de card genérico reutilizável para qualquer entidade
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { LucideIcon, RefreshCw, Sparkles } from 'lucide-react';
import Image from 'next/image';
import React, { ComponentType, ReactNode, forwardRef } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type CardVariant = 'grid' | 'list' | 'compact';

export interface CardBadge {
  /** Texto do badge */
  label: string;
  /** Variante visual */
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  /** Cor customizada (Tailwind classes) */
  color?: string;
  /** Ícone do badge */
  icon?: LucideIcon | ComponentType<{ className?: string }>;
}

export interface CardAction {
  /** ID único da ação */
  id: string;
  /** Label da ação */
  label: string;
  /** Ícone da ação */
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  /** Handler da ação */
  onClick: (e: React.MouseEvent) => void;
  /** Variante do botão */
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  /** Ação desabilitada */
  disabled?: boolean;
}

export interface ItemCardProps {
  /** ID do item */
  id: string;
  /** Variante de exibição */
  variant?: CardVariant;

  // Conteúdo Principal
  /** Título/nome do item */
  title: string;
  /** Subtítulo/descrição */
  subtitle?: string;
  /** Linha de metadados (text ou ReactNode) */
  metadata?: ReactNode;

  // Visual
  /** Ícone do card */
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  /** Cor de fundo do ícone (Tailwind classes) */
  iconBgColor?: string;
  /** URL da imagem/thumbnail */
  thumbnail?: string;
  /** Placeholder para imagem */
  thumbnailFallback?: ReactNode;

  // Badges
  /** Lista de badges */
  badges?: CardBadge[];
  /** Data de criação (para badge "Novo") */
  createdAt?: Date | string;
  /** Data de atualização (para badge "Atualizado") */
  updatedAt?: Date | string;
  /** Mostrar badges de Novo/Atualizado automaticamente */
  showStatusBadges?: boolean;

  // Seleção
  /** Se o card está selecionado */
  isSelected?: boolean;
  /** Se mostra checkbox de seleção */
  showSelection?: boolean;
  /** Callback quando checkbox muda */
  onSelectionChange?: (checked: boolean) => void;

  // Interação
  /** Callback ao clicar */
  onClick?: (e: React.MouseEvent) => void;
  /** Callback ao duplo clique */
  onDoubleClick?: (e: React.MouseEvent) => void;
  /** Se o card é clicável */
  clickable?: boolean;

  // Ações
  /** Ações inline do card */
  actions?: CardAction[];

  // Customização
  /** Classes customizadas para o container */
  className?: string;
  /** Conteúdo customizado no final do card */
  footer?: ReactNode;
  /** Conteúdo customizado adicional */
  children?: ReactNode;

  // Data attribute para detecção de drag
  'data-item-card'?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Calcula se um item é novo ou foi atualizado nas últimas 24 horas
 */
function getItemBadges(
  createdAt?: Date | string,
  updatedAt?: Date | string
): { isNew: boolean; isUpdated: boolean } {
  if (!createdAt) {
    return { isNew: false, isUpdated: false };
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const created =
    typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const updated = updatedAt
    ? typeof updatedAt === 'string'
      ? new Date(updatedAt)
      : updatedAt
    : null;

  // Verifica se foi criado nas últimas 24h
  const isNew = created > oneDayAgo;

  // Verifica se foi atualizado nas últimas 24h (e não é no momento da criação)
  const isUpdated =
    updated && updated > oneDayAgo && updated > created ? true : false;

  return { isNew, isUpdated };
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ItemCard = forwardRef<HTMLDivElement, ItemCardProps>(
  (
    {
      id,
      variant = 'grid',
      title,
      subtitle,
      metadata,
      icon: Icon,
      iconBgColor = 'bg-linear-to-br from-blue-500 to-purple-600',
      thumbnail,
      thumbnailFallback,
      badges = [],
      createdAt,
      updatedAt,
      showStatusBadges = true,
      isSelected = false,
      showSelection = false,
      onSelectionChange,
      onClick,
      onDoubleClick,
      clickable = true,
      actions,
      className,
      footer,
      children,
      'data-item-card': dataItemCard = true,
    },
    ref
  ) => {
    const { isNew, isUpdated } = showStatusBadges
      ? getItemBadges(createdAt, updatedAt)
      : { isNew: false, isUpdated: false };

    // Base classes para diferentes variantes
    const baseClasses = cn(
      'border-gray-200/50 dark:border-white/10 transition-all duration-200',
      clickable && 'cursor-pointer',
      isSelected
        ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
        : 'bg-white/90 dark:bg-white/5 hover:bg-white/95 dark:hover:bg-white/10',
      clickable && !isSelected && 'hover:shadow-lg'
    );

    // Padding baseado na variante
    const paddingClasses = {
      grid: 'p-6',
      list: 'p-4',
      compact: 'p-3',
    };

    // Tamanho do ícone baseado na variante
    const iconSizeClasses = {
      grid: 'w-12 h-12 rounded-xl',
      list: 'w-10 h-10 rounded-lg',
      compact: 'w-8 h-8 rounded-md',
    };

    const iconInnerSizeClasses = {
      grid: 'w-6 h-6',
      list: 'w-5 h-5',
      compact: 'w-4 h-4',
    };

    // Renderizar ícone ou thumbnail
    const renderIcon = () => {
      if (thumbnail) {
        return (
          <div
            className={cn(iconSizeClasses[variant], 'overflow-hidden shrink-0')}
          >
            <Image
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        );
      }

      if (Icon) {
        return (
          <div
            className={cn(
              iconSizeClasses[variant],
              'flex items-center justify-center text-white shrink-0',
              isSelected ? 'bg-blue-600' : iconBgColor
            )}
          >
            <Icon className={iconInnerSizeClasses[variant]} />
          </div>
        );
      }

      if (thumbnailFallback) {
        return (
          <div
            className={cn(
              iconSizeClasses[variant],
              'flex items-center justify-center shrink-0',
              isSelected ? 'bg-blue-600' : iconBgColor
            )}
          >
            {thumbnailFallback}
          </div>
        );
      }

      return null;
    };

    // Renderizar badges de status (Novo/Atualizado)
    const renderStatusBadges = () => (
      <div className="flex gap-1">
        {isNew && (
          <Badge
            variant="default"
            className="bg-cyan-400 dark:bg-cyan-500/70 text-white shadow-md shadow-cyan-400/50 dark:shadow-cyan-500/20"
          >
            <Sparkles className="w-3 h-3" />
          </Badge>
        )}
        {isUpdated && (
          <Badge
            variant="secondary"
            className="bg-amber-400 dark:bg-amber-500/70 text-white flex items-center gap-1 shadow-md shadow-amber-400/50 dark:shadow-amber-500/20"
          >
            <RefreshCw className="w-3 h-3" />
          </Badge>
        )}
      </div>
    );

    // Renderizar badges customizados
    const renderBadges = () => (
      <div className="flex items-center gap-2 flex-wrap">
        {badges.map((badge, index) => {
          const BadgeIcon = badge.icon;
          return (
            <Badge
              key={index}
              variant={badge.variant || 'secondary'}
              className={cn('text-xs', badge.color)}
            >
              {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
              {badge.label}
            </Badge>
          );
        })}
      </div>
    );

    // Renderizar checkbox de seleção
    const renderCheckbox = () => {
      if (!showSelection) return null;

      return (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          onClick={e => e.stopPropagation()}
          className="h-4 w-4"
        />
      );
    };

    // ==========================================================================
    // VARIANT: GRID
    // ==========================================================================
    if (variant === 'grid') {
      return (
        <Card
          ref={ref}
          data-item-card={dataItemCard || undefined}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          className={cn(baseClasses, 'group, cursor-pointer p-0', className)}
        >
          <div
            className={cn(paddingClasses[variant], 'gap-4 flex flex-col pb-2')}
          >
            {/* Header: Icon + Status Badges */}
            <div className="flex items-start justify-between gap-4">
              <div>{renderIcon()}</div>
              <div className="flex-1 items-start gap-2 ">
                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white  truncate">
                  {title}
                </h3>
                {/* Subtitle */}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400  line-clamp-2">
                    {subtitle}
                  </p>
                )}
              </div>
              <div>{renderStatusBadges()}</div>
            </div>

            {/* Badges */}
            {badges.length > 0 && <div className="">{renderBadges()}</div>}

            {/* Metadata */}
            {metadata && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metadata}
              </div>
            )}

            {/* Children */}
            {children}
          </div>
          {/* Footer */}
          {footer}
        </Card>
      );
    }

    // ==========================================================================
    // VARIANT: LIST
    // ==========================================================================
    if (variant === 'list') {
      return (
        <Card
          ref={ref}
          data-item-card={dataItemCard || undefined}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          className={cn(
            baseClasses,
            paddingClasses[variant],
            'group',
            className
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {renderCheckbox()}
              {renderIcon()}
              <div className="flex-1 min-w-0">
                <div className="flex gap-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                  {subtitle && <span>{subtitle}</span>}
                  {metadata}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-2 shrink-0">
              {badges.length > 0 && renderBadges()}
              {renderStatusBadges()}
              {children}
            </div>
          </div>

          {footer}
        </Card>
      );
    }

    // ==========================================================================
    // VARIANT: COMPACT
    // ==========================================================================
    return (
      <Card
        ref={ref}
        data-item-card={dataItemCard || undefined}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={cn(baseClasses, paddingClasses[variant], 'group', className)}
      >
        <div className="flex items-center gap-3">
          {renderCheckbox()}
          {renderIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {badges.length > 0 && renderBadges()}
          {renderStatusBadges()}
          {children}
        </div>
      </Card>
    );
  }
);

ItemCard.displayName = 'ItemCard';

export default ItemCard;
