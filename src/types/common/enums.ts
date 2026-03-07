/**
 * Enums compartilhados entre frontend e backend
 * Garante consistency de tipos em toda a aplicação
 */

// =====================================
// TENANT
// =====================================

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  [TenantStatus.ACTIVE]: 'Ativo',
  [TenantStatus.INACTIVE]: 'Inativo',
  [TenantStatus.SUSPENDED]: 'Suspenso',
};

// =====================================
// PLAN
// =====================================

export enum PlanTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  [PlanTier.FREE]: 'Gratuito',
  [PlanTier.STARTER]: 'Iniciante',
  [PlanTier.PROFESSIONAL]: 'Profissional',
  [PlanTier.ENTERPRISE]: 'Empresarial',
};

// =====================================
// MODULES
// =====================================

export enum AdminModules {
  CORE = 'CORE',
  STOCK = 'STOCK',
  SALES = 'SALES',
  HR = 'HR',
  PAYROLL = 'PAYROLL',
  FINANCE = 'FINANCE',
  REPORTS = 'REPORTS',
  AUDIT = 'AUDIT',
  REQUESTS = 'REQUESTS',
}

export const ADMIN_MODULES_LABELS: Record<AdminModules, string> = {
  [AdminModules.CORE]: 'Core',
  [AdminModules.STOCK]: 'Estoque',
  [AdminModules.SALES]: 'Vendas',
  [AdminModules.HR]: 'Recursos Humanos',
  [AdminModules.PAYROLL]: 'Folha de Pagamento',
  [AdminModules.FINANCE]: 'Financeiro',
  [AdminModules.REPORTS]: 'Relatórios',
  [AdminModules.AUDIT]: 'Auditoria',
  [AdminModules.REQUESTS]: 'Solicitações',
};

// =====================================
// ROLE-BASED ACCESS CONTROL
// =====================================

export enum TenantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export const TENANT_ROLE_LABELS: Record<TenantRole, string> = {
  [TenantRole.OWNER]: 'Proprietário',
  [TenantRole.ADMIN]: 'Administrador',
  [TenantRole.MANAGER]: 'Gerenciador',
  [TenantRole.USER]: 'Usuário',
  [TenantRole.VIEWER]: 'Visualizador',
};

// =====================================
// FEATURE FLAGS
// =====================================

export enum FeatureFlagNames {
  NOTIFICATIONS = 'NOTIFICATIONS',
  ADVANCED_REPORTS = 'ADVANCED_REPORTS',
  CUSTOM_BRANDING = 'CUSTOM_BRANDING',
  API_ACCESS = 'API_ACCESS',
}

export const FEATURE_FLAG_LABELS: Record<FeatureFlagNames, string> = {
  [FeatureFlagNames.NOTIFICATIONS]: 'Notificações',
  [FeatureFlagNames.ADVANCED_REPORTS]: 'Relatórios Avançados',
  [FeatureFlagNames.CUSTOM_BRANDING]: 'Marca Personalizada',
  [FeatureFlagNames.API_ACCESS]: 'Acesso à API',
};

// ============================================================================
// Calendar - Agenda
// ============================================================================

export const EventTypeLabels: Record<string, string> = {
  MEETING: 'Reunião',
  TASK: 'Tarefa',
  REMINDER: 'Lembrete',
  DEADLINE: 'Prazo',
  HOLIDAY: 'Feriado',
  BIRTHDAY: 'Aniversário',
  VACATION: 'Férias',
  ABSENCE: 'Ausência',
  FINANCE_DUE: 'Vencimento Financeiro',
  PURCHASE_ORDER: 'Pedido de Compra',
  CUSTOM: 'Personalizado',
};

export const EventVisibilityLabels: Record<string, string> = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
};

export const ParticipantStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  ACCEPTED: 'Aceito',
  DECLINED: 'Recusado',
  TENTATIVE: 'Talvez',
};

export const ParticipantRoleLabels: Record<string, string> = {
  OWNER: 'Organizador',
  ASSIGNEE: 'Responsável',
  GUEST: 'Convidado',
};
