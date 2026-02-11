'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { useUpdatePassword } from '@/hooks/use-me';
import { useMySessions, useRevokeSession } from '@/hooks/use-sessions';
import { translateError } from '@/lib/error-messages';
import { cn } from '@/lib/utils';
import type { Session } from '@/types/auth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
  Eye,
  EyeOff,
  Globe,
  Key,
  Laptop,
  Loader2,
  LogOut,
  Monitor,
  Shield,
  Smartphone,
  Star,
  Tablet,
  X,
} from 'lucide-react';
// Eye/EyeOff used for password visibility toggle
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function SecurityTab() {
  return (
    <div className="space-y-6">
      <PasswordChangeSection />
      <SessionsSection />
    </div>
  );
}

function PasswordChangeSection() {
  const updatePassword = useUpdatePassword();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'A senha deve ter pelo menos 8 caracteres';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updatePassword.mutateAsync({
        password: formData.newPassword,
      });
      toast.success('Senha alterada com sucesso!');
      setFormData({ newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(translateError(message));
    }
  };

  return (
    <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/10">
          <Key className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alterar Senha
          </h3>
          <p className="text-sm text-gray-500 dark:text-white/50">
            Atualize sua senha para manter sua conta segura
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova Senha</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={e =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className={cn(errors.newPassword && 'border-red-500')}
              placeholder="Digite sua nova senha"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-white/40">
            Mínimo de 8 caracteres, incluindo letras maiúsculas, minúsculas e
            números
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={e =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={cn(errors.confirmPassword && 'border-red-500')}
            placeholder="Confirme sua nova senha"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={updatePassword.isPending}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white"
          >
            {updatePassword.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Alterar Senha
          </Button>
        </div>
      </form>
    </Card>
  );
}

type SortOrder = 'newest' | 'oldest';

function SessionsSection() {
  const { data, isLoading, error } = useMySessions();
  const revokeSession = useRevokeSession();
  const { logout } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Get current session ID from localStorage
  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    setCurrentSessionId(sessionId);
  }, []);

  // Sort sessions by date
  const sortedSessions = data?.sessions
    ? [...data.sessions].sort((a, b) => {
        const dateA = new Date(a.lastUsedAt || a.createdAt).getTime();
        const dateB = new Date(b.lastUsedAt || b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      })
    : [];

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'));
  };

  const handleRevokeSession = async (sessionId: string) => {
    const isCurrentSession = sessionId === currentSessionId;

    try {
      await revokeSession.mutateAsync(sessionId);

      if (isCurrentSession) {
        toast.success('Sessão atual encerrada. Você será desconectado...');
        // Small delay so user can see the message
        setTimeout(() => {
          logout();
        }, 1000);
      } else {
        toast.success('Sessão encerrada com sucesso!');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(translateError(message));
    }
  };

  return (
    <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sessões Ativas
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50">
              Gerencie os dispositivos conectados à sua conta
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          className="gap-2"
          title={
            sortOrder === 'newest'
              ? 'Mais recentes primeiro'
              : 'Mais antigas primeiro'
          }
        >
          {sortOrder === 'newest' ? (
            <ArrowDownWideNarrow className="w-4 h-4" />
          ) : (
            <ArrowUpNarrowWide className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {sortOrder === 'newest' ? 'Recentes' : 'Antigas'}
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-white/10"
            >
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">
            Erro ao carregar sessões: {translateError(error.message)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSessions.map(session => (
            <SessionItem
              key={session.id}
              session={session}
              onRevoke={() => handleRevokeSession(session.id)}
              isRevoking={revokeSession.isPending}
              isCurrentSession={session.id === currentSessionId}
            />
          ))}
          {sortedSessions.length === 0 && (
            <p className="text-center text-gray-500 dark:text-white/50 py-4">
              Nenhuma sessão encontrada
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

interface SessionItemProps {
  session: Session;
  onRevoke: () => void;
  isRevoking: boolean;
  isCurrentSession: boolean;
}

function SessionItem({
  session,
  onRevoke,
  isRevoking,
  isCurrentSession,
}: SessionItemProps) {
  const isActive = session.isActive;
  const deviceIcon = getDeviceIcon(session.device?.deviceType);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border transition-colors',
        isActive
          ? 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
          : 'border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-white/2'
      )}
    >
      <div
        className={cn(
          'p-2.5 rounded-lg',
          isActive
            ? 'bg-blue-500/10 text-blue-500'
            : 'bg-gray-200 dark:bg-white/10 text-gray-400'
        )}
      >
        {deviceIcon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {session.device?.displayName || 'Dispositivo desconhecido'}
          </p>
          {isCurrentSession && (
            <Badge
              variant="default"
              className="text-xs bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Star className="w-3 h-3 mr-1" />
              Sessão Atual
            </Badge>
          )}
          {isActive && !isCurrentSession ? (
            <Badge variant="success" className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              Ativa
            </Badge>
          ) : !isActive ? (
            <Badge variant="secondary" className="text-xs">
              <X className="w-3 h-3 mr-1" />
              Inativa
            </Badge>
          ) : null}
          {session.isTrusted && (
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Confiável
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-white/50">
          {session.location?.displayName && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {session.location.displayName}
            </span>
          )}
          <span>IP: {session.ip}</span>
          <span>
            {session.lastUsedAt
              ? `Último acesso ${formatDistanceToNow(new Date(session.lastUsedAt), { addSuffix: true, locale: ptBR })}`
              : `Criada ${formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: ptBR })}`}
          </span>
        </div>
      </div>

      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRevoke}
          disabled={isRevoking}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          {isRevoking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
}

function getDeviceIcon(deviceType?: string) {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className="w-5 h-5" />;
    case 'tablet':
      return <Tablet className="w-5 h-5" />;
    case 'desktop':
      return <Monitor className="w-5 h-5" />;
    default:
      return <Laptop className="w-5 h-5" />;
  }
}
