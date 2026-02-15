/**
 * OpenSea OS - User Detail Page
 * Página de detalhes de um usuário específico (somente visualização)
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { ForcePasswordResetModal } from '@/components/modals/force-password-reset-modal';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { employeesService } from '@/services/hr/employees.service';
import { usersService } from '@/services/auth/users.service';
import * as rbacService from '@/services/rbac/rbac.service';
import type { User } from '@/types/auth';
import type { Employee } from '@/types/hr';
import type { GroupWithExpiration, PermissionGroup } from '@/types/rbac';
import {
  useForceAccessPinReset,
  useForceActionPinReset,
} from '@/hooks/use-pins';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Fingerprint,
  Key,
  KeyRound,
  Lock,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  User as UserIcon,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  // States
  const [activeTab, setActiveTab] = useState('info');
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [searchGroup, setSearchGroup] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [confirmRemoveGroupId, setConfirmRemoveGroupId] = useState<
    string | null
  >(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [forcePasswordResetOpen, setForcePasswordResetOpen] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await usersService.getUser(userId);
      return response.user;
    },
    enabled: !!userId,
  });

  // Funcionário vinculado
  const { data: linkedEmployee } = useQuery<Employee | null>({
    queryKey: ['user-employee', userId],
    queryFn: async () => {
      try {
        const response = await employeesService.getEmployeeByUserId(userId);
        return response.employee;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
  });

  // Busca grupos do usuário
  const {
    data: userGroups = [],
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useQuery<GroupWithExpiration[]>({
    queryKey: ['user-groups', userId],
    queryFn: async () => {
      return rbacService.listUserGroups(userId);
    },
    enabled: !!userId,
  });

  // Busca todos os grupos disponíveis
  const { data: allGroups = [] } = useQuery<PermissionGroup[]>({
    queryKey: ['permission-groups-list'],
    queryFn: async () => {
      return rbacService.listPermissionGroups({ isActive: true });
    },
    enabled: addGroupModalOpen,
  });

  // Grupos disponíveis (que o usuário ainda não tem)
  const availableGroups = useMemo(() => {
    const userGroupIds = new Set(
      userGroups.map(g => {
        if ('group' in g && g.group) {
          return g.group.id;
        }
        return (g as unknown as { id: string }).id;
      })
    );
    return allGroups
      .filter(g => !userGroupIds.has(g.id))
      .filter(g => {
        if (!searchGroup) return true;
        const search = searchGroup.toLowerCase();
        return (
          g.name.toLowerCase().includes(search) ||
          g.description?.toLowerCase().includes(search)
        );
      });
  }, [allGroups, userGroups, searchGroup]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      await usersService.updateUserPassword(userId, {
        newPassword: newPassword,
      });
    },
    onSuccess: () => {
      showSuccessToast('Senha alterada com sucesso');
      setResetPasswordOpen(false);
      setNewPassword('');
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao alterar senha',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });

  const assignGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await rbacService.assignGroupToUser(userId, { groupId });
    },
    onSuccess: async () => {
      await refetchGroups();
      showSuccessToast('Grupo atribuído com sucesso');
      setAddGroupModalOpen(false);
      setSelectedGroupId(null);
      setSearchGroup('');
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao atribuir grupo',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await rbacService.removeGroupFromUser(userId, groupId);
    },
    onSuccess: async () => {
      await refetchGroups();
      showSuccessToast('Grupo removido com sucesso');
      setConfirmRemoveGroupId(null);
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao remover grupo',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
      setConfirmRemoveGroupId(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await usersService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccessToast('Usuário excluído com sucesso');
      router.push('/admin/users');
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao excluir usuário',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });

  const forceAccessPinReset = useForceAccessPinReset();
  const forceActionPinReset = useForceActionPinReset();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleForceAccessPinReset = async () => {
    try {
      await forceAccessPinReset.mutateAsync(userId);
      showSuccessToast(`PIN de Acesso resetado para ${user?.email}`);
    } catch {
      showErrorToast({
        title: 'Erro ao resetar PIN de Acesso',
        description: 'Tente novamente mais tarde.',
      });
    }
  };

  const handleForceActionPinReset = async () => {
    try {
      await forceActionPinReset.mutateAsync(userId);
      showSuccessToast(`PIN de Ação resetado para ${user?.email}`);
    } catch {
      showErrorToast({
        title: 'Erro ao resetar PIN de Ação',
        description: 'Tente novamente mais tarde.',
      });
    }
  };

  const handleEdit = () => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleAddGroup = () => {
    if (selectedGroupId) {
      assignGroupMutation.mutate(selectedGroupId);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-24 w-full" />
        </PageHeader>
        <PageBody>
          <Skeleton className="h-96 w-full" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Usuário não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O usuário que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => router.push('/admin/users')}>
              Voltar para Usuários
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Administração', href: '/admin' },
            { label: 'Usuários', href: '/admin/users' },
            { label: user.username },
          ]}
          buttons={[
            {
              id: 'edit',
              title: 'Editar',
              icon: Edit,
              onClick: handleEdit,
            },
          ]}
        />

        {/* Title Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 shrink-0">
              <UserIcon className="h-7 w-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">
                {user.username}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user.email}
                {user.profile?.name &&
                  ` · ${user.profile.name}${user.profile.surname ? ` ${user.profile.surname}` : ''}`}
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>
                  Criado em{' '}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                    : '-'}
                </span>
              </div>
              {user.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>
                    Atualizado em{' '}
                    {new Date(user.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>
                  {user.lastLoginAt
                    ? `Último acesso em ${new Date(user.lastLoginAt).toLocaleDateString('pt-BR')} às ${new Date(user.lastLoginAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Nunca acessou'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 mb-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Grupos ({userGroups.length})
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="flex flex-col space-y-4">
            <Card className="bg-white/5 p-6 w-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{user.profile?.name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Sobrenome</p>
                  <p className="font-medium">{user.profile?.surname || '-'}</p>
                </div>
              </div>
            </Card>

            {/* Funcionário Vinculado */}
            <Card className="bg-white/5 p-6 w-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Funcionário Vinculado
              </h3>
              {linkedEmployee ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 bg-linear-to-br from-emerald-500 to-teal-600">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{linkedEmployee.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {linkedEmployee.registrationNumber} ·{' '}
                        {linkedEmployee.cpf}
                      </p>
                    </div>
                  </div>
                  <Link href={`/hr/employees/${linkedEmployee.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                  Nenhum funcionário vinculado
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="flex flex-col space-y-4">
            <Card className="bg-white/5 p-6 w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    Grupos de Permissões
                  </h3>
                  <Badge variant="secondary">
                    {userGroups.length} grupo
                    {userGroups.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Button size="sm" onClick={() => setAddGroupModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {groupsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : userGroups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum grupo atribuído</p>
                  <p className="text-sm mt-1">
                    Este usuário ainda não pertence a nenhum grupo de
                    permissões.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userGroups.map(userGroup => {
                    const group =
                      'group' in userGroup && userGroup.group
                        ? userGroup.group
                        : (userGroup as unknown as PermissionGroup);
                    const groupColor = group.color || '#8B5CF6';
                    return (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: `linear-gradient(to bottom right, ${groupColor}, ${groupColor}CC)`,
                            }}
                          >
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{group.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {group.description || group.slug}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {group.isSystem && (
                            <Badge variant="secondary">Sistema</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmRemoveGroupId(group.id)}
                            disabled={removeGroupMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="flex flex-col space-y-4">
            {/* Senha */}
            <Card className="bg-white/5 p-6 w-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="h-5 w-5" />
                Gerenciamento de Senha
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alterar Senha */}
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-amber-500" />
                    <h4 className="font-medium">Alterar Senha</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Defina uma nova senha diretamente para este usuário. A senha
                    atual será substituída imediatamente.
                  </p>
                  <Button
                    className="bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 hover:from-amber-600 hover:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500 text-white shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => setResetPasswordOpen(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
                </div>

                {/* Forçar Reset */}
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-500" />
                    <h4 className="font-medium">Resetar Senha</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Force o usuário a definir uma nova senha no próximo login. A
                    senha atual será invalidada.
                  </p>
                  <Button
                    className="bg-linear-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 hover:from-red-600 hover:to-rose-700 dark:hover:from-red-500 dark:hover:to-rose-600 text-white shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => setForcePasswordResetOpen(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Forçar Reset de Senha
                  </Button>
                </div>
              </div>
            </Card>

            {/* PINs */}
            <Card className="bg-white/5 p-6 w-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Gerenciamento de PINs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PIN de Acesso */}
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">PIN de Acesso</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Utilizado para login rápido. Ao resetar, o usuário precisará
                    configurar um novo PIN na próxima vez.
                  </p>
                  <Button
                    className="bg-linear-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-shadow"
                    onClick={handleForceAccessPinReset}
                    disabled={forceAccessPinReset.isPending}
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    {forceAccessPinReset.isPending
                      ? 'Resetando...'
                      : 'Resetar PIN de Acesso'}
                  </Button>
                </div>

                {/* PIN de Ação */}
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-orange-500" />
                    <h4 className="font-medium">PIN de Ação</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Utilizado para confirmar ações sensíveis. Ao resetar, o
                    usuário precisará configurar um novo PIN.
                  </p>
                  <Button
                    className="bg-linear-to-r from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 hover:from-orange-600 hover:to-amber-700 dark:hover:from-orange-500 dark:hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-shadow"
                    onClick={handleForceActionPinReset}
                    disabled={forceActionPinReset.isPending}
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    {forceActionPinReset.isPending
                      ? 'Resetando...'
                      : 'Resetar PIN de Ação'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Group Modal */}
        <Dialog open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Adicionar Grupo de Permissões</DialogTitle>
              <DialogDescription>
                Selecione um grupo de permissões para atribuir a este usuário.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar grupo por nome ou descrição..."
                  value={searchGroup}
                  onChange={e => setSearchGroup(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex-1 overflow-y-auto border rounded-lg">
                {availableGroups.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>
                      {searchGroup
                        ? 'Nenhum grupo encontrado'
                        : 'Todos os grupos já estão atribuídos'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {availableGroups.map(group => (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedGroupId === group.id
                            ? 'bg-primary/10 border-l-4 border-primary'
                            : ''
                        }`}
                      >
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: `linear-gradient(to bottom right, ${group.color || '#8B5CF6'}, ${group.color || '#8B5CF6'}CC)`,
                          }}
                        >
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{group.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {group.description || group.slug}
                          </p>
                        </div>
                        {selectedGroupId === group.id && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <svg
                              className="h-3 w-3 text-primary-foreground"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddGroupModalOpen(false);
                  setSelectedGroupId(null);
                  setSearchGroup('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddGroup}
                disabled={!selectedGroupId || assignGroupMutation.isPending}
              >
                {assignGroupMutation.isPending ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Modal */}
        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Digite a nova senha para o usuário {user.username}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordOpen(false);
                  setNewPassword('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => resetPasswordMutation.mutate()}
                disabled={
                  newPassword.length < 8 || resetPasswordMutation.isPending
                }
              >
                {resetPasswordMutation.isPending ? 'Alterando...' : 'Alterar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Group PIN Verification */}
        <VerifyActionPinModal
          isOpen={!!confirmRemoveGroupId}
          onClose={() => setConfirmRemoveGroupId(null)}
          onSuccess={() => {
            if (confirmRemoveGroupId) {
              removeGroupMutation.mutate(confirmRemoveGroupId);
            }
          }}
          title="Remover Grupo"
          description="O usuário perderá todas as permissões associadas a este grupo. Digite seu PIN de ação para confirmar."
        />

        {/* Force Password Reset Modal */}
        <ForcePasswordResetModal
          isOpen={forcePasswordResetOpen}
          onClose={() => setForcePasswordResetOpen(false)}
          user={user}
        />
      </PageBody>
    </PageLayout>
  );
}
