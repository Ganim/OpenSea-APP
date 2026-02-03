'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyAuditLogs } from '@/hooks/use-me';
import { translateError } from '@/lib/error-messages';
import { cn } from '@/lib/utils';
import type { AuditLog, AuditLogsQuery } from '@/types/auth';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Globe,
  Key,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';

const moduleOptions = [
  { value: 'all', label: 'Todos os módulos' },
  { value: 'CORE', label: 'Sistema' },
  { value: 'AUTH', label: 'Autenticação' },
  { value: 'HR', label: 'RH' },
  { value: 'STOCK', label: 'Estoque' },
  { value: 'SALES', label: 'Vendas' },
  { value: 'RBAC', label: 'Permissões' },
  { value: 'PAYROLL', label: 'Folha de Pagamento' },
  { value: 'REQUESTS', label: 'Solicitações' },
  { value: 'NOTIFICATIONS', label: 'Notificações' },
];

const actionOptions = [
  { value: 'all', label: 'Todas as ações' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'CREATE', label: 'Criação' },
  { value: 'UPDATE', label: 'Atualização' },
  { value: 'DELETE', label: 'Exclusão' },
  { value: 'PASSWORD_CHANGE', label: 'Alteração de senha' },
  { value: 'PROFILE_CHANGE', label: 'Alteração de perfil' },
  { value: 'SESSION_REVOKE', label: 'Sessão revogada' },
];

export function ActivityTab() {
  const [query, setQuery] = useState<AuditLogsQuery>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error, refetch } = useMyAuditLogs(query);

  const handleModuleChange = (value: string) => {
    setQuery({
      ...query,
      module: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handleActionChange = (value: string) => {
    setQuery({
      ...query,
      action: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setQuery({ ...query, page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="p-4 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Histórico de Atividades
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/50">
                Suas ações recentes no sistema
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Select
            value={query.module || 'all'}
            onValueChange={handleModuleChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              {moduleOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query.action || 'all'}
            onValueChange={handleActionChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Activity List */}
      <Card className="backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-4 p-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 flex items-center justify-center gap-3 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <p>Erro ao carregar atividades: {translateError(error.message)}</p>
          </div>
        ) : data?.logs && data.logs.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200 dark:divide-white/10">
              {data.logs.map(log => (
                <ActivityItem key={log.id} log={log} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-white/50">
                  Página {data.pagination.page} de {data.pagination.totalPages}{' '}
                  ({data.pagination.total} registros)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.pagination.page - 1)}
                    disabled={data.pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                    disabled={
                      data.pagination.page >= data.pagination.totalPages
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-white/20 mb-4" />
            <p className="text-gray-500 dark:text-white/50">
              Nenhuma atividade encontrada
            </p>
            <p className="text-sm text-gray-400 dark:text-white/30 mt-1">
              Suas ações no sistema aparecerão aqui
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

interface ActivityItemProps {
  log: AuditLog;
}

function ActivityItem({ log }: ActivityItemProps) {
  const actionInfo = getActionInfo(log.action);
  const timeAgo = formatDistanceToNow(new Date(log.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <div className={cn('p-2 rounded-lg flex-shrink-0', actionInfo.bgColor)}>
        <actionInfo.icon className={cn('w-5 h-5', actionInfo.textColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          {log.description || `${actionInfo.label} em ${log.entity}`}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <Badge variant="outline" className="text-xs">
            {log.module}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
          {log.ip && (
            <span className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {log.ip}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-400 dark:text-white/30">
          {format(new Date(log.createdAt), 'dd/MM/yyyy')}
        </p>
        <p className="text-xs text-gray-400 dark:text-white/30">
          {format(new Date(log.createdAt), 'HH:mm:ss')}
        </p>
      </div>
    </div>
  );
}

function getActionInfo(action: string) {
  const actionMap: Record<
    string,
    {
      icon: typeof Activity;
      label: string;
      bgColor: string;
      textColor: string;
    }
  > = {
    LOGIN: {
      icon: LogIn,
      label: 'Login',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    LOGOUT: {
      icon: LogOut,
      label: 'Logout',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
    },
    CREATE: {
      icon: Plus,
      label: 'Criação',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    UPDATE: {
      icon: Edit,
      label: 'Atualização',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
    },
    DELETE: {
      icon: Trash2,
      label: 'Exclusão',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
    },
    RESTORE: {
      icon: RefreshCw,
      label: 'Restauração',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
    },
    PASSWORD_CHANGE: {
      icon: Key,
      label: 'Alteração de senha',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
    },
    PROFILE_CHANGE: {
      icon: User,
      label: 'Atualização de perfil',
      bgColor: 'bg-indigo-500/10',
      textColor: 'text-indigo-500',
    },
    EMAIL_CHANGE: {
      icon: Edit,
      label: 'Alteração de email',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-500',
    },
    SESSION_REVOKE: {
      icon: LogOut,
      label: 'Sessão revogada',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
    },
    SESSION_EXPIRE: {
      icon: Clock,
      label: 'Sessão expirada',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
    },
  };

  return (
    actionMap[action] || {
      icon: Activity,
      label: action
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase()),
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
    }
  );
}
