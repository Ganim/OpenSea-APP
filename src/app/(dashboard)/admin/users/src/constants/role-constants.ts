/**
 * Users Module Constants
 * Valores estáticos e mapeamentos
 */

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  USER: 'Usuário',
};

export const ROLE_BADGE_VARIANTS: Record<
  string,
  'destructive' | 'default' | 'secondary'
> = {
  ADMIN: 'destructive',
  MANAGER: 'default',
  USER: 'secondary',
};

export const ROLE_OPTIONS = [
  { value: 'USER', label: 'Usuário' },
  { value: 'MANAGER', label: 'Gerente' },
  { value: 'ADMIN', label: 'Administrador' },
];

/**
 * Obter label do papel
 */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Obter variante de badge do papel
 */
export function getRoleBadgeVariant(
  role: string
): 'destructive' | 'default' | 'secondary' {
  return ROLE_BADGE_VARIANTS[role] || 'secondary';
}
