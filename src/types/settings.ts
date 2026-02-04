/**
 * OpenSea OS - Settings Types
 * Tipos específicos para campos de settings em vez de Record<string, unknown>
 */

// =====================================
// TENANT SETTINGS
// =====================================

export interface TenantSettings {
  /** Configurações de marca */
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };

  /** Configurações de notificações */
  notifications?: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
  };

  /** Configurações de funcionalidades */
  features?: {
    inventoryEnabled?: boolean;
    salesEnabled?: boolean;
    hrEnabled?: boolean;
    payrollEnabled?: boolean;
    reportsEnabled?: boolean;
  };

  /** Configurações de segurança */
  security?: {
    passwordMinLength?: number;
    passwordRequireUppercase?: boolean;
    passwordRequireNumbers?: boolean;
    passwordRequireSpecialChars?: boolean;
    sessionTimeoutMinutes?: number;
    twoFactorRequired?: boolean;
  };

  /** Configurações de estoque */
  inventory?: {
    lowStockThreshold?: number;
    autoReorderEnabled?: boolean;
    allowNegativeStock?: boolean;
  };

  /** Configurações de localização */
  locale?: {
    language?: string;
    timezone?: string;
    currency?: string;
    dateFormat?: string;
  };
}

// =====================================
// USER SETTINGS
// =====================================

export interface UserSettings {
  /** Preferências de tema */
  theme?: {
    mode?: 'light' | 'dark' | 'system';
    accentColor?: string;
  };

  /** Preferências de notificação */
  notifications?: {
    email?: boolean;
    desktop?: boolean;
    sound?: boolean;
  };

  /** Preferências de idioma */
  language?: string;

  /** Preferências de dashboard */
  dashboard?: {
    defaultView?: string;
    widgets?: string[];
  };
}

// =====================================
// COMPANY SETTINGS
// =====================================

export interface CompanySettings {
  /** Configurações fiscais */
  tax?: {
    regime?: 'SIMPLES' | 'PRESUMIDO' | 'REAL';
    taxId?: string;
    stateRegistration?: string;
    municipalRegistration?: string;
  };

  /** Configurações de endereço */
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  /** Configurações de contato */
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

// =====================================
// PLAN SETTINGS
// =====================================

export interface PlanSettings {
  /** Limites de recursos */
  limits?: {
    maxUsers?: number;
    maxWarehouses?: number;
    maxProducts?: number;
    maxStorageGB?: number;
    maxApiCallsPerDay?: number;
  };

  /** Funcionalidades incluídas */
  features?: {
    advancedReports?: boolean;
    apiAccess?: boolean;
    prioritySupport?: boolean;
    customIntegrations?: boolean;
  };
}

// =====================================
// FEATURE FLAG METADATA
// =====================================

export interface FeatureFlagMetadata {
  /** Descrição da feature */
  description?: string;

  /** Data de ativação planejada */
  scheduledActivation?: string;

  /** Porcentagem de rollout */
  rolloutPercentage?: number;

  /** Tenants de teste */
  betaTenants?: string[];
}
