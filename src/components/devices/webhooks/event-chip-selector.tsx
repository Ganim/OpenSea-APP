'use client';

/**
 * WebhookEventChipSelector — Phase 11 D-16/D-17 multiselect dos 5 eventos
 * `punch.*` (UI-SPEC §Passo 2). Pattern visual derivado de pos-terminals/
 * page.tsx button-cards selecionáveis com ring on selected.
 */

import { cn } from '@/lib/utils';
import { WEBHOOK_EVENT_CATALOG, type WebhookEventType } from '@/types/system';
import { Check } from 'lucide-react';

export interface WebhookEventChipSelectorProps {
  value: WebhookEventType[];
  onChange: (next: WebhookEventType[]) => void;
  /** Se true, mostra erro inline (border rose). */
  error?: boolean;
  className?: string;
}

export function WebhookEventChipSelector({
  value,
  onChange,
  error,
  className,
}: WebhookEventChipSelectorProps) {
  function toggle(type: WebhookEventType) {
    if (value.includes(type)) {
      onChange(value.filter(t => t !== type));
    } else {
      onChange([...value, type]);
    }
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2 sm:grid-cols-2',
        error && 'rounded-lg ring-2 ring-rose-300 dark:ring-rose-500/40 p-2',
        className
      )}
      data-testid="webhook-event-chip-selector"
    >
      {WEBHOOK_EVENT_CATALOG.map(entry => {
        const selected = value.includes(entry.type);
        return (
          <button
            key={entry.type}
            type="button"
            onClick={() => toggle(entry.type)}
            data-event-type={entry.type}
            data-selected={selected ? 'true' : 'false'}
            aria-pressed={selected}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
              selected
                ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-400/40 dark:border-amber-500/40 dark:bg-amber-500/10'
                : 'border-border bg-white hover:border-primary/40 dark:bg-slate-800/40'
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                selected
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300'
              )}
              aria-hidden
            >
              {selected ? <Check className="h-5 w-5" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{entry.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {entry.type}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {entry.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
