/**
 * OpenSea OS - User Detail Page
 * Página de detalhes de um usuário específico (somente visualização)
 */

'use client';

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
import { ConfirmDialog } from '@/core/components/confirm-dialog';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { usersService } from '@/services/auth/users.service';
import * as rbacService from '@/services/rbac/rbac.service';
import type { User } from '@/types/auth';
import type { GroupWithExpiration, PermissionGroup } from '@/types/rbac';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Key,
  Lock,
  Plus,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
} from 'lucide-react';
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
      setConfirmDeleteOpen(false);
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/admin/users');
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
      <div className="min-h-screen px-6 py-6">
        <div className=" mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen px-6 py-6">
        <div className=" mx-auto">
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Usuário não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O usuário que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Usuários
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen from-blue-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 px-6 py-6">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para usuários
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <Card className="w-full p-4 sm:p-6">
          <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
            <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 shrink-0">
              <UserIcon className="md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex justify-between flex-1 gap-4 flex-row items-center">
              <div>
                <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                  {user.username}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <div className="flex gap-2">
                {user.lastLoginAt && (
                  <Badge variant="secondary">
                    Último acesso:{' '}
                    {new Date(user.lastLoginAt).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 p-2 h-12">
            <TabsTrigger value="info" className="gap-2">
              <UserIcon className="h-4 w-4 hidden sm:inline" />
              <span>Informações</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:inline" />
              <span>Grupos</span>
              <Badge variant="secondary" className="ml-1 hidden sm:inline">
                {userGroups.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4 hidden sm:inline" />
              <span>Segurança</span>
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6 flex flex-col">
            {/* Dados Pessoais */}
            <Card className="p-4 sm:p-6 w-full ">
              <h3 className="text-lg uppercase font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Username
                  </p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Email
                  </p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Nome
                  </p>
                  <p className="font-medium">{user.profile?.name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Sobrenome
                  </p>
                  <p className="font-medium">{user.profile?.surname || '-'}</p>
                </div>
              </div>
            </Card>

            {/* Gerenciamento de Senha */}
            <Card className="p-4 sm:p-6 w-full">
              <h3 className="text-lg uppercase font-semibold mb-4 flex items-center gap-2">
                <Key className="h-5 w-5" />
                Gerenciamento de Senha
              </h3>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Altere a senha do usuário diretamente ou force um reset de
                  senha para que o usuário defina uma nova senha no próximo
                  login.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setResetPasswordOpen(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setForcePasswordResetOpen(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Forçar Reset de Senha
                  </Button>
                </div>
              </div>
            </Card>

            {/* Metadados */}
            <Card className="p-4 sm:p-6 w-full">
              <h3 className="text-lg uppercase font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Criado em
                  </p>
                  <p className="font-medium">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString('pt-BR')
                      : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Atualizado em
                  </p>
                  <p className="font-medium">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString('pt-BR')
                      : '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    Último Login
                  </p>
                  <p className="font-medium">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('pt-BR')
                      : 'Nunca acessou'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <Card className="p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Grupos de Permissões
                </h3>
                <Button size="sm" onClick={() => setAddGroupModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Grupo
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
                    return (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: group.color || '#8B5CF6',
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
          <TabsContent
            value="security"
            className="space-y-6 flex flex-col"
          ></TabsContent>
        </Tabs>
      </div>

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
                        style={{ backgroundColor: group.color || '#8B5CF6' }}
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

      {/* Remove Group Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmRemoveGroupId}
        onOpenChange={open => !open && setConfirmRemoveGroupId(null)}
        title="Remover Grupo"
        description="Tem certeza que deseja remover este grupo do usuário? O usuário perderá todas as permissões associadas a este grupo."
        onConfirm={() => {
          if (confirmRemoveGroupId) {
            removeGroupMutation.mutate(confirmRemoveGroupId);
          }
        }}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={removeGroupMutation.isPending}
      />

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${user.username}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => deleteUserMutation.mutate()}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteUserMutation.isPending}
      />

      {/* Force Password Reset Modal */}
      <ForcePasswordResetModal
        isOpen={forcePasswordResetOpen}
        onClose={() => setForcePasswordResetOpen(false)}
        user={user}
      />
    </div>
  );
}
