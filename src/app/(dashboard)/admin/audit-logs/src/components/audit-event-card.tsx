'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MODULE_COLORS, getEntityLabel, getModuleLabel } from '../constants';
import type { AuditLog } from '../types';
import {
  countChangedFields,
  formatAuditNarrative,
  formatCompactTimestamp,
  formatRelativeTimestamp,
  getActionStyle,
} from '../utils';

interface AuditEventCardProps {
  log: AuditLog;
  onSelect?: (log: AuditLog) => void;
}

export const AuditEventCard: React.FC<AuditEventCardProps> = ({
  log,
  onSelect,
}) => {
  const style = getActionStyle(log.action);
  const narrative = formatAuditNarrative(log);
  const changesCount = countChangedFields(log);
  const Icon = style.icon;
  const moduleColors = MODULE_COLORS[log.module] || MODULE_COLORS.OTHER;

  const handleSelect = () => {
    if (onSelect) onSelect(log);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      className="relative flex items-start gap-3 px-4 py-3 rounded-lg border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:shadow-md hover:bg-gray-50/80 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
    >
      {/* Indicador lateral colorido */}
      <div
        className={cn('absolute inset-y-0 left-0 w-1 rounded-l-lg', style.bg)}
      />

      {/* Ícone */}
      <div
        className={cn(
          'mt-0.5 rounded-full border p-1.5 shrink-0',
          style.bg,
          style.border
        )}
      >
        <Icon className={cn('w-3.5 h-3.5', style.text)} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {/* Linha 1: narrativa estruturada com destaque no ator e alvo */}
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
            <span className="font-medium text-gray-900 dark:text-white">
              {narrative.actor.label}
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {narrative.verb}
            </span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {narrative.target.label}
            </span>
          </p>
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
            {formatRelativeTimestamp(log.createdAt)}
          </span>
        </div>

        {/* Linha 2: badges à esquerda + data completa à direita */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] leading-tight px-1.5 py-0 h-[18px]',
                moduleColors.bg,
                moduleColors.text,
                moduleColors.border
              )}
            >
              {getModuleLabel(log.module)}
            </Badge>

            <span className="text-gray-300 dark:text-gray-600 text-[10px]">
              ·
            </span>

            <Badge
              variant="secondary"
              className="text-[10px] leading-tight px-1.5 py-0 h-[18px]"
            >
              {getEntityLabel(log.entity)}
            </Badge>

            {changesCount > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600 text-[10px]">
                  ·
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  {changesCount} alteração{changesCount > 1 ? 'es' : ''}
                </span>
              </>
            )}
          </div>

          <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
            {formatCompactTimestamp(log.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
