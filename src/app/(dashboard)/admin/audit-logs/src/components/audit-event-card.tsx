'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import {
  MODULE_COLORS,
  getActionLabel,
  getEntityLabel,
  getModuleLabel,
} from '../constants';
import type { AuditLog } from '../types';
import {
  countChangedFields,
  formatAuditNarrative,
  formatAuditTimestamp,
  getActionStyle,
} from '../utils';

interface AuditEventCardProps {
  log: AuditLog;
  onSelect?: (log: AuditLog) => void;
}

const ActorBadge = ({
  label,
  isSystem,
}: {
  label: string;
  isSystem: boolean;
}) => (
  <div
    className={cn(
      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium border',
      isSystem
        ? 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800'
        : 'bg-linear-to-r from-blue-600 to-cyan-500 text-white border-transparent'
    )}
  >
    <Avatar className="h-6 w-6 border border-white/40 shadow-sm">
      <AvatarFallback className="text-xs font-semibold">
        {label.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <span className="truncate max-w-[150px]">{label}</span>
  </div>
);

const TargetBadge = ({ label }: { label: string }) => (
  <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 py-1 text-sm font-medium border border-gray-200 dark:border-gray-800">
    <span className="truncate max-w-[180px]">{label}</span>
  </div>
);

export const AuditEventCard: React.FC<AuditEventCardProps> = ({
  log,
  onSelect,
}) => {
  const style = getActionStyle(log.action);
  const { sentence, actor, target, timestamp } = formatAuditNarrative(log);
  const changesCount = countChangedFields(log);
  const Icon = style.icon;

  const handleSelect = () => {
    if (onSelect) onSelect(log);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      className="relative overflow-hidden border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:shadow-md transition-all"
    >
      <div className={cn('absolute inset-y-0 left-0 w-1', style.bg)} />

      <div className="p-4 flex gap-4">
        <div
          className={cn(
            'rounded-full border p-2 shadow-sm',
            style.bg,
            style.border
          )}
        >
          <Icon className={cn('w-4 h-4', style.text)} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <HoverCard openDelay={150}>
              <HoverCardTrigger asChild>
                <div>
                  <ActorBadge label={actor.label} isSystem={actor.isSystem} />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 text-sm">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {actor.label}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {actor.description}
                </p>
                {log.ip && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    IP: {log.ip}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {timestamp}
                </p>
              </HoverCardContent>
            </HoverCard>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {style.verb}
            </span>

            <HoverCard openDelay={150}>
              <HoverCardTrigger asChild>
                <div>
                  <TargetBadge label={target.label} />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 text-sm space-y-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {target.base}
                </p>
                {target.identifier && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Identificador: {target.identifier}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Módulo: {getModuleLabel(log.module)}
                </p>
              </HoverCardContent>
            </HoverCard>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              em {timestamp}
            </span>
          </div>

          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {sentence}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge className={cn(style.pill, 'text-xs')}>
              {getActionLabel(log.action)}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-xs border',
                MODULE_COLORS[log.module]?.bg,
                MODULE_COLORS[log.module]?.text,
                MODULE_COLORS[log.module]?.border
              )}
            >
              {getModuleLabel(log.module)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getEntityLabel(log.entity)}
              {log.entityId
                ? ` • #${log.entityId.length > 8 ? `${log.entityId.slice(0, 8)}...` : log.entityId}`
                : ''}
            </Badge>
            {changesCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900"
              >
                {changesCount} alteração{changesCount > 1 ? 'es' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span>{formatAuditTimestamp(log.createdAt)}</span>
            {log.ip && <span className="truncate">IP {log.ip}</span>}
            {log.method && log.endpoint && (
              <span className="truncate">
                {log.method} {log.endpoint}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={event => {
              event.stopPropagation();
              handleSelect();
            }}
            className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900"
          >
            Ver detalhes
          </Button>
        </div>
      </div>
    </Card>
  );
};
