'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { translateError } from '@/lib/error-messages';
import { cn } from '@/lib/utils';
import {
  authLinksService,
  type AuthLinkDTO,
} from '@/services/auth/auth-links.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Apple,
  BadgeCheck,
  Check,
  CreditCard,
  Github,
  Globe,
  Link2,
  LinkIcon,
  Loader2,
  Mail,
  Monitor,
  MoreHorizontal,
  Plus,
  Power,
  PowerOff,
  Unlink,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// PROVIDER CONFIG (shared with profile connected-accounts-tab)
// =============================================================================

const PROVIDER_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; color: string }
> = {
  EMAIL: { label: 'Email', icon: Mail, color: 'blue' },
  CPF: { label: 'CPF', icon: CreditCard, color: 'emerald' },
  ENROLLMENT: { label: 'Matrícula', icon: BadgeCheck, color: 'violet' },
  GOOGLE: { label: 'Google', icon: Globe, color: 'sky' },
  MICROSOFT: { label: 'Microsoft', icon: Monitor, color: 'blue' },
  APPLE: { label: 'Apple', icon: Apple, color: 'slate' },
  GITHUB: { label: 'GitHub', icon: Github, color: 'slate' },
};

const ALL_PROVIDERS = [
  'EMAIL',
  'CPF',
  'ENROLLMENT',
  'GOOGLE',
  'MICROSOFT',
  'APPLE',
  'GITHUB',
] as const;

function getProviderConfig(provider: string) {
  return (
    PROVIDER_CONFIG[provider] ?? {
      label: provider,
      icon: Link2,
      color: 'slate',
    }
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface AuthLinksTabProps {
  userId: string;
  username: string;
}

export function AuthLinksTab({ userId, username }: AuthLinksTabProps) {
  const queryClient = useQueryClient();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<AuthLinkDTO | null>(null);

  // Fetch auth links for the user
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-auth-links', userId],
    queryFn: async () => {
      const response = await authLinksService.listForUser(userId);
      return response.authLinks;
    },
    enabled: !!userId,
  });

  // Toggle status mutation (admin — no last-method restriction)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      linkId,
      status,
    }: {
      linkId: string;
      status: 'ACTIVE' | 'INACTIVE';
    }) => {
      return authLinksService.adminToggle(userId, linkId, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-auth-links', userId] });
      toast.success(
        variables.status === 'ACTIVE'
          ? 'Método de login ativado'
          : 'Método de login desativado'
      );
    },
    onError: (err: Error) => {
      toast.error(translateError(err.message));
    },
  });

  // Unlink mutation (admin — can unlink last method)
  const unlinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return authLinksService.adminUnlink(userId, linkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-auth-links', userId] });
      toast.success('Método de login desvinculado com sucesso');
      setUnlinkTarget(null);
    },
    onError: (err: Error) => {
      toast.error(translateError(err.message));
    },
  });

  const handleToggleStatus = (link: AuthLinkDTO) => {
    const newStatus = link.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ linkId: link.id, status: newStatus });
  };

  const handleUnlinkConfirm = () => {
    if (unlinkTarget) {
      unlinkMutation.mutate(unlinkTarget.id);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <LinkIcon className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Métodos de Login</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie os métodos de login vinculados a{' '}
                <span className="font-medium">{username}</span>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLinkDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Vincular Método
          </Button>
        </div>

        {/* Auth Links List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg border border-border"
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
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Erro ao carregar métodos de login:{' '}
              {translateError(
                error instanceof Error ? error.message : 'Erro desconhecido'
              )}
            </p>
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map(link => (
              <AdminAuthLinkItem
                key={link.id}
                link={link}
                onToggleStatus={() => handleToggleStatus(link)}
                onUnlink={() => setUnlinkTarget(link)}
                isToggling={toggleStatusMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
            <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum método de login vinculado</p>
            <p className="text-sm mt-1">
              Clique em &quot;Vincular Método&quot; para adicionar
            </p>
          </div>
        )}
      </Card>

      {/* Admin Link Dialog (no password required) */}
      <AdminLinkDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        userId={userId}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['user-auth-links', userId],
          });
          setLinkDialogOpen(false);
        }}
      />

      {/* Unlink PIN Confirmation */}
      <VerifyActionPinModal
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onSuccess={handleUnlinkConfirm}
        title="Confirmar Desvinculação"
        description={`Digite seu PIN de ação para desvincular o método de login "${unlinkTarget ? getProviderConfig(unlinkTarget.provider).label : ''}" do usuário ${username}.`}
      />
    </div>
  );
}

// =============================================================================
// AUTH LINK ITEM (admin version)
// =============================================================================

interface AdminAuthLinkItemProps {
  link: AuthLinkDTO;
  onToggleStatus: () => void;
  onUnlink: () => void;
  isToggling: boolean;
}

function AdminAuthLinkItem({
  link,
  onToggleStatus,
  onUnlink,
  isToggling,
}: AdminAuthLinkItemProps) {
  const config = getProviderConfig(link.provider);
  const Icon = config.icon;
  const isActive = link.status === 'ACTIVE';

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg transition-colors',
        isActive
          ? 'bg-linear-to-r from-blue-50 to-white dark:from-violet-500/10 dark:to-transparent border border-gray-200 dark:border-white/10'
          : 'bg-linear-to-r from-gray-100 to-white dark:from-gray-500/10 dark:to-transparent border border-gray-200/50 dark:border-white/5'
      )}
    >
      {/* Provider Icon */}
      <div
        className={cn(
          'p-2.5 rounded-lg',
          isActive
            ? `bg-${config.color}-500/10 text-${config.color}-500`
            : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {config.label}
          </p>
          <Badge
            variant={isActive ? 'success' : 'secondary'}
            className="text-xs"
          >
            {isActive ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Ativo
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                Inativo
              </>
            )}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-white/50">
          <span className="font-mono">{link.identifier}</span>
          {link.lastUsedAt && (
            <span>
              Último uso{' '}
              {formatDistanceToNow(new Date(link.lastUsedAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          )}
          <span>
            Vinculado{' '}
            {formatDistanceToNow(new Date(link.linkedAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </div>

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onToggleStatus} disabled={isToggling}>
            {isActive ? (
              <>
                <PowerOff className="w-4 h-4 mr-2" />
                Desativar
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                Ativar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onUnlink}
            className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
          >
            <Unlink className="w-4 h-4 mr-2" />
            Desvincular
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// =============================================================================
// ADMIN LINK DIALOG (no password required)
// =============================================================================

interface AdminLinkDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

function AdminLinkDialog({
  open,
  onClose,
  userId,
  onSuccess,
}: AdminLinkDialogProps) {
  const [provider, setProvider] = useState('');
  const [identifier, setIdentifier] = useState('');

  const linkMutation = useMutation({
    mutationFn: async () => {
      return authLinksService.adminLink(userId, { provider, identifier });
    },
    onSuccess: () => {
      toast.success('Método de login vinculado com sucesso!');
      resetAndClose();
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(translateError(err.message));
    },
  });

  const resetAndClose = () => {
    setProvider('');
    setIdentifier('');
    onClose();
  };

  const getIdentifierLabel = () => {
    switch (provider) {
      case 'EMAIL':
        return 'Endereço de Email';
      case 'CPF':
        return 'Número do CPF';
      case 'ENROLLMENT':
        return 'Número da Matrícula';
      case 'GOOGLE':
        return 'Email do Google';
      case 'MICROSOFT':
        return 'Email da Microsoft';
      case 'APPLE':
        return 'Email da Apple';
      case 'GITHUB':
        return 'Nome de Usuário do GitHub';
      default:
        return 'Identificador';
    }
  };

  const getIdentifierPlaceholder = () => {
    switch (provider) {
      case 'EMAIL':
        return 'exemplo@email.com';
      case 'CPF':
        return '000.000.000-00';
      case 'ENROLLMENT':
        return 'MAT-00000';
      case 'GOOGLE':
        return 'usuario@gmail.com';
      case 'MICROSOFT':
        return 'usuario@outlook.com';
      case 'APPLE':
        return 'usuario@icloud.com';
      case 'GITHUB':
        return 'username';
      default:
        return '';
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        if (!val) resetAndClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular Método de Login</DialogTitle>
          <DialogDescription>
            Vincule um novo método de login para este usuário. Nenhuma senha é
            necessária para vinculação administrativa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Tipo de Método</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de login" />
              </SelectTrigger>
              <SelectContent>
                {ALL_PROVIDERS.map(p => {
                  const cfg = getProviderConfig(p);
                  const ProviderIcon = cfg.icon;
                  return (
                    <SelectItem key={p} value={p}>
                      <div className="flex items-center gap-2">
                        <ProviderIcon className="w-4 h-4" />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {provider && (
            <div className="space-y-2">
              <Label htmlFor="admin-link-identifier">
                {getIdentifierLabel()}
              </Label>
              <Input
                id="admin-link-identifier"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={getIdentifierPlaceholder()}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => linkMutation.mutate()}
            disabled={!provider || !identifier.trim() || linkMutation.isPending}
          >
            {linkMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LinkIcon className="w-4 h-4 mr-2" />
            )}
            Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
