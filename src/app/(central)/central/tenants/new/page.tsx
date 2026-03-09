'use client';

import { GlassBadge } from '@/components/central/glass-badge';
import { GlassButton } from '@/components/central/glass-button';
import { GlassCard } from '@/components/central/glass-card';
import { GlassInput } from '@/components/central/glass-input';
import {
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
} from '@/components/central/glass-select';
import { cn } from '@/lib/utils';
import {
  useAdminPlans,
  useChangeTenantPlan,
  useCreateTenant,
  useCreateTenantUser,
} from '@/hooks/admin/use-admin';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  Loader2,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const STEPS = [
  { label: 'Dados', icon: Building2 },
  { label: 'Plano', icon: CreditCard },
  { label: 'Usuário', icon: UserPlus },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'INACTIVE', label: 'Inativa' },
  { value: 'SUSPENDED', label: 'Suspensa' },
];

export default function NewTenantPage() {
  const router = useRouter();
  const createTenant = useCreateTenant();
  const changePlan = useChangeTenantPlan();
  const createUser = useCreateTenantUser();
  const { data: plansData, isLoading: plansLoading } = useAdminPlans();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Tenant data
  const [tenantForm, setTenantForm] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    status: 'ACTIVE',
  });

  // Step 2: Plan selection
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Step 3: Owner user (optional)
  const [userForm, setUserForm] = useState({
    email: '',
    username: '',
    password: '',
  });

  const plans = plansData?.plans ?? [];

  // Per-step validation
  const isStep1Valid = tenantForm.name.trim().length > 0;
  const isStep2Valid = true; // Plan is optional
  const isStep3Valid = true; // Owner is optional

  const canAdvance = [isStep1Valid, isStep2Valid, isStep3Valid][step];

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Step 1: Create tenant
      const tenant = await createTenant.mutateAsync({
        name: tenantForm.name,
        slug: tenantForm.slug || undefined,
        logoUrl: tenantForm.logoUrl || undefined,
        status: tenantForm.status,
      });

      const tenantId = tenant.id;

      // Step 2: Assign plan (if selected)
      if (selectedPlanId) {
        try {
          await changePlan.mutateAsync({
            id: tenantId,
            planId: selectedPlanId,
          });
        } catch {
          toast.error('Empresa criada, mas houve erro ao atribuir o plano');
        }
      }

      // Step 3: Create owner user (if filled)
      if (userForm.email.trim() && userForm.password.trim()) {
        try {
          await createUser.mutateAsync({
            id: tenantId,
            data: {
              email: userForm.email,
              password: userForm.password,
              username: userForm.username || undefined,
              role: 'owner',
            },
          });
        } catch {
          toast.error(
            'Empresa criada, mas houve erro ao criar o usuário proprietário'
          );
        }
      }

      toast.success('Empresa criada com sucesso!');
      router.push(`/central/tenants/${tenantId}`);
    } catch {
      toast.error('Erro ao criar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/central/tenants">
          <GlassButton
            variant="ghost"
            size="sm"
            aria-label="Voltar para empresas"
          >
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight central-text">
            Nova Empresa
          </h1>
          <p className="central-text-muted text-sm mt-1">
            Siga os passos para configurar a nova empresa
          </p>
        </div>
      </div>

      {/* Step Progress Indicator */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  'flex items-center gap-2 central-transition',
                  i <= step ? 'cursor-pointer' : 'cursor-default opacity-50'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 central-transition',
                    i < step
                      ? 'bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))] text-white'
                      : i === step
                        ? 'border-[rgb(var(--color-primary))] central-text central-glass'
                        : 'border-[rgb(var(--central-border)/0.3)] central-text-subtle'
                  )}
                >
                  {i < step ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium hidden sm:inline',
                    i === step ? 'central-text' : 'central-text-muted'
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3 rounded-full central-transition',
                    i < step
                      ? 'bg-[rgb(var(--color-primary))]'
                      : 'bg-[rgb(var(--central-border)/0.2)]'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto">
        {/* Step 1: Tenant Data */}
        {step === 0 && (
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl central-accent-blue central-accent-gradient border border-[rgb(var(--os-blue-500)/0.3)]">
                <Building2 className="h-5 w-5 central-accent-text" />
              </div>
              <div>
                <h2 className="text-lg font-semibold central-text">
                  Dados Básicos
                </h2>
                <p className="text-sm central-text-muted">
                  Informações principais da empresa
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium central-text"
                >
                  Nome *
                </label>
                <GlassInput
                  id="name"
                  value={tenantForm.name}
                  onChange={e =>
                    setTenantForm(f => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="slug"
                  className="text-sm font-medium central-text"
                >
                  Slug (opcional)
                </label>
                <GlassInput
                  id="slug"
                  value={tenantForm.slug}
                  onChange={e =>
                    setTenantForm(f => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="Gerado automaticamente se vazio"
                />
                <p className="text-xs central-text-muted">
                  Identificador único na URL. Gerado a partir do nome se vazio.
                </p>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="logoUrl"
                  className="text-sm font-medium central-text"
                >
                  URL do Logo (opcional)
                </label>
                <GlassInput
                  id="logoUrl"
                  value={tenantForm.logoUrl}
                  onChange={e =>
                    setTenantForm(f => ({ ...f, logoUrl: e.target.value }))
                  }
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="tenant-status" className="text-sm font-medium central-text">
                  Status
                </label>
                <GlassSelect
                  value={tenantForm.status}
                  onValueChange={v => setTenantForm(f => ({ ...f, status: v }))}
                >
                  <GlassSelectTrigger className="w-[200px]">
                    <GlassSelectValue />
                  </GlassSelectTrigger>
                  <GlassSelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <GlassSelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </GlassSelectItem>
                    ))}
                  </GlassSelectContent>
                </GlassSelect>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Step 2: Plan Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl central-accent-purple central-accent-gradient border border-[rgb(var(--os-purple-500)/0.3)]">
                <CreditCard className="h-5 w-5 central-accent-text" />
              </div>
              <div>
                <h2 className="text-lg font-semibold central-text">
                  Selecionar Plano
                </h2>
                <p className="text-sm central-text-muted">
                  Escolha um plano para a empresa (opcional)
                </p>
              </div>
            </div>

            {plansLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-40 rounded-2xl central-glass-subtle animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {plans
                  .filter(p => p.isActive)
                  .map(plan => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <GlassCard
                        key={plan.id}
                        hover
                        className={cn(
                          'p-5 cursor-pointer border-2 central-transition',
                          isSelected
                            ? 'border-[rgb(var(--color-primary))] shadow-lg'
                            : 'border-transparent'
                        )}
                        onClick={() =>
                          setSelectedPlanId(isSelected ? null : plan.id)
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold central-text text-lg">
                              {plan.name}
                            </h3>
                            <GlassBadge variant="default" className="mt-1">
                              {plan.tier}
                            </GlassBadge>
                          </div>
                          {isSelected && (
                            <div className="p-1.5 rounded-full bg-[rgb(var(--color-primary))] text-white">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold central-text mb-2">
                          R$ {plan.price.toFixed(2)}
                          <span className="text-sm font-normal central-text-muted">
                            /mês
                          </span>
                        </p>
                        <div className="text-xs central-text-muted space-y-0.5">
                          <p>{plan.maxUsers} usuários</p>
                          <p>{plan.maxWarehouses} armazéns</p>
                          <p>{plan.maxProducts} produtos</p>
                        </div>
                      </GlassCard>
                    );
                  })}
              </div>
            )}

            {selectedPlanId && (
              <p className="text-sm central-text-muted text-center">
                Clique novamente no plano selecionado para desmarcar
              </p>
            )}
          </div>
        )}

        {/* Step 3: Owner User */}
        {step === 2 && (
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl central-accent-green central-accent-gradient border border-[rgb(34_197_94/0.3)]">
                <UserPlus className="h-5 w-5 central-accent-text" />
              </div>
              <div>
                <h2 className="text-lg font-semibold central-text">
                  Usuário Proprietário
                </h2>
                <p className="text-sm central-text-muted">
                  Crie o primeiro usuário da empresa (opcional — pode pular)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="user-email"
                  className="text-sm font-medium central-text"
                >
                  Email
                </label>
                <GlassInput
                  id="user-email"
                  type="email"
                  value={userForm.email}
                  onChange={e =>
                    setUserForm(f => ({ ...f, email: e.target.value }))
                  }
                  placeholder="proprietario@empresa.com"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="user-username"
                  className="text-sm font-medium central-text"
                >
                  Username (opcional)
                </label>
                <GlassInput
                  id="user-username"
                  value={userForm.username}
                  onChange={e =>
                    setUserForm(f => ({ ...f, username: e.target.value }))
                  }
                  placeholder="Gerado automaticamente se vazio"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="user-password"
                  className="text-sm font-medium central-text"
                >
                  Senha
                </label>
                <GlassInput
                  id="user-password"
                  type="password"
                  value={userForm.password}
                  onChange={e =>
                    setUserForm(f => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            {userForm.email && !userForm.password && (
              <p className="text-sm text-amber-500">
                Preencha a senha para criar o usuário, ou limpe o email para
                pular.
              </p>
            )}
          </GlassCard>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <GlassButton
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </GlassButton>

          {step < STEPS.length - 1 ? (
            <GlassButton
              variant="primary"
              onClick={handleNext}
              disabled={!canAdvance}
              className="gap-2"
            >
              Avançar
              <ArrowRight className="h-4 w-4" />
            </GlassButton>
          ) : (
            <GlassButton
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !isStep1Valid}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Empresa
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
}
