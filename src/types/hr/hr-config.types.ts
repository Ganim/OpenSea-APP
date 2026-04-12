/**
 * HR Config Types
 * Tipos para configuração geral do módulo de RH
 */

export interface HrTenantConfig {
  id: string;
  tenantId: string;

  // Empresa Cidadã
  empresaCidadaEnabled: boolean;
  maternityLeaveDays: number;
  paternityLeaveDays: number;

  // Contribuição Sindical
  unionContributionEnabled: boolean;
  unionContributionRate: number | null;

  // PAT
  patEnabled: boolean;
  patMonthlyValuePerEmployee: number | null;

  // Banco de Horas
  timeBankIndividualMonths: number;
  timeBankCollectiveMonths: number;

  // Contribuição Patronal
  ratPercent: number;
  fapFactor: number;
  terceirosPercent: number;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateHrTenantConfigData {
  empresaCidadaEnabled?: boolean;
  maternityLeaveDays?: number;
  paternityLeaveDays?: number;
  unionContributionEnabled?: boolean;
  unionContributionRate?: number | null;
  patEnabled?: boolean;
  patMonthlyValuePerEmployee?: number | null;
  timeBankIndividualMonths?: number;
  timeBankCollectiveMonths?: number;
  ratPercent?: number;
  fapFactor?: number;
  terceirosPercent?: number;
}
