'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useResolveNotification } from '../../hooks/use-notification-preferences';
import {
  NotificationKind,
  type NotificationActionDefinition,
  type NotificationFormField,
  type NotificationRecord,
} from '../../types';

interface NotificationItemProps {
  notification: NotificationRecord;
  onOpen?: () => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onOpen,
  compact,
}: NotificationItemProps) {
  const kind = notification.kind ?? NotificationKind.INFORMATIONAL;

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg border',
        notification.isRead
          ? 'bg-muted/20 border-transparent'
          : 'bg-background border-border'
      )}
    >
      <div className="shrink-0">
        <KindBadge kind={kind} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm font-medium truncate',
              notification.isRead && 'text-muted-foreground'
            )}
          >
            {notification.title}
          </h4>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        <KindRenderer
          kind={kind}
          notification={notification}
          onOpen={onOpen}
          compact={compact}
        />
      </div>
    </div>
  );
}

function KindBadge({ kind }: { kind: NotificationKind }) {
  const map: Record<NotificationKind, { icon: React.ReactNode; cls: string }> =
    {
      [NotificationKind.INFORMATIONAL]: {
        icon: <Bell className="h-4 w-4" />,
        cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      },
      [NotificationKind.LINK]: {
        icon: <ExternalLink className="h-4 w-4" />,
        cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      },
      [NotificationKind.ACTIONABLE]: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      },
      [NotificationKind.APPROVAL]: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      },
      [NotificationKind.FORM]: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      },
      [NotificationKind.PROGRESS]: {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      },
      [NotificationKind.SYSTEM_BANNER]: {
        icon: <AlertCircle className="h-4 w-4" />,
        cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      },
    };
  const { icon, cls } = map[kind] ?? map[NotificationKind.INFORMATIONAL];
  return (
    <div
      className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center',
        cls
      )}
    >
      {icon}
    </div>
  );
}

function KindRenderer({
  kind,
  notification,
  onOpen,
  compact,
}: {
  kind: NotificationKind;
  notification: NotificationRecord;
  onOpen?: () => void;
  compact?: boolean;
}) {
  switch (kind) {
    case NotificationKind.LINK:
      return notification.actionUrl ? (
        <Link
          href={notification.actionUrl}
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          onClick={onOpen}
        >
          <ExternalLink className="h-3 w-3" />
          Abrir
        </Link>
      ) : null;

    case NotificationKind.ACTIONABLE:
    case NotificationKind.APPROVAL:
      return (
        <ActionButtons
          notification={notification}
          requireReasonOnDestructive={
            kind === NotificationKind.APPROVAL ? true : false
          }
          disabled={notification.state !== 'PENDING'}
        />
      );

    case NotificationKind.FORM:
      return compact ? (
        <div className="text-xs text-muted-foreground italic">
          Abra para preencher o formulário
        </div>
      ) : (
        <FormRenderer notification={notification} />
      );

    case NotificationKind.PROGRESS:
      return (
        <ProgressBar
          progress={notification.progress ?? 0}
          total={notification.progressTotal ?? 100}
        />
      );

    default:
      return null;
  }
}

function ActionButtons({
  notification,
  requireReasonOnDestructive,
  disabled,
}: {
  notification: NotificationRecord;
  requireReasonOnDestructive: boolean;
  disabled: boolean;
}) {
  const { mutateAsync, isPending } = useResolveNotification();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const actions = (notification.actions ??
    []) as NotificationActionDefinition[];

  const handleResolve = async (action: NotificationActionDefinition) => {
    if (
      action.requiresReason ||
      (requireReasonOnDestructive && action.style === 'destructive')
    ) {
      if (activeAction !== action.key) {
        setActiveAction(action.key);
        return;
      }
      if (!reason.trim()) return;
    }
    await mutateAsync({
      notificationId: notification.id,
      actionKey: action.key,
      reason: reason || undefined,
    });
    setActiveAction(null);
    setReason('');
  };

  if (disabled) {
    return (
      <div className="text-xs text-muted-foreground italic flex items-center gap-1">
        <Check className="h-3 w-3" />
        Resolvido como{' '}
        <span className="font-medium">{notification.resolvedAction}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-2 flex-wrap">
        {actions.map(action => (
          <Button
            key={action.key}
            size="sm"
            variant={
              action.style === 'destructive'
                ? 'destructive'
                : action.style === 'ghost'
                  ? 'ghost'
                  : 'default'
            }
            onClick={() => handleResolve(action)}
            disabled={isPending}
            className="h-7 text-xs"
          >
            {action.label}
          </Button>
        ))}
      </div>
      {activeAction && (
        <div className="space-y-1">
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Justificativa..."
            className="w-full text-xs border rounded p-2 resize-none"
            rows={2}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setActiveAction(null);
              setReason('');
            }}
            className="h-6 text-xs"
          >
            <X className="h-3 w-3 mr-1" /> Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}

function FormRenderer({ notification }: { notification: NotificationRecord }) {
  const { mutateAsync, isPending } = useResolveNotification();
  const submit = (notification.actions ?? [])[0];
  const fields = (submit?.formSchema ?? []) as NotificationFormField[];
  const [values, setValues] = useState<Record<string, unknown>>({});
  const disabled = notification.state !== 'PENDING';

  if (disabled) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Formulário já enviado
      </div>
    );
  }

  return (
    <form
      className="space-y-2 pt-1"
      onSubmit={async e => {
        e.preventDefault();
        await mutateAsync({
          notificationId: notification.id,
          actionKey: submit?.key ?? 'submit',
          payload: values,
        });
      }}
    >
      {fields.map(field => (
        <div key={field.key} className="space-y-1">
          <label className="text-xs font-medium">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              required={field.required}
              className="w-full text-xs border rounded p-2"
              rows={2}
              onChange={e =>
                setValues(v => ({ ...v, [field.key]: e.target.value }))
              }
            />
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              required={field.required}
              className="w-full text-xs border rounded p-2"
              onChange={e =>
                setValues(v => ({
                  ...v,
                  [field.key]:
                    field.type === 'number'
                      ? Number(e.target.value)
                      : e.target.value,
                }))
              }
            />
          )}
        </div>
      ))}
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="h-7 text-xs"
      >
        {submit?.label ?? 'Enviar'}
      </Button>
    </form>
  );
}

function ProgressBar({ progress, total }: { progress: number; total: number }) {
  const pct =
    total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>
          {progress} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
