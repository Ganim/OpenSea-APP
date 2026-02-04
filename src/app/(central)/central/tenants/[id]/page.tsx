'use client';

import { GlassBadge, GlassButton, GlassCard } from '@/components/central';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  useAdminPlans,
  useAdminTenantDetails,
  useAdminTenantUsers,
  useChangeTenantPlan,
  useChangeTenantStatus,
  useCreateTenantUser,
  useDeleteTenant,
  useManageFeatureFlags,
  useRemoveTenantUser,
  useUpdateTenant,
} from '@/hooks/admin/use-admin';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Flag,
  Mail,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const statusOptions = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
const roleOptions = ['member', 'owner'];

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useAdminTenantDetails(id);
  const { data: usersData } = useAdminTenantUsers(id);
  const { data: plansData } = useAdminPlans();
  const changeStatus = useChangeTenantStatus();
  const changePlan = useChangeTenantPlan();
  const manageFlags = useManageFeatureFlags();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();
  const createTenantUser = useCreateTenantUser();
  const removeTenantUser = useRemoveTenantUser();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    logoUrl: '',
  });

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    username: '',
    role: 'member',
  });
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (data?.tenant) {
      setForm({
        name: data.tenant.name,
        slug: data.tenant.slug,
        logoUrl: data.tenant.logoUrl ?? '',
      });
    }
    if (data?.currentPlanId) {
      setSelectedPlanId(data.currentPlanId);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <Skeleton className="h-16 w-80" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data?.tenant) {
    return (
      <GlassCard className="p-12 text-center">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 central-text-subtle" />
        <p className="text-lg central-text-muted">Empresa não encontrada</p>
      </GlassCard>
    );
  }

  const { tenant } = data;
  const users = usersData?.users ?? [];
  const plans = plansData?.plans ?? [];
  const currentPlan = plans.find(p => p.id === selectedPlanId);

  const statusColor = {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    SUSPENDED: 'error',
  } as const;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await changeStatus.mutateAsync({ id, status: newStatus });
      toast.success('Status atualizado com sucesso');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handlePlanChange = async (planId: string) => {
    if (!planId) return;
    try {
      await changePlan.mutateAsync({ id, planId });
      setSelectedPlanId(planId);
      toast.success('Plano atualizado com sucesso');
    } catch {
      toast.error('Erro ao atualizar plano');
    }
  };

  const handleSave = async () => {
    try {
      await updateTenant.mutateAsync({
        id,
        data: {
          name: form.name,
          slug: form.slug,
          logoUrl: form.logoUrl || null,
        },
      });
      toast.success('Informações atualizadas com sucesso');
    } catch {
      toast.error('Erro ao atualizar informações');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja desativar esta empresa?')) return;
    try {
      await deleteTenant.mutateAsync(id);
      toast.success('Empresa desativada com sucesso');
      router.push('/central/tenants');
    } catch {
      toast.error('Erro ao desativar empresa');
    }
  };

  const handleCreateUser = async () => {
    try {
      await createTenantUser.mutateAsync({
        id,
        data: {
          email: userForm.email,
          password: userForm.password,
          username: userForm.username || undefined,
          role: userForm.role,
        },
      });
      toast.success('Usuário criado com sucesso');
      setCreateUserOpen(false);
      setUserForm({ email: '', password: '', username: '', role: 'member' });
    } catch {
      toast.error('Erro ao criar usuário');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      await removeTenantUser.mutateAsync({ tenantId: id, userId });
      toast.success('Usuário removido com sucesso');
    } catch {
      toast.error('Erro ao remover usuário');
    }
  };

  const handleFlagToggle = async (flag: string, enabled: boolean) => {
    try {
      await manageFlags.mutateAsync({ id, flag, enabled });
      toast.success('Flag atualizada com sucesso');
    } catch {
      toast.error('Erro ao atualizar flag');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Premium */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-6">
          <Link href="/central/tenants">
            <GlassButton
              variant="ghost"
              size="sm"
              className="gap-2 mb-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <label className="cursor-pointer">Voltar</label>
            </GlassButton>
          </Link>
          <div className="flex items-center justify-between gap-4">
            <GlassButton
              variant="danger"
              onClick={handleDelete}
              className="gap-2"
              size="sm"
            >
              <Trash2 className="h-5 w-5" />
              Desativar Empresa
            </GlassButton>
            <GlassButton
              onClick={handleSave}
              disabled={updateTenant.isPending || !form.name.trim()}
              className="gap-2"
              size="sm"
            >
              <Save className="h-5 w-5" />
              Salvar Alterações
            </GlassButton>
          </div>
        </div>
        <div className="flex items-end justify-between gap-6">
          <div className="flex items-end gap-4 flex-1">
            <div className="flex-1">
              <h1 className="text-5xl font-bold central-text">{tenant.name}</h1>
              <p className="text-sm mt-2 font-mono central-text-subtle">
                {tenant.slug}
              </p>
            </div>
          </div>
          <GlassBadge
            variant={
              statusColor[tenant.status as keyof typeof statusColor] ||
              'default'
            }
            className="text-base px-4 py-2"
          >
            {tenant.status}
          </GlassBadge>
        </div>
      </div>

      {/* Quick Stats - Premium Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard
          variant="gradient"
          className="p-6 flex flex-col justify-between central-accent-blue"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium mb-1 central-text-muted">
                Total de Usuários
              </p>
              <p className="text-4xl font-bold central-text">{users.length}</p>
            </div>
            <div className="p-3 rounded-xl border central-accent-gradient border-[rgb(var(--os-blue-500)/0.3)]">
              <Users className="h-6 w-6 central-accent-text" />
            </div>
          </div>
          <p className="text-xs central-text-subtle">
            {users.filter(u => u.role === 'owner').length} proprietário(s)
          </p>
        </GlassCard>

        <GlassCard
          variant="gradient"
          className="p-6 flex flex-col justify-between central-accent-purple"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium mb-1 central-text-muted">
                Plano Atual
              </p>
              <p className="text-2xl font-bold central-text">
                {currentPlan?.name || 'Nenhum'}
              </p>
            </div>
            <div className="p-3 rounded-xl border central-accent-gradient border-[rgb(var(--os-purple-500)/0.3)]">
              <CreditCard className="h-6 w-6 central-accent-text" />
            </div>
          </div>
          <p className="text-xs central-text-subtle">
            {currentPlan
              ? `Tier: ${currentPlan.tier}`
              : 'Configure o plano nas opções abaixo'}
          </p>
        </GlassCard>

        <GlassCard
          variant="gradient"
          className="p-6 flex flex-col justify-between central-accent-amber"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium mb-1 central-text-muted">
                Data de Criação
              </p>
              <p className="text-lg font-bold central-text">
                {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="p-3 rounded-xl border central-accent-gradient border-[rgb(245_158_11/0.3)]">
              <Calendar className="h-6 w-6 central-accent-text" />
            </div>
          </div>
          <p className="text-xs central-text-subtle">
            {Math.floor(
              (Date.now() - new Date(tenant.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )}{' '}
            dias atrás
          </p>
        </GlassCard>
      </div>

      {/* Tabs Modernas */}
      <Tabs defaultValue="info" className="space-y-6 w-full">
        <TabsList className="gap-2 h-12 w-full border central-glass">
          <TabsTrigger
            value="info"
            className="gap-2 text-base central-text-muted"
          >
            <Building2 className="h-4 w-4" />
            <span>Informações</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="gap-2 text-base central-text-muted"
          >
            <Users className="h-4 w-4" />
            <span>Usuários</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold central-glass-subtle central-text">
              {users.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="plan"
            className="gap-2 text-base central-text-muted"
          >
            <CreditCard className="h-4 w-4" />
            <span>Plano</span>
          </TabsTrigger>
          <TabsTrigger
            value="flags"
            className="gap-2 text-base central-text-muted"
          >
            <Flag className="h-4 w-4" />
            <span>Flags</span>
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6 w-full">
          <GlassCard variant="gradient" className="p-8 w-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl border central-accent-blue central-accent-gradient border-[rgb(var(--os-blue-500)/0.3)]">
                <Building2 className="h-6 w-6 central-accent-text" />
              </div>
              <div>
                <h2 className="text-2xl font-bold central-text">
                  Editar Informações
                </h2>
                <p className="text-sm mt-1 central-text-muted">
                  Gerencie os dados da empresa
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Seção: Dados Básicos */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2 central-text">
                  <div className="w-1 h-1 rounded-full bg-[rgb(var(--color-primary))]" />
                  Dados Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="font-medium central-text">
                      Nome da Empresa
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={e =>
                        setForm(f => ({ ...f, name: e.target.value }))
                      }
                      className="h-11 rounded-lg central-glass central-text placeholder:central-text-subtle"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="slug" className="font-medium central-text">
                      Slug
                    </Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={e =>
                        setForm(f => ({ ...f, slug: e.target.value }))
                      }
                      className="h-11 rounded-lg central-glass central-text placeholder:central-text-subtle"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Configurações */}
              <div className="border-t pt-8 border-[rgb(var(--glass-border)/var(--glass-border-opacity))]">
                <h3 className="font-semibold mb-4 flex items-center gap-2 central-text">
                  <div className="w-1 h-1 rounded-full bg-[rgb(var(--os-purple-500))]" />
                  Configurações
                </h3>
                <div className="space-y-6 pl-4">
                  <div className="space-y-3">
                    <Label
                      htmlFor="logoUrl"
                      className="font-medium central-text"
                    >
                      URL do Logo
                    </Label>
                    <Input
                      id="logoUrl"
                      value={form.logoUrl}
                      onChange={e =>
                        setForm(f => ({ ...f, logoUrl: e.target.value }))
                      }
                      placeholder="https://exemplo.com/logo.png"
                      className="h-11 rounded-lg central-glass central-text placeholder:central-text-subtle"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="status"
                      className="font-medium central-text"
                    >
                      Status da Empresa
                    </Label>
                    <Select
                      value={tenant.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="h-11 rounded-lg central-glass central-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="flex flex-col space-y-6 w-full">
          <div className="flex justify-end w-full">
            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
              <DialogTrigger asChild>
                <GlassButton className="gap-2" size="sm">
                  <Plus className="h-5 w-5" />
                  Novo Usuário
                </GlassButton>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-2xl border shadow-2xl central-glass-strong">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold central-text">
                    Adicionar Novo Usuário
                  </DialogTitle>
                  <DialogDescription className="central-text-muted">
                    Crie um novo usuário e associe a esta empresa.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="user-email" className="central-text">
                      Email
                    </Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userForm.email}
                      onChange={e =>
                        setUserForm(f => ({ ...f, email: e.target.value }))
                      }
                      placeholder="usuario@exemplo.com"
                      className="mt-2 central-glass central-text placeholder:central-text-subtle"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-username" className="central-text">
                      Username (opcional)
                    </Label>
                    <Input
                      id="user-username"
                      value={userForm.username}
                      onChange={e =>
                        setUserForm(f => ({ ...f, username: e.target.value }))
                      }
                      placeholder="Gerado automaticamente se vazio"
                      className="mt-2 central-glass central-text placeholder:central-text-subtle"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-password" className="central-text">
                      Senha
                    </Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={userForm.password}
                      onChange={e =>
                        setUserForm(f => ({ ...f, password: e.target.value }))
                      }
                      placeholder="Mínimo 6 caracteres"
                      className="mt-2 central-glass central-text placeholder:central-text-subtle"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-role" className="central-text">
                      Papel
                    </Label>
                    <Select
                      value={userForm.role}
                      onValueChange={v => setUserForm(f => ({ ...f, role: v }))}
                    >
                      <SelectTrigger className="mt-2 central-glass central-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(r => (
                          <SelectItem key={r} value={r}>
                            {r === 'owner' ? 'Proprietário' : 'Membro'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <GlassButton
                    onClick={handleCreateUser}
                    disabled={
                      createTenantUser.isPending ||
                      !userForm.email.trim() ||
                      !userForm.password.trim()
                    }
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Usuário
                  </GlassButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {users.length > 0 ? (
            <div className="grid gap-4">
              {users.map(u => (
                <GlassCard
                  key={u.id}
                  className="p-5 flex items-center justify-between central-transition central-glass-hover"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl border central-glass">
                      {u.role === 'owner' ? (
                        <Shield className="h-5 w-5 text-[rgb(245_158_11)]" />
                      ) : (
                        <Users className="h-5 w-5 text-[rgb(var(--color-primary))]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base central-text">
                        {u.user?.username ?? u.userId}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3.5 w-3.5 central-text-subtle" />
                        <p className="text-sm central-text-muted">
                          {u.user?.email}
                        </p>
                      </div>
                      <p className="text-xs mt-2 central-text-subtle">
                        Membro desde{' '}
                        {new Date(u.joinedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GlassBadge
                      variant={u.role === 'owner' ? 'success' : 'info'}
                    >
                      {u.role === 'owner' ? 'Proprietário' : 'Membro'}
                    </GlassBadge>
                    {u.role !== 'owner' && (
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(u.userId)}
                        disabled={removeTenantUser.isPending}
                        className="text-[rgb(var(--color-destructive))] hover:text-[rgb(var(--color-destructive-hover))]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </GlassButton>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 central-text-subtle" />
              <p className="text-lg central-text-muted">
                Nenhum usuário nesta empresa
              </p>
            </GlassCard>
          )}
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan" className="flex flex-col space-y-6 w-full">
          <GlassCard className="p-6 central-accent-cyan">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-5 w-5 central-accent-text" />
              <h3 className="text-xl font-bold central-text">
                Gerenciar Plano
              </h3>
            </div>
            <Select
              onValueChange={handlePlanChange}
              value={selectedPlanId || ''}
            >
              <SelectTrigger className="h-11 central-glass central-text">
                <SelectValue placeholder="Selecione um novo plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - R$ {p.price.toFixed(2)} ({p.tier})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </GlassCard>
          <GlassCard className="p-12 text-center w-full">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 central-text-subtle" />
            <p className="text-lg mb-2 central-text-muted">
              Nenhum plano atribuído
            </p>
            <p className="text-sm central-text-subtle">
              Escolha um plano para esta empresa usando a opção abaixo
            </p>
          </GlassCard>
        </TabsContent>

        {/* Flags Tab */}
        <TabsContent value="flags" className="space-y-6 mt-8 w-full">
          <GlassCard className="p-12 text-center w-full">
            <Flag className="h-16 w-16 mx-auto mb-4 central-text-subtle" />
            <p className="text-lg central-text-muted">
              Feature flags não disponíveis
            </p>
            <p className="text-sm mt-2 central-text-subtle">
              Esta funcionalidade será implementada em breve
            </p>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
