/**
 * OpenSea OS - Team Detail Page
 * Página de detalhes de uma equipe: informações, membros e ações
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
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { UserAvatar } from '@/components/shared/user-avatar';
import { CORE_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { teamsService } from '@/services/core/teams.service';
import type { Team, TeamMember, TeamMemberRole } from '@/types/core';
import { TEAM_MEMBER_ROLE_LABELS } from '@/types/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Copy,
  Crown,
  Edit,
  FileText,
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
import { AddMemberDialog } from '../src';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const teamId = params.id as string;
  const { hasPermission } = usePermissions();
  const { user: currentUser } = useAuth();

  const canEdit = hasPermission(CORE_PERMISSIONS.TEAMS.UPDATE);
  const canDelete = hasPermission(CORE_PERMISSIONS.TEAMS.DELETE);
  const canManageMembers = hasPermission(CORE_PERMISSIONS.TEAMS.MEMBERS.ADD);

  // State
  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('MEMBER');
  const [pinConfirmOpen, setPinConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'changeRole' | 'removeMember' | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [slugCopied, setSlugCopied] = useState(false);

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
  const isCurrentUserOwner = members.some(
    m => m.userId === currentUser?.id && m.role === 'OWNER'
  );

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

  const transferOwnershipMutation = useMutation({
    mutationFn: (userId: string) =>
      teamsService.transferOwnership(teamId, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      toast.success('Propriedade transferida com sucesso');
      setChangeRoleOpen(false);
      setSelectedMember(null);
    },
    onError: () => toast.error('Erro ao transferir propriedade'),
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

  const handleConfirmChangeRole = () => {
    // Close the role dialog, open PIN confirmation
    setChangeRoleOpen(false);
    setPendingAction('changeRole');
    setPinConfirmOpen(true);
  };

  const handleRequestRemoveMember = (memberId: string) => {
    setMemberToRemove(memberId);
    setPendingAction('removeMember');
    setPinConfirmOpen(true);
  };

  const handlePinSuccess = () => {
    if (pendingAction === 'changeRole' && selectedMember) {
      if (newRole === 'OWNER') {
        transferOwnershipMutation.mutate(selectedMember.userId);
      } else {
        changeRoleMutation.mutate({
          memberId: selectedMember.id,
          role: newRole,
        });
      }
    } else if (pendingAction === 'removeMember' && memberToRemove) {
      removeMemberMutation.mutate(memberToRemove);
    }
    setPendingAction(null);
    setMemberToRemove(null);
  };

  const handleCopySlug = async (slug: string) => {
    await navigator.clipboard.writeText(slug);
    setSlugCopied(true);
    setTimeout(() => setSlugCopied(false), 2000);
  };

  const getRoleBadge = (role: TeamMemberRole) => {
    switch (role) {
      case 'OWNER':
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white">
            <Crown className="w-3 h-3 mr-1" />
            {TEAM_MEMBER_ROLE_LABELS.OWNER}
          </Badge>
        );
      case 'ADMIN':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {TEAM_MEMBER_ROLE_LABELS.ADMIN}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <User className="w-3 h-3 mr-1" />
            {TEAM_MEMBER_ROLE_LABELS.MEMBER}
          </Badge>
        );
    }
  };

  // Loading state
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

  // Not found state
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
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Users2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Equipe não encontrada
            </h2>
            <p className="text-muted-foreground mb-6">
              A equipe que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => router.push('/admin/teams')}>
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
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete',
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setDeleteConfirmOpen(true),
                    variant: 'ghost' as const,
                  },
                ]
              : []),
            ...(canEdit
              ? [
                  {
                    id: 'edit',
                    title: 'Editar',
                    icon: Edit,
                    onClick: handleOpenEdit,
                  },
                ]
              : []),
          ]}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-5">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 ${
                !team.color ? 'bg-linear-to-br from-blue-500 to-cyan-600' : ''
              }`}
              style={
                team.color
                  ? {
                      background: `linear-gradient(to bottom right, ${team.color}, ${team.color}CC)`,
                    }
                  : undefined
              }
            >
              <Users2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
                <Badge variant={team.isActive ? 'default' : 'secondary'}>
                  {team.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-mono text-muted-foreground">
                  {team.slug}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopySlug(team.slug)}
                      >
                        {slugCopied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {slugCopied ? 'Copiado!' : 'Copiar slug'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {team.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    {new Date(team.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {team.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    {new Date(team.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody>
        <div className="flex flex-col gap-4">
          {/* Description Card */}
          <Card className="p-4 sm:p-6 w-full bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <h3 className="text-lg uppercase font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              Informações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="text-sm whitespace-pre-wrap">
                  {team.description || 'Sem descrição'}
                </p>
              </div>
              {team.color && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cor</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-mono text-sm">{team.color}</span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Criado por</p>
                <p className="text-sm font-medium">{team.creatorName ?? team.createdBy}</p>
              </div>
            </div>
          </Card>

          {/* Members Card */}
          <Card className="p-4 sm:p-6 w-full bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg uppercase font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membros
                <Badge variant="secondary" className="ml-2">
                  {team.membersCount}
                </Badge>
              </h3>
              {canManageMembers && (
                <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
              )}
            </div>

            {isLoadingMembers ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum membro encontrado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={member.userName}
                        email={member.userEmail}
                        avatarUrl={member.userAvatarUrl}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">
                          {member.userName || member.userEmail || 'Sem nome'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.userEmail ?? member.userId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(member.role)}
                      {canManageMembers && member.role !== 'OWNER' && (isCurrentUserOwner || member.role === 'MEMBER') && (
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
                            onClick={() => handleRequestRemoveMember(member.id)}
                            title="Remover membro"
                          >
                            <UserMinus className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
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
                onChange={e => setEditName(e.target.value)}
                placeholder="Nome da equipe"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
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
                  onChange={e => setEditColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
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

      {/* CHANGE ROLE / TRANSFER OWNERSHIP MODAL */}
      <Dialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Papel do Membro</DialogTitle>
            <DialogDescription>
              Altere o papel de {selectedMember?.userName ?? 'membro'} na equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Novo papel</Label>
              <Select
                value={newRole}
                onValueChange={v => setNewRole(v as 'OWNER' | 'ADMIN' | 'MEMBER')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  {isCurrentUserOwner && (
                    <SelectItem value="OWNER">Proprietário (Transferir Propriedade)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {newRole === 'OWNER' && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    Atenção: Transferência de propriedade
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Ao transferir a propriedade, você será rebaixado para Administrador e{' '}
                    <span className="font-medium">{selectedMember?.userName ?? 'este membro'}</span>{' '}
                    se tornará o novo proprietário da equipe. Esta ação requer confirmação por PIN.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmChangeRole}
              variant={newRole === 'OWNER' ? 'destructive' : 'default'}
            >
              {newRole === 'OWNER' ? 'Transferir Propriedade' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD MEMBER DIALOG */}
      <AddMemberDialog
        teamId={teamId}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />

      {/* DELETE CONFIRM */}
      <VerifyActionPinModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onSuccess={handleDeleteConfirm}
        title="Excluir Equipe"
        description={`Tem certeza que deseja excluir a equipe "${team.name}"? Esta ação não pode ser desfeita.`}
      />

      {/* PIN CONFIRM for role change / transfer ownership / remove member */}
      <VerifyActionPinModal
        isOpen={pinConfirmOpen}
        onClose={() => {
          setPinConfirmOpen(false);
          setPendingAction(null);
          setMemberToRemove(null);
        }}
        onSuccess={handlePinSuccess}
        title={
          pendingAction === 'changeRole' && newRole === 'OWNER'
            ? 'Confirmar Transferência de Propriedade'
            : pendingAction === 'removeMember'
              ? 'Confirmar Remoção de Membro'
              : 'Confirmar Alteração de Papel'
        }
        description={
          pendingAction === 'changeRole' && newRole === 'OWNER'
            ? `Digite seu PIN de ação para transferir a propriedade da equipe para ${selectedMember?.userName ?? 'este membro'}.`
            : pendingAction === 'removeMember'
              ? 'Digite seu PIN de ação para remover este membro da equipe.'
              : `Digite seu PIN de ação para alterar o papel de ${selectedMember?.userName ?? 'membro'}.`
        }
      />
    </PageLayout>
  );
}
