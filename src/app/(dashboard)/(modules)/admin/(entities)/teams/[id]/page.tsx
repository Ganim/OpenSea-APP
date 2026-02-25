/**
 * OpenSea OS - Team Detail Page
 * Página de detalhes de uma equipe com abas: Visão Geral, Membros e Configurações
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { CORE_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import { toast } from 'sonner';
import { teamsService } from '@/services/core/teams.service';
import type { Team, TeamMember, TeamMemberRole } from '@/types/core';
import { TEAM_MEMBER_ROLE_LABELS } from '@/types/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Crown,
  Edit,
  Info,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  Users,
  Users2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const teamId = params.id as string;
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission(CORE_PERMISSIONS.TEAMS.UPDATE);
  const canDelete = hasPermission(CORE_PERMISSIONS.TEAMS.DELETE);
  const canManageMembers = hasPermission(CORE_PERMISSIONS.TEAMS.MEMBERS.ADD);

  // State
  const [activeTab, setActiveTab] = useState('info');
  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [changRoleOpen, setChangeRoleOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');

  // Queries
  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => teamsService.getTeam(teamId),
  });

  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => teamsService.listTeamMembers(teamId, { limit: 100 }),
  });

  const team = teamData?.team;
  const members = membersData?.data ?? [];

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string; color?: string }) =>
      teamsService.updateTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipe atualizada com sucesso');
      setEditOpen(false);
    },
    onError: () => toast.error('Erro ao atualizar equipe'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => teamsService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipe excluída com sucesso');
      router.push('/admin/teams');
    },
    onError: () => toast.error('Erro ao excluir equipe'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => teamsService.removeTeamMember(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      toast.success('Membro removido com sucesso');
    },
    onError: () => toast.error('Erro ao remover membro'),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'ADMIN' | 'MEMBER' }) =>
      teamsService.changeTeamMemberRole(teamId, memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
      toast.success('Papel alterado com sucesso');
      setChangeRoleOpen(false);
      setSelectedMember(null);
    },
    onError: () => toast.error('Erro ao alterar papel'),
  });

  // Handlers
  const handleOpenEdit = () => {
    if (!team) return;
    setEditName(team.name);
    setEditDescription(team.description ?? '');
    setEditColor(team.color ?? '');
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({
      name: editName,
      description: editDescription || undefined,
      color: editColor || undefined,
    });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
    setDeleteConfirmOpen(false);
  };

  const handleChangeRole = (member: TeamMember) => {
    setSelectedMember(member);
    setNewRole(member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN');
    setChangeRoleOpen(true);
  };

  const getRoleBadge = (role: TeamMemberRole) => {
    switch (role) {
      case 'OWNER':
        return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600"><Crown className="w-3 h-3 mr-1" />{TEAM_MEMBER_ROLE_LABELS.OWNER}</Badge>;
      case 'ADMIN':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600"><ShieldCheck className="w-3 h-3 mr-1" />{TEAM_MEMBER_ROLE_LABELS.ADMIN}</Badge>;
      default:
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />{TEAM_MEMBER_ROLE_LABELS.MEMBER}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoadingTeam) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Administração', href: '/admin' },
              { label: 'Equipes', href: '/admin/teams' },
              { label: 'Carregando...' },
            ]}
            hasPermission={hasPermission}
          />
        </PageHeader>
        <PageBody>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </PageBody>
      </PageLayout>
    );
  }

  if (!team) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Administração', href: '/admin' },
              { label: 'Equipes', href: '/admin/teams' },
              { label: 'Não encontrada' },
            ]}
            hasPermission={hasPermission}
          />
        </PageHeader>
        <PageBody>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Equipe não encontrada.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/admin/teams')}
            >
              Voltar para Equipes
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Administração', href: '/admin' },
            { label: 'Equipes', href: '/admin/teams' },
            { label: team.name },
          ]}
          hasPermission={hasPermission}
          buttons={[
            ...(canEdit
              ? [
                  {
                    title: 'Editar',
                    icon: Edit,
                    onClick: handleOpenEdit,
                    variant: 'outline' as const,
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setDeleteConfirmOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
          ]}
        />

        {/* Team header card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white"
              style={{
                backgroundColor: team.color ?? '#3b82f6',
              }}
            >
              <Users2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <Badge variant={team.isActive ? 'default' : 'secondary'}>
                  {team.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {team.description || 'Sem descrição'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{team.membersCount}</p>
              <p className="text-sm text-muted-foreground">
                {team.membersCount === 1 ? 'membro' : 'membros'}
              </p>
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">
              <Info className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Membros ({team.membersCount})
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* INFO TAB */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Informações da Equipe</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Nome</Label>
                  <p className="font-medium">{team.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Slug</Label>
                  <p className="font-mono text-sm">{team.slug}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <p>
                    <Badge variant={team.isActive ? 'default' : 'secondary'}>
                      {team.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Cor</Label>
                  <div className="flex items-center gap-2">
                    {team.color ? (
                      <>
                        <div
                          className="w-5 h-5 rounded"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="font-mono text-sm">{team.color}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Nenhuma</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">Descrição</Label>
                  <p>{team.description || 'Sem descrição'}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Detalhes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Criado por</Label>
                  <p>{team.creatorName ?? team.createdBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Membros</Label>
                  <p>{team.membersCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Criado em</Label>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {formatDate(team.createdAt)}
                  </p>
                </div>
                {team.updatedAt && (
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Última atualização
                    </Label>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(team.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* MEMBERS TAB */}
          <TabsContent value="members" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Membros da Equipe</h3>
              {canManageMembers && (
                <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
              )}
            </div>

            {isLoadingMembers ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum membro encontrado.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {member.userAvatarUrl ? (
                            <img
                              src={member.userAvatarUrl}
                              alt={member.userName ?? ''}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.userName ?? 'Usuário'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.userEmail ?? member.userId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(member.role)}
                        {canManageMembers && member.role !== 'OWNER' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleChangeRole(member)}
                              title="Alterar papel"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMemberMutation.mutate(member.id)}
                              title="Remover membro"
                            >
                              <UserMinus className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Integrações</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Grupo de Permissões
                  </Label>
                  <p>
                    {team.permissionGroupId ? (
                      <Badge variant="outline">{team.permissionGroupId}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Nenhum vinculado</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Pasta Compartilhada
                  </Label>
                  <p>
                    {team.storageFolderId ? (
                      <Badge variant="outline">{team.storageFolderId}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Nenhuma vinculada</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {canDelete && (
              <Card className="p-6 border-destructive/30">
                <h3 className="font-semibold text-lg text-destructive mb-2">
                  Zona Perigosa
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ações irreversíveis. Tenha certeza antes de prosseguir.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Equipe
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </PageBody>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipe</DialogTitle>
            <DialogDescription>Altere as informações da equipe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome da equipe"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição da equipe"
                rows={3}
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={editColor || '#3b82f6'}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending || !editName.trim()}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CHANGE ROLE MODAL */}
      <Dialog open={changRoleOpen} onOpenChange={setChangeRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Papel do Membro</DialogTitle>
            <DialogDescription>
              Altere o papel de {selectedMember?.userName ?? 'membro'} na equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Novo papel</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as 'ADMIN' | 'MEMBER')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="MEMBER">Membro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedMember) {
                  changeRoleMutation.mutate({
                    memberId: selectedMember.id,
                    role: newRole,
                  });
                }
              }}
              disabled={changeRoleMutation.isPending}
            >
              {changeRoleMutation.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <VerifyActionPinModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onSuccess={handleDeleteConfirm}
        title="Excluir Equipe"
        description={`Tem certeza que deseja excluir a equipe "${team.name}"? Esta ação não pode ser desfeita.`}
      />
    </PageLayout>
  );
}
