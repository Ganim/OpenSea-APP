/**
 * Users Module Constants Index
 * Exportações centralizadas de constantes
 */

// Constantes de status do usuário
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

export const USER_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
};
