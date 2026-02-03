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
import { Switch } from '@/components/ui/switch';
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
  CheckCircle,
  CreditCard,
  Flag,
  Mail,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
  XCircle,
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

  useEffect(() => {
    if (data?.tenant) {
      setForm({
        name: data.tenant.name,
        slug: data.tenant.slug,
        logoUrl: data.tenant.logoUrl ?? '',
      });
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

  if (!data) {
    return (
      <GlassCard className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-white/40 mx-auto mb-4" />
        <p className="text-white/60 text-lg">Empresa não encontrada</p>
      </GlassCard>
    );
  }

  const { tenant, plan, featureFlags } = data;
  const users = usersData?.users ?? [];

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
    if (!planId || planId === plan?.id) return;
    try {
      await changePlan.mutateAsync({ id, planId });
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
      <div className="flex items-end justify-between gap-6">
        <div className="flex items-end gap-4 flex-1">
          <Link href="/central/tenants">
            <GlassButton variant="ghost" size="sm" className="gap-2 mb-1">
              <ArrowLeft className="h-4 w-4" />
            </GlassButton>
          </Link>
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-white">{tenant.name}</h1>
            <p className="text-white/50 text-sm mt-2 font-mono">
              {tenant.slug}
            </p>
          </div>
        </div>
        <GlassBadge
          variant={
            statusColor[tenant.status as keyof typeof statusColor] || 'default'
          }
          className="text-base px-4 py-2"
        >
          {tenant.status}
        </GlassBadge>
      </div>

      {/* Quick Stats - Premium Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard
          variant="gradient"
          className="p-6 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">
                Total de Usuários
              </p>
              <p className="text-4xl font-bold text-white">{users.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/30 border border-blue-400/30">
              <Users className="h-6 w-6 text-blue-300" />
            </div>
          </div>
          <p className="text-xs text-white/50">
            {users.filter(u => u.role === 'owner').length} proprietário(s)
          </p>
        </GlassCard>

        <GlassCard
          variant="gradient"
          className="p-6 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">
                Plano Atual
              </p>
              <p className="text-2xl font-bold text-white">
                {plan?.name ?? 'Nenhum'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/30 border border-purple-400/30">
              <CreditCard className="h-6 w-6 text-purple-300" />
            </div>
          </div>
          <p className="text-xs text-white/50">
            {plan ? `Tier: ${plan.tier}` : 'Nenhum plano atribuído'}
          </p>
        </GlassCard>

        <GlassCard
          variant="gradient"
          className="p-6 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">
                Data de Criação
              </p>
              <p className="text-lg font-bold text-white">
                {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/30 border border-amber-400/30">
              <Calendar className="h-6 w-6 text-amber-300" />
            </div>
          </div>
          <p className="text-xs text-white/50">
            {Math.floor(
              (Date.now() - new Date(tenant.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )}{' '}
            dias atrás
          </p>
        </GlassCard>
      </div>

      {/* Tabs Modernas */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 gap-2 h-12">
          <TabsTrigger value="info" className="gap-2 text-base">
            <Building2 className="h-4 w-4" />
            <span>Informações</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 text-base">
            <Users className="h-4 w-4" />
            <span>Usuários</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold">
              {users.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            <span>Plano</span>
          </TabsTrigger>
          <TabsTrigger value="flags" className="gap-2 text-base">
            <Flag className="h-4 w-4" />
            <span>Flags</span>
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6 mt-8">
          <GlassCard variant="gradient" className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-linear-to-br from-blue-500/30 to-blue-600/30 border border-blue-400/30">
                <Building2 className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Editar Informações
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Gerencie os dados da empresa
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Seção: Dados Básicos */}
              <div>
                <h3 className="text-white/90 font-semibold mb-4 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400" />
                  Dados Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-white/90 font-medium">
                      Nome da Empresa
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={e =>
                        setForm(f => ({ ...f, name: e.target.value }))
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 rounded-lg focus:border-blue-400/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="slug" className="text-white/90 font-medium">
                      Slug
                    </Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={e =>
                        setForm(f => ({ ...f, slug: e.target.value }))
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 rounded-lg focus:border-blue-400/50"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Configurações */}
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-white/90 font-semibold mb-4 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-400" />
                  Configurações
                </h3>
                <div className="space-y-6 pl-4">
                  <div className="space-y-3">
                    <Label
                      htmlFor="logoUrl"
                      className="text-white/90 font-medium"
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 rounded-lg focus:border-purple-400/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="status"
                      className="text-white/90 font-medium"
                    >
                      Status da Empresa
                    </Label>
                    <Select
                      value={tenant.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white h-11 rounded-lg focus:border-purple-400/50">
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

          <div className="flex items-center justify-between gap-4">
            <GlassButton
              variant="danger"
              onClick={handleDelete}
              className="gap-2 px-6"
              size="lg"
            >
              <Trash2 className="h-5 w-5" />
              Desativar Empresa
            </GlassButton>
            <GlassButton
              onClick={handleSave}
              disabled={updateTenant.isPending || !form.name.trim()}
              className="gap-2 px-6"
              size="lg"
            >
              <Save className="h-5 w-5" />
              Salvar Alterações
            </GlassButton>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6 mt-8">
          <div className="flex justify-end">
            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
              <DialogTrigger asChild>
                <GlassButton className="gap-2" size="lg">
                  <Plus className="h-5 w-5" />
                  Novo Usuário
                </GlassButton>
              </DialogTrigger>
              <DialogContent className="bg-linear-to-br from-white/20 to-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Adicionar Novo Usuário
                  </DialogTitle>
                  <DialogDescription className="text-white/70">
                    Crie um novo usuário e associe a esta empresa.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="user-email" className="text-white/90">
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-username" className="text-white/90">
                      Username (opcional)
                    </Label>
                    <Input
                      id="user-username"
                      value={userForm.username}
                      onChange={e =>
                        setUserForm(f => ({ ...f, username: e.target.value }))
                      }
                      placeholder="Gerado automaticamente se vazio"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-password" className="text-white/90">
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-role" className="text-white/90">
                      Papel
                    </Label>
                    <Select
                      value={userForm.role}
                      onValueChange={v => setUserForm(f => ({ ...f, role: v }))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
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
                  className="p-5 flex items-center justify-between hover:bg-white/[0.15] transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                      {u.role === 'owner' ? (
                        <Shield className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Users className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-base">
                        {u.user?.username ?? u.userId}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3.5 w-3.5 text-white/50" />
                        <p className="text-sm text-white/60">{u.user?.email}</p>
                      </div>
                      <p className="text-xs text-white/40 mt-2">
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
                        className="text-red-400 hover:text-red-300"
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
              <Users className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg">
                Nenhum usuário nesta empresa
              </p>
            </GlassCard>
          )}
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan" className="space-y-6 mt-8">
          {plan ? (
            <GlassCard variant="gradient" className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-xl bg-linear-to-br from-purple-500/30 to-purple-600/30 border border-purple-400/30">
                    <CreditCard className="h-7 w-7 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">Plano atual</p>
                  </div>
                </div>
                <GlassBadge variant="success" className="text-base px-4 py-2">
                  {plan.tier}
                </GlassBadge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/70 text-sm font-medium">
                    Valor Mensal
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    R$ {plan.price.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/70 text-sm font-medium">
                    Máx. Usuários
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {plan.maxUsers >= 999999 ? '∞' : plan.maxUsers}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/70 text-sm font-medium">Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    {plan.isActive ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="font-semibold text-white">Ativo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-400" />
                        <span className="font-semibold text-white">
                          Inativo
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {plan.description && (
                <p className="text-white/70 text-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  {plan.description}
                </p>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-2">
                Nenhum plano atribuído
              </p>
              <p className="text-white/50 text-sm">
                Escolha um plano para esta empresa usando a opção abaixo
              </p>
            </GlassCard>
          )}

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-5 w-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Gerenciar Plano</h3>
            </div>
            <Select onValueChange={handlePlanChange} value={plan?.id || ''}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-11">
                <SelectValue placeholder="Selecione um novo plano" />
              </SelectTrigger>
              <SelectContent>
                {plansData?.plans.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - R$ {p.price.toFixed(2)} ({p.tier})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </GlassCard>
        </TabsContent>

        {/* Flags Tab */}
        <TabsContent value="flags" className="space-y-6 mt-8">
          {featureFlags && featureFlags.length > 0 ? (
            <div className="grid gap-4">
              {featureFlags.map(ff => (
                <GlassCard
                  key={ff.id}
                  className="p-5 flex items-center justify-between hover:bg-white/[0.15] transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                      <Flag className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{ff.flag}</p>
                      <p className="text-xs text-white/50 mt-1">Feature Flag</p>
                    </div>
                  </div>
                  <Switch
                    checked={ff.enabled}
                    onCheckedChange={checked =>
                      handleFlagToggle(ff.flag, checked)
                    }
                  />
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Flag className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg">
                Nenhuma feature flag configurada
              </p>
            </GlassCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
