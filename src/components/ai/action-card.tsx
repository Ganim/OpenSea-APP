'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  Check,
  X,
  Loader2,
  ExternalLink,
  Zap,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type {
  ActionCardRenderData,
  ActionCardModule,
  ActionCardStatus,
  ActionCardField,
} from '@/types/ai';

// ── Color Maps ──────────────────────────────────────────────────────

const MODULE_COLORS: Record<
  ActionCardModule,
  {
    border: string;
    iconBg: string;
    iconBgDark: string;
    iconText: string;
    iconTextDark: string;
    badgeBg: string;
    badgeBgDark: string;
    badgeText: string;
    badgeTextDark: string;
    confirmBtn: string;
    confirmBtnHover: string;
  }
> = {
  stock: {
    border: 'border-l-violet-500',
    iconBg: 'bg-violet-100',
    iconBgDark: 'dark:bg-violet-500/15',
    iconText: 'text-violet-600',
    iconTextDark: 'dark:text-violet-400',
    badgeBg: 'bg-violet-50',
    badgeBgDark: 'dark:bg-violet-500/10',
    badgeText: 'text-violet-700',
    badgeTextDark: 'dark:text-violet-300',
    confirmBtn: 'bg-violet-600 hover:bg-violet-700',
    confirmBtnHover: 'hover:bg-violet-700',
  },
  finance: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100',
    iconBgDark: 'dark:bg-emerald-500/15',
    iconText: 'text-emerald-600',
    iconTextDark: 'dark:text-emerald-400',
    badgeBg: 'bg-emerald-50',
    badgeBgDark: 'dark:bg-emerald-500/10',
    badgeText: 'text-emerald-700',
    badgeTextDark: 'dark:text-emerald-300',
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700',
    confirmBtnHover: 'hover:bg-emerald-700',
  },
  hr: {
    border: 'border-l-sky-500',
    iconBg: 'bg-sky-100',
    iconBgDark: 'dark:bg-sky-500/15',
    iconText: 'text-sky-600',
    iconTextDark: 'dark:text-sky-400',
    badgeBg: 'bg-sky-50',
    badgeBgDark: 'dark:bg-sky-500/10',
    badgeText: 'text-sky-700',
    badgeTextDark: 'dark:text-sky-300',
    confirmBtn: 'bg-sky-600 hover:bg-sky-700',
    confirmBtnHover: 'hover:bg-sky-700',
  },
  sales: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-100',
    iconBgDark: 'dark:bg-amber-500/15',
    iconText: 'text-amber-600',
    iconTextDark: 'dark:text-amber-400',
    badgeBg: 'bg-amber-50',
    badgeBgDark: 'dark:bg-amber-500/10',
    badgeText: 'text-amber-700',
    badgeTextDark: 'dark:text-amber-300',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700',
    confirmBtnHover: 'hover:bg-amber-700',
  },
};

const MODULE_ICONS: Record<
  ActionCardModule,
  React.ComponentType<{ className?: string }>
> = {
  stock: Package,
  finance: DollarSign,
  hr: Users,
  sales: ShoppingCart,
};

// ── Status Badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ActionCardStatus }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <Clock className="h-3 w-3" />
          Aguardando confirmação
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300">
          <Loader2 className="h-3 w-3 animate-spin" />
          Executando...
        </span>
      );
    case 'EXECUTED':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <Check className="h-3 w-3" />
          Executada com sucesso
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-3 w-3" />
          Falhou
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400">
          <X className="h-3 w-3" />
          Cancelada
        </span>
      );
  }
}

// ── Field Value Formatter ───────────────────────────────────────────

function FieldValue({ field }: { field: ActionCardField }) {
  switch (field.type) {
    case 'currency':
      return (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          {field.value}
        </span>
      );
    case 'badge':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-foreground">
          {field.value}
        </span>
      );
    case 'number':
      return <span className="font-semibold tabular-nums">{field.value}</span>;
    case 'date':
      return <span className="text-muted-foreground">{field.value}</span>;
    default:
      return <span>{field.value}</span>;
  }
}

// ── Main Component ──────────────────────────────────────────────────

interface AiActionCardProps {
  data: ActionCardRenderData;
  onConfirm: (actionId: string) => void;
  onCancel: (actionId: string) => void;
}

export function AiActionCard({ data, onConfirm, onCancel }: AiActionCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const colors = MODULE_COLORS[data.module] ?? MODULE_COLORS.stock;
  const ModuleIcon = MODULE_ICONS[data.module] ?? Package;

  const isPending = data.status === 'PENDING';
  const isTerminal =
    data.status === 'EXECUTED' ||
    data.status === 'FAILED' ||
    data.status === 'CANCELLED';

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm(data.actionId);
  };

  const handleCancel = () => {
    setIsCancelling(true);
    onCancel(data.actionId);
  };

  return (
    <div
      className={cn(
        'w-full max-w-[560px] rounded-xl border-l-4 border border-border',
        'bg-white dark:bg-slate-800/60',
        'shadow-sm dark:shadow-none',
        'transition-all duration-300 ease-out',
        colors.border,
        isTerminal && 'opacity-90'
      )}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className={cn(
            'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
            colors.iconBg,
            colors.iconBgDark
          )}
        >
          <ModuleIcon
            className={cn('h-4.5 w-4.5', colors.iconText, colors.iconTextDark)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Zap
              className={cn(
                'h-3.5 w-3.5 flex-shrink-0',
                colors.iconText,
                colors.iconTextDark
              )}
            />
            <h4 className="text-sm font-semibold text-foreground truncate">
              {data.displayName}
            </h4>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                colors.badgeBg,
                colors.badgeBgDark,
                colors.badgeText,
                colors.badgeTextDark
              )}
            >
              {data.module}
            </span>
            <StatusBadge status={data.status} />
          </div>
        </div>
      </div>

      {/* ── Fields ────────────────────────────────────────────── */}
      {data.fields.length > 0 && (
        <div className="px-4 pb-3">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border/50 divide-y divide-border/50">
            {data.fields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 text-xs"
              >
                <span className="text-muted-foreground font-medium">
                  {field.label}
                </span>
                <span className="text-foreground text-right max-w-[60%] truncate">
                  <FieldValue field={field} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Result (after execution) ─────────────────────────── */}
      {data.result && (
        <div className="px-4 pb-3">
          <div
            className={cn(
              'rounded-lg px-3 py-2.5 text-xs',
              data.result.success
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
            )}
          >
            <div className="flex items-center gap-2">
              {data.result.success ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span className="font-medium">{data.result.message}</span>
            </div>
            {data.result.entityUrl && (
              <a
                href={data.result.entityUrl}
                className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Ver registro <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Footer (buttons) ─────────────────────────────────── */}
      {isPending && (
        <div className="flex items-center gap-2 px-4 pb-4 pt-1">
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isConfirming || isCancelling}
            className={cn(
              'h-9 px-4 rounded-lg text-white text-sm font-medium shadow-sm transition-colors',
              colors.confirmBtn
            )}
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Confirmar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isConfirming || isCancelling}
            className="h-9 px-4 rounded-lg text-sm font-medium"
          >
            {isCancelling ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancelar
              </>
            )}
          </Button>
        </div>
      )}

      {/* ── Terminal Status Footer ────────────────────────────── */}
      {data.status === 'CANCELLED' && !data.result && (
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            <span>Ação cancelada pelo usuário</span>
          </div>
        </div>
      )}
    </div>
  );
}
