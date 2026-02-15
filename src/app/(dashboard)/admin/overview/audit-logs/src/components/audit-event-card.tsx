'use client';

import { cn } from '@/lib/utils';
import { MODULE_COLORS, getEntityLabel, getModuleLabel } from '../constants';
import type { AuditLog } from '../types';
import {
  type NarrativeSegment,
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
      className="group flex items-center px-3 gap-3 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent hover:from-slate-300/80 dark:hover:from-slate-700/80 transition-colors cursor-pointer"
    >
      {/* Ícone — altura total, centralizado */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg w-10 h-10 shrink-0',
          style.bg
        )}
      >
        <Icon className={cn('w-4 h-4', style.text)} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 py-3 pr-4 space-y-1.5">
        {/* Narrativa */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] leading-relaxed flex items-center gap-1 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-1.5 py-px text-[12px] font-semibold',
                !narrative.actor.groupColor &&
                  'bg-violet-100/80 text-violet-700 dark:bg-violet-500/30 dark:text-violet-300'
              )}
              style={
                narrative.actor.groupColor
                  ? {
                      backgroundColor: `${narrative.actor.groupColor}20`,
                      color: narrative.actor.groupColor,
                    }
                  : undefined
              }
            >
              {narrative.actor.label}
            </span>
            {narrative.fromBackend && narrative.segments ? (
              narrative.segments.map((seg: NarrativeSegment, i: number) =>
                seg.type === 'chip' ? (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center rounded-md px-1.5 py-px text-[12px] font-semibold',
                      style.bg,
                      style.text
                    )}
                  >
                    {seg.value}
                  </span>
                ) : (
                  <span key={i} className="text-muted-foreground font-bold">
                    {seg.value}
                  </span>
                )
              )
            ) : narrative.fromBackend && narrative.restOfSentence ? (
              <span className="text-muted-foreground font-bold">
                {narrative.restOfSentence}
              </span>
            ) : (
              <>
                <span className="text-muted-foreground font-bold">
                  {narrative.target.article
                    ? `${narrative.verb} ${narrative.target.article}`
                    : narrative.verb}
                </span>
                {!narrative.target.selfContained &&
                  (narrative.target.entityName ? (
                    <>
                      <span className="text-muted-foreground ">
                        {narrative.target.base}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md px-1.5 py-px text-[12px] font-semibold',
                          style.bg,
                          style.text
                        )}
                      >
                        {narrative.target.entityName}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-foreground">
                      {narrative.target.label}
                    </span>
                  ))}
              </>
            )}
          </p>
          <span className="text-[11px] text-muted-foreground/60 shrink-0 tabular-nums mt-0.5">
            {formatRelativeTimestamp(log.createdAt)}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          <span className={cn('font-medium', moduleColors.text)}>
            {getModuleLabel(log.module)}
          </span>
          <span className="opacity-40">·</span>
          <span>{getEntityLabel(log.entity)}</span>
          {changesCount > 0 && (
            <>
              <span className="opacity-40">·</span>
              <span className="text-amber-600 dark:text-amber-400">
                {changesCount} alteraç{changesCount > 1 ? 'ões' : 'ão'}
              </span>
            </>
          )}
          <span className="ml-auto tabular-nums">
            {formatCompactTimestamp(log.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
