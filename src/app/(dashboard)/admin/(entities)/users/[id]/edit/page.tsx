/**
 * OpenSea OS - Edit User Page
 * Página de edição de usuário com tabs: Dados, Funcionário, Grupos
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { employeesService } from '@/services/hr/employees.service';
import * as rbacService from '@/services/rbac/rbac.service';
import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';
import type { Employee } from '@/types/hr';
import type { GroupWithExpiration, PermissionGroup } from '@/types/rbac';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  Unlink,
  User as UserIcon,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  // States
  const [editForm, setEditForm] = useState({
    email: '',
    username: '',
    name: '',
    surname: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [searchGroup, setSearchGroup] = useState('');
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await usersService.getUser(userId);
      return response.user;
    },
    enabled: !!userId,
  });

  // Funcionário vinculado
  const {
    data: linkedEmployee,
    isLoading: employeeLoading,
    refetch: refetchEmployee,
  } = useQuery<Employee | null>({
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

  // Funcionários disponíveis (sem vínculo)
  const { data: unlinkedEmployees = [], isLoading: unlinkedLoading } = useQuery<
    Employee[]
  >({
    queryKey: ['unlinked-employees', searchEmployee],
    queryFn: async () => {
      const response = await employeesService.listEmployees({
        unlinked: true,
        search: searchEmployee || undefined,
        perPage: 20,
      });
      return response.employees;
    },
    enabled: !linkedEmployee && !!userId,
  });

  // Grupos do usuário
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

  // Todos os grupos ativos
  const { data: allGroups = [] } = useQuery<PermissionGroup[]>({
    queryKey: ['permission-groups-list'],
    queryFn: async () => {
      return rbacService.listPermissionGroups({ isActive: true });
    },
    enabled: !!userId,
  });

  // Grupos disponíveis (que o usuário ainda não tem)
  const availableGroups = useMemo(() => {
    const userGroupIds = new Set(
      userGroups.map(g => {
        if ('group' in g && g.group) return g.group.id;
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
  // INITIALIZE FORM
  // ============================================================================

  useEffect(() => {
    if (user) {
      setEditForm({
        email: user.email || '',
        username: user.username || '',
        name: user.profile?.name || '',
        surname: user.profile?.surname || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const changed =
        editForm.email !== (user.email || '') ||
        editForm.username !== (user.username || '') ||
        editForm.name !== (user.profile?.name || '') ||
        editForm.surname !== (user.profile?.surname || '');
      setHasChanges(changed);
    }
  }, [editForm, user]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (user && editForm.email !== user.email) {
        await usersService.updateUserEmail(userId, { email: editForm.email });
      }
      if (user && editForm.username !== user.username) {
        await usersService.updateUserUsername(userId, {
          username: editForm.username,
        });
      }
      if (
        user &&
        (editForm.name !== user.profile?.name ||
          editForm.surname !== user.profile?.surname)
      ) {
        await usersService.updateUserProfile(userId, {
          name: editForm.name,
          surname: editForm.surname,
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await refetchUser();
      showSuccessToast('Usuário atualizado com sucesso');
      router.push(`/admin/users/${userId}`);
    },
    onError: error => {
      showErrorToast({
        title: 'Erro ao atualizar usuário',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      });
    },
  });

  const linkEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      await employeesService.linkUserToEmployee(employeeId, userId);
    },
    onSuccess: async () => {
      await refetchEmployee();
      queryClient.invalidateQueries({ queryKey: ['unlinked-employees'] });
      queryClient.invalidateQueries({ queryKey: ['user-employee-links'] });
      toast.success('Funcionário vinculado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao vincular funcionário');
    },
  });

  const unlinkEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      await employeesService.unlinkUserFromEmployee(employeeId);
    },
    onSuccess: async () => {
      await refetchEmployee();
      queryClient.invalidateQueries({ queryKey: ['unlinked-employees'] });
      queryClient.invalidateQueries({ queryKey: ['user-employee-links'] });
      toast.success('Funcionário desvinculado com sucesso');
      setConfirmUnlink(false);
    },
    onError: () => {
      toast.error('Erro ao desvincular funcionário');
      setConfirmUnlink(false);
    },
  });

  const assignGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await rbacService.assignGroupToUser(userId, { groupId });
    },
    onSuccess: async () => {
      await refetchGroups();
      toast.success('Grupo atribuído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atribuir grupo');
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await rbacService.removeGroupFromUser(userId, groupId);
    },
    onSuccess: async () => {
      await refetchGroups();
      toast.success('Grupo removido com sucesso');
    },
    onError: () => {
      toast.error('Erro ao remover grupo');
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = () => {
    updateUserMutation.mutate();
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
            { label: user.username, href: `/admin/users/${userId}` },
            { label: 'Editar' },
          ]}
          buttons={[
            {
              id: 'save',
              title: updateUserMutation.isPending ? 'Salvando...' : 'Salvar',
              icon: Save,
              onClick: handleSave,
              disabled: updateUserMutation.isPending || !hasChanges,
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Editar Usuário
                </h1>
                {hasChanges && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                  >
                    Alterações não salvas
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user.username} · {user.email}
              </p>
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 mb-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Funcionário
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Grupos ({userGroups.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dados Pessoais */}
          <TabsContent value="info" className="space-y-4">
            <Card className="bg-white/5 p-6 w-full">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-xs text-muted-foreground"
                  >
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={e =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    placeholder="Digite o username"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs text-muted-foreground"
                  >
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={e =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="Digite o email"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs text-muted-foreground"
                  >
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={e =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Digite o nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="surname"
                    className="text-xs text-muted-foreground"
                  >
                    Sobrenome
                  </Label>
                  <Input
                    id="surname"
                    value={editForm.surname}
                    onChange={e =>
                      setEditForm({ ...editForm, surname: e.target.value })
                    }
                    placeholder="Digite o sobrenome"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Funcionário */}
          <TabsContent value="employee" className="space-y-4">
            <Card className="bg-white/5 p-6 w-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Funcionário Vinculado
              </h3>

              {employeeLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : linkedEmployee ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 bg-linear-to-br from-emerald-500 to-teal-600">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {linkedEmployee.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {linkedEmployee.registrationNumber} ·{' '}
                          {linkedEmployee.cpf}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/hr/employees/${linkedEmployee.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmUnlink(true)}
                        disabled={unlinkEmployeeMutation.isPending}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Este usuário não possui funcionário vinculado. Busque e
                    vincule um funcionário abaixo.
                  </p>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, matrícula ou CPF..."
                      value={searchEmployee}
                      onChange={e => setSearchEmployee(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {unlinkedLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : unlinkedEmployees.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {unlinkedEmployees.map(emp => (
                        <div
                          key={emp.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {emp.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {emp.registrationNumber} · {emp.cpf}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => linkEmployeeMutation.mutate(emp.id)}
                            disabled={linkEmployeeMutation.isPending}
                          >
                            {linkEmployeeMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Vincular'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                      Nenhum funcionário sem vínculo encontrado
                    </p>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tab: Grupos */}
          <TabsContent value="groups" className="space-y-4">
            <Card className="bg-white/5 p-6 w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Grupos de Permissões
                  </h3>
                  <Badge variant="secondary">
                    {userGroups.length} grupo
                    {userGroups.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Button size="sm" onClick={() => setAddGroupOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {groupsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : userGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                  <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Nenhum grupo atribuído</p>
                  <p className="text-sm mt-1">
                    Clique em "Adicionar" para atribuir grupos de permissões.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userGroups.map(userGroup => {
                    const group =
                      'group' in userGroup && userGroup.group
                        ? userGroup.group
                        : (userGroup as unknown as PermissionGroup);
                    const groupColor = group.color || '#8B5CF6';
                    return (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: `linear-gradient(to bottom right, ${groupColor}, ${groupColor}CC)`,
                            }}
                          >
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{group.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {group.description || group.slug}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeGroupMutation.mutate(group.id)}
                          disabled={removeGroupMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Group Modal */}
        <Dialog
          open={addGroupOpen}
          onOpenChange={open => {
            setAddGroupOpen(open);
            if (!open) setSearchGroup('');
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Adicionar Grupo de Permissões
              </DialogTitle>
              <DialogDescription>
                Selecione um grupo para atribuir a este usuário.
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

              <div className="flex-1 overflow-y-auto space-y-2">
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
                  availableGroups.map(group => {
                    const groupColor = group.color || '#8B5CF6';
                    return (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-100 dark:from-slate-800 to-transparent"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: `linear-gradient(to bottom right, ${groupColor}, ${groupColor}CC)`,
                            }}
                          >
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{group.name}</p>
                            {group.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {group.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => assignGroupMutation.mutate(group.id)}
                          disabled={assignGroupMutation.isPending}
                        >
                          Atribuir
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddGroupOpen(false);
                  setSearchGroup('');
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Unlink Employee PIN Verification */}
        <VerifyActionPinModal
          isOpen={confirmUnlink}
          onClose={() => setConfirmUnlink(false)}
          onSuccess={() => {
            if (linkedEmployee) {
              unlinkEmployeeMutation.mutate(linkedEmployee.id);
            }
          }}
          title="Desvincular Funcionário"
          description={`${linkedEmployee?.fullName} será desvinculado deste usuário. Digite seu PIN de ação para confirmar.`}
        />
      </PageBody>
    </PageLayout>
  );
}
