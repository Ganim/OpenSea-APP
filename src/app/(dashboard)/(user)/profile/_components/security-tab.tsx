'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth-context';
import { useUpdatePassword } from '@/hooks/use-me';
import { useSetAccessPin, useSetActionPin } from '@/hooks/use-pins';
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
  KeyRound,
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function SecurityTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PasswordChangeSection />
      <AccessPinSection hasPin={user?.hasAccessPin} />
      <ActionPinSection hasPin={user?.hasActionPin} />
      <SessionsSection />
    </div>
  );
}

function PasswordChangeSection() {
  const updatePassword = useUpdatePassword();
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(translateError(message));
    }
  };

  const handleCancel = () => {
    setFormData({ newPassword: '', confirmPassword: '' });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Alterar
          </Button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Separator className="mt-3 mb-6" />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updatePassword.isPending}
              className="bg-linear-to-r from-red-500 to-orange-500 text-white"
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
      )}
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
  const [hideInactive, setHideInactive] = useState(true);

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

  // Filter inactive sessions
  const filteredSessions = hideInactive
    ? sortedSessions.filter(s => s.isActive)
    : sortedSessions;

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
      <div className="flex items-center justify-between ">
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={!hideInactive}
              onCheckedChange={checked => setHideInactive(!checked)}
            />
            <Label className="text-sm text-gray-500 dark:text-white/50 cursor-pointer">
              Mostrar inativas
            </Label>
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
      </div>
      <Separator className="my-3" />
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
          {filteredSessions.map(session => (
            <SessionItem
              key={session.id}
              session={session}
              onRevoke={() => handleRevokeSession(session.id)}
              isRevoking={revokeSession.isPending}
              isCurrentSession={session.id === currentSessionId}
            />
          ))}
          {filteredSessions.length === 0 && (
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
        'flex items-center gap-4 p-4 rounded-lg  transition-colors ',
        isActive
          ? 'border-white dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-linear-to-r from-blue-50 to-white dark:from-purple-500/10 dark:to-transparent'
          : 'border-gray-200/50 dark:border-white/5 bg-linear-to-r from-gray-100 to-white dark:from-gray-500/10 dark:to-transparent '
      )}
    >
      <div
        className={cn(
          'p-2.5 rounded-lg',
          isActive
            ? 'bg-blue-500/10 text-blue-500'
            : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
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
              className="text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white"
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

interface PinSectionProps {
  hasPin?: boolean;
}

function AccessPinSection({ hasPin }: PinSectionProps) {
  const setAccessPin = useSetAccessPin();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin !== pinConfirm) {
      setError('Os PINs não coincidem.');
      return;
    }

    try {
      await setAccessPin.mutateAsync({
        currentPassword,
        newAccessPin: pin,
      });
      toast.success('PIN de Acesso alterado com sucesso!');
      setIsEditing(false);
      setCurrentPassword('');
      setPin('');
      setPinConfirm('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(translateError(message));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPassword('');
    setPin('');
    setPinConfirm('');
    setError('');
  };

  return (
    <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <KeyRound className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              PIN de Acesso
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50">
              PIN de 6 dígitos para login rápido
            </p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-3">
            <Badge
              variant={hasPin ? 'success' : 'secondary'}
              className="text-xs "
            >
              {hasPin ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Configurado
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Não configurado
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              {hasPin ? 'Alterar' : 'Configurar'}
            </Button>
          </div>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Separator className="mt-3 mb-6" />
          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Novo PIN de Acesso (6 dígitos)</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={pin} onChange={setPin}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} masked />
                    <InputOTPSlot index={1} masked />
                    <InputOTPSlot index={2} masked />
                    <InputOTPSlot index={3} masked />
                    <InputOTPSlot index={4} masked />
                    <InputOTPSlot index={5} masked />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirmar PIN de Acesso</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={pinConfirm}
                  onChange={setPinConfirm}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} masked />
                    <InputOTPSlot index={1} masked />
                    <InputOTPSlot index={2} masked />
                    <InputOTPSlot index={3} masked />
                    <InputOTPSlot index={4} masked />
                    <InputOTPSlot index={5} masked />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessPinPassword">Senha Atual</Label>
            <Input
              id="accessPinPassword"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha para confirmar"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                setAccessPin.isPending ||
                !currentPassword ||
                pin.length !== 6 ||
                pinConfirm.length !== 6
              }
              className="bg-linear-to-r from-blue-500 to-cyan-500 text-white"
            >
              {setAccessPin.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              Salvar PIN de Acesso
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

function ActionPinSection({ hasPin }: PinSectionProps) {
  const setActionPin = useSetActionPin();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin !== pinConfirm) {
      setError('Os PINs não coincidem.');
      return;
    }

    try {
      await setActionPin.mutateAsync({
        currentPassword,
        newActionPin: pin,
      });
      toast.success('PIN de Ação alterado com sucesso!');
      setIsEditing(false);
      setCurrentPassword('');
      setPin('');
      setPinConfirm('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(translateError(message));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPassword('');
    setPin('');
    setPinConfirm('');
    setError('');
  };

  return (
    <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              PIN de Ação
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50">
              PIN de 4 dígitos para autorizar ações sensíveis
            </p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-3">
            <Badge
              variant={hasPin ? 'success' : 'secondary'}
              className="text-xs"
            >
              {hasPin ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Configurado
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Não configurado
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              {hasPin ? 'Alterar' : 'Configurar'}
            </Button>
          </div>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Separator className="mt-3 mb-6" />
          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Novo PIN de Ação (4 dígitos)</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={pin} onChange={setPin}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} masked />
                    <InputOTPSlot index={1} masked />
                    <InputOTPSlot index={2} masked />
                    <InputOTPSlot index={3} masked />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirmar PIN de Ação</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={pinConfirm}
                  onChange={setPinConfirm}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} masked />
                    <InputOTPSlot index={1} masked />
                    <InputOTPSlot index={2} masked />
                    <InputOTPSlot index={3} masked />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionPinPassword">Senha Atual</Label>
            <Input
              id="actionPinPassword"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha para confirmar"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                setActionPin.isPending ||
                !currentPassword ||
                pin.length !== 4 ||
                pinConfirm.length !== 4
              }
              className="bg-linear-to-r from-amber-500 to-orange-500 text-white"
            >
              {setActionPin.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Salvar PIN de Ação
            </Button>
          </div>
        </form>
      )}
    </Card>
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
