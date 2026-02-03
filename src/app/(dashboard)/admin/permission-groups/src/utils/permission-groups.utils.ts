/**
 * Permission Groups Utils
 * Funções auxiliares para grupos de permissões
 */

import * as rbacService from '@/services/rbac/rbac.service';
import type { PermissionGroup } from '@/types/rbac';

// ============================================================================
// API CALLS
// ============================================================================

/**
 * Lista todos os grupos de permissões
 */
export async function listPermissionGroups(): Promise<PermissionGroup[]> {
  return await rbacService.listPermissionGroups();
}

/**
 * Busca um grupo específico por ID
 */
export async function getPermissionGroup(id: string): Promise<PermissionGroup> {
  return await rbacService.getPermissionGroupById(id);
}

/**
 * Cria um novo grupo de permissões
 */
export async function createPermissionGroup(
  data: Partial<PermissionGroup>
): Promise<PermissionGroup> {
  return await rbacService.createPermissionGroup({
    name: data.name || '',
    description: data.description,
    priority: data.priority,
    color: data.color || undefined,
    parentId: data.parentId || undefined,
  });
}

/**
 * Atualiza um grupo de permissões existente
 */
export async function updatePermissionGroup(
  id: string,
  data: Partial<PermissionGroup>
): Promise<PermissionGroup> {
  return await rbacService.updatePermissionGroup(id, {
    name: data.name,
    description: data.description,
    priority: data.priority,
    isActive: data.isActive,
    color: data.color || undefined,
    parentId: data.parentId || undefined,
  });
}

/**
 * Deleta um grupo de permissões
 */
export async function deletePermissionGroup(id: string): Promise<void> {
  await rbacService.deletePermissionGroup(id);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retorna o badge variant para o status do grupo
 */
export function getStatusBadgeVariant(
  isActive?: boolean
): 'default' | 'destructive' {
  return isActive ? 'default' : 'destructive';
}

/**
 * Retorna o label do status
 */
export function getStatusLabel(isActive?: boolean): string {
  return isActive ? 'Ativo' : 'Inativo';
}

/**
 * Retorna o badge variant para o tipo de grupo (Sistema/Custom)
 */
export function getTypeBadgeVariant(
  isSystem?: boolean
): 'secondary' | 'default' {
  return isSystem ? 'secondary' : 'default';
}

/**
 * Retorna o label do tipo
 */
export function getTypeLabel(isSystem?: boolean): string {
  return isSystem ? 'Sistema' : 'Custom';
}
