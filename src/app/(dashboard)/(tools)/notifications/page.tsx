'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useNotificationsList,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useForceNotificationCheck,
} from '@/hooks/notifications';
import type {
  BackendNotification,
  NotificationType,
  NotificationPriority,
} from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  Inbox,
  Loader2,
  Mail,
  Package,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { PiSparkleDuotone } from 'react-icons/pi';

// ── Visual mapping (same as panel) ────────────────────────────────

interface NotificationVisual {
  icon: React.ElementType;
  gradient: string;
  bgMuted: string;
}

function resolveVisual(n: BackendNotification): NotificationVisual {
  switch (n.entityType) {
    case 'email_message':
      return {
        icon: Mail,
        gradient: 'from-blue-500 to-blue-600',
        bgMuted: 'bg-blue-100 dark:bg-blue-500/10',
      };
    case 'email_account':
      return {
        icon: Inbox,
        gradient: 'from-blue-400 to-blue-500',
        bgMuted: 'bg-blue-100 dark:bg-blue-500/10',
      };
    case 'CALENDAR_EVENT':
      return {
        icon: Calendar,
        gradient: 'from-emerald-500 to-emerald-600',
        bgMuted: 'bg-emerald-100 dark:bg-emerald-500/10',
      };
    case 'calendar_invite':
      return {
        icon: Calendar,
        gradient: 'from-purple-500 to-purple-600',
        bgMuted: 'bg-purple-100 dark:bg-purple-500/10',
      };
    case 'finance_entry':
      return {
        icon: DollarSign,
        gradient: 'from-yellow-500 to-yellow-600',
        bgMuted: 'bg-yellow-100 dark:bg-yellow-500/10',
      };
    case 'sales_order':
      return {
        icon: ShoppingCart,
        gradient: 'from-green-500 to-green-600',
        bgMuted: 'bg-green-100 dark:bg-green-500/10',
      };
    case 'stock_item':
      return {
        icon: Package,
        gradient: 'from-orange-500 to-orange-600',
        bgMuted: 'bg-orange-100 dark:bg-orange-500/10',
      };
    case 'hr_employee':
      return {
        icon: Users,
        gradient: 'from-pink-500 to-pink-600',
        bgMuted: 'bg-pink-100 dark:bg-pink-500/10',
      };
    default:
      break;
  }
  switch (n.type) {
    case 'WARNING':
      return {
        icon: AlertTriangle,
        gradient: 'from-orange-500 to-orange-600',
        bgMuted: 'bg-orange-100 dark:bg-orange-500/10',
      };
    case 'ERROR':
      return {
        icon: AlertTriangle,
        gradient: 'from-red-500 to-red-600',
        bgMuted: 'bg-red-100 dark:bg-red-500/10',
      };
    case 'SUCCESS':
      return {
        icon: Check,
        gradient: 'from-green-500 to-green-600',
        bgMuted: 'bg-green-100 dark:bg-green-500/10',
      };
    case 'REMINDER':
      return {
        icon: Calendar,
        gradient: 'from-purple-500 to-purple-600',
        bgMuted: 'bg-purple-100 dark:bg-purple-500/10',
      };
    default:
      return {
        icon: Bell,
        gradient: 'from-slate-500 to-slate-600',
        bgMuted: 'bg-slate-100 dark:bg-slate-500/10',
      };
  }
}

function formatTimeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60_000) return 'Agora';
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: ptBR,
    }).replace('cerca de ', '');
  } catch {
    return '';
  }
}

const priorityLabels: Record<NotificationPriority, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const typeLabels: Record<NotificationType, string> = {
  INFO: 'Informação',
  WARNING: 'Aviso',
  ERROR: 'Erro',
  SUCCESS: 'Sucesso',
  REMINDER: 'Lembrete',
};

const priorityColors: Record<NotificationPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
  NORMAL: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  HIGH: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  URGENT: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
};

// ── Page component ────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filters = useMemo(() => {
    const f: Record<string, unknown> = { page, limit: PAGE_SIZE };
    if (readFilter === 'unread') f.isRead = false;
    if (readFilter === 'read') f.isRead = true;
    if (typeFilter !== 'all') f.type = typeFilter;
    if (priorityFilter !== 'all') f.priority = priorityFilter;
    return f;
  }, [page, readFilter, typeFilter, priorityFilter]);

  const { data, isLoading } = useNotificationsList(filters);
  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotif = useDeleteNotification();
  const forceCheck = useForceNotificationCheck();

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  function handleClick(n: BackendNotification) {
    if (!n.isRead) markAsRead.mutate(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
  }

  const hasActiveFilters =
    readFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all';

  function clearFilters() {
    setReadFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setPage(1);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {/* ── Action Bar ────────────────────────────────────── */}
        <PageActionBar
          breadcrumbItems={[{ label: 'Notificações', href: '/notifications' }]}
          buttons={[
            {
              id: 'sync-notifications',
              title: 'Sincronizar',
              icon: RefreshCw,
              variant: 'ghost',
              onClick: () => forceCheck.mutate(),
              disabled: forceCheck.isPending,
            },
            {
              id: 'mark-all-read',
              title: 'Marcar todas como lidas',
              icon: CheckCheck,
              variant: unreadCount > 0 ? 'default' : 'outline',
              onClick: () => markAllAsRead.mutate(),
              disabled: markAllAsRead.isPending || unreadCount === 0,
            },
          ]}
        />

        {/* ── Hero Banner + Filters ────────────────────────── */}
        <Card className="relative overflow-hidden px-5 py-4 bg-white shadow-sm dark:shadow-none dark:bg-white/5 border-gray-200 dark:border-white/10 shrink-0">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/15 dark:bg-rose-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/15 dark:bg-purple-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            {/* Title row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-rose-500 to-purple-600">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Notificações
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-white/60">
                    Acompanhe alertas, avisos e atualizações do sistema
                  </p>
                </div>
              </div>
            </div>

            {/* Filters row */}
            <div className="bg-muted/30 dark:bg-white/5 rounded-lg px-3 py-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  Filtros
                </div>

                <Select
                  value={readFilter}
                  onValueChange={v => {
                    setReadFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">Não lidas</SelectItem>
                    <SelectItem value="read">Lidas</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={typeFilter}
                  onValueChange={v => {
                    setTypeFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={v => {
                    setPriorityFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs gap-1 h-8"
                  >
                    <X className="w-3 h-3" />
                    Limpar filtros
                  </Button>
                )}

                <div className="ml-auto text-xs text-muted-foreground">
                  {total} {total !== 1 ? 'notificações' : 'notificação'} ·{' '}
                  {unreadCount} não {unreadCount !== 1 ? 'lidas' : 'lida'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Notification list ────────────────────────────── */}
        <Card className="divide-y divide-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-base font-medium mb-1">Nenhuma notificação</p>
              <p className="text-sm text-muted-foreground text-center">
                {hasActiveFilters
                  ? 'Nenhuma notificação encontrada com os filtros selecionados.'
                  : 'Você está em dia! Não há notificações no momento.'}
              </p>
            </div>
          ) : (
            notifications.map(n => {
              const { icon: Icon, gradient, bgMuted } = resolveVisual(n);
              const isUnread = !n.isRead;

              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    isUnread ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isUnread ? `bg-linear-to-br ${gradient}` : bgMuted
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isUnread ? 'text-white' : 'text-muted-foreground'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm truncate ${
                          isUnread
                            ? 'font-semibold'
                            : 'font-medium text-muted-foreground'
                        }`}
                      >
                        {n.title}
                      </h4>
                      {isUnread && (
                        <PiSparkleDuotone className="size-3.5 shrink-0 text-rose-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {n.message}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${priorityColors[n.priority]}`}
                    >
                      {priorityLabels[n.priority]}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap w-[5.5rem] text-right">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    {isUnread && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead.mutate(n.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Marcar como lida</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotif.mutate(n.id)}
                          className="h-8 w-8 p-0 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir notificação</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })
          )}
        </Card>

        {/* ── Pagination ───────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
