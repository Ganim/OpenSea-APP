/**
 * Employee Utilities
 * Funções utilitárias para funcionários
 */

import type { ContractType, Employee, WorkRegime } from '@/types/hr';

/**
 * Formata a data de criação/atualização
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Obtém o label do tipo de contrato
 */
export function getContractTypeLabel(contractType: ContractType): string {
  const labels: Record<ContractType, string> = {
    CLT: 'CLT',
    PJ: 'Pessoa Jurídica',
    INTERN: 'Estagiário',
    TEMPORARY: 'Temporário',
    APPRENTICE: 'Aprendiz',
  };
  return labels[contractType] || contractType;
}

/**
 * Obtém o label do regime de trabalho
 */
export function getWorkRegimeLabel(workRegime: WorkRegime): string {
  const labels: Record<WorkRegime, string> = {
    FULL_TIME: 'Tempo Integral',
    PART_TIME: 'Meio Período',
    HOURLY: 'Por Hora',
    SHIFT: 'Turnos',
    FLEXIBLE: 'Flexível',
  };
  return labels[workRegime] || workRegime;
}

/**
 * Formata salário
 */
export function formatSalary(salary: number | null | undefined): string {
  if (!salary) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(salary);
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '-';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Calcula tempo de empresa
 */
export function getCompanyTime(hireDate: string): string {
  const hire = new Date(hireDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - hire.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);

  if (years > 0) {
    return months > 0 ? `${years} anos e ${months} meses` : `${years} anos`;
  }
  if (months > 0) {
    return `${months} meses`;
  }
  return `${diffDays} dias`;
}

/**
 * Obtém o label do status do funcionário
 */
export function getStatusLabel(status?: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    ON_LEAVE: 'Em Licença',
    TERMINATED: 'Desligado',
  };
  return labels[status || ''] || status || 'Não definido';
}
