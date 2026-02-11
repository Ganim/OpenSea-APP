/**
 * InfoField - Componente para exibir informações com label e conteúdo
 */

'use client';

import { CopyButton } from './copy-button';

interface InfoFieldProps {
  label: string;
  value: string | number | null | undefined;
  showCopyButton?: boolean;
  copyTooltip?: string;
  className?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  emptyText?: string;
  /** Custom action element displayed in place of copy button */
  action?: React.ReactNode;
  /** Truncate value text with single line */
  truncate?: boolean;
}

export function InfoField({
  label,
  value,
  showCopyButton = false,
  copyTooltip,
  className = '',
  icon,
  badge,
  emptyText = 'Não Informado',
  action,
  truncate = false,
}: InfoFieldProps) {
  const hasValue = value !== null && value !== undefined && value !== '';
  const displayValue = hasValue ? String(value) : emptyText;
  const isEmptyValue = !hasValue;

  return (
    <div
      className={`flex items-start justify-between dark:bg-slate-800 p-4  rounded-lg ${className}`}
    >
      <div className="flex-1 items-center text-xs sm:text-sm">
        <p className="font-bold uppercase text-muted-foreground flex items-center gap-2 mb-2">
          {icon}
          {label}
          {badge}
        </p>

        <p
          className={`mt-1 text-sm sm:text-base ${
            isEmptyValue ? 'dark:text-slate-500/80 text-slate-400' : ''
          } ${truncate ? 'truncate' : ''}`}
        >
          {displayValue}
        </p>
      </div>
      {action ? (
        <div className="flex h-full items-center">{action}</div>
      ) : showCopyButton && hasValue ? (
        <div className="flex h-full items-center ">
          <CopyButton
            content={String(value)}
            tooltipText={copyTooltip || `Copiar ${label}`}
            className="gap-2 self-auto px-4"
          />
        </div>
      ) : null}
    </div>
  );
}
