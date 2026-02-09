/**
 * Department CRUD Operations
 * Funções isoladas para operações de CRUD no módulo de departamentos
 */

import { logger } from '@/lib/logger';
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@/services/hr/departments.service';
import type { Department } from '@/types/hr';
import { departmentsApi } from '../api';

/**
 * Criar novo departamento
 */
export async function createDepartment(
  data: Partial<Department>
): Promise<Department> {
  const createData: CreateDepartmentRequest = {
    name: data.name ?? '',
    code: data.code ?? '',
    companyId: data.companyId ?? '',
    description: data.description ?? undefined,
    parentId: data.parentId,
    managerId: data.managerId,
    isActive: data.isActive ?? true,
  };
  return departmentsApi.create(createData);
}

/**
 * Atualizar departamento existente
 * Limpa campos null/undefined antes de enviar
 */
export async function updateDepartment(
  id: string,
  data: Partial<Department>
): Promise<Department> {
  const cleanData: UpdateDepartmentRequest = {};

  if (data.name !== undefined && data.name !== null) cleanData.name = data.name;
  if (data.code !== undefined && data.code !== null) cleanData.code = data.code;
  if (data.companyId !== undefined && data.companyId !== null)
    cleanData.companyId = data.companyId;
  if (data.description !== undefined)
    cleanData.description = data.description ?? undefined;
  if (data.parentId !== undefined) cleanData.parentId = data.parentId;
  if (data.managerId !== undefined) cleanData.managerId = data.managerId;
  if (data.isActive !== undefined && data.isActive !== null)
    cleanData.isActive = data.isActive;

  return departmentsApi.update(id, cleanData);
}

/**
 * Deletar departamento
 */
export async function deleteDepartment(id: string): Promise<void> {
  return departmentsApi.delete(id);
}

/**
 * Duplicar departamento existente
 * Busca o departamento original e cria uma cópia com os dados
 */
export async function duplicateDepartment(
  id: string,
  data?: Partial<Department>
): Promise<Department> {
  // Buscar departamento original
  const original = await departmentsApi.get(id);

  // Construir objeto de duplicação
  const duplicateData: CreateDepartmentRequest = {
    name: data?.name || `${original.name} (cópia)`,
    code: data?.code || `${original.code}_COPY`,
    companyId: original.companyId,
    description: original.description ?? undefined,
    parentId: original.parentId,
    managerId: original.managerId,
    isActive: original.isActive,
  };

  try {
    return departmentsApi.create(duplicateData);
  } catch (error) {
    logger.error(
      '[Departments] Duplication failed',
      error instanceof Error ? error : undefined,
      { originalId: id }
    );
    throw error;
  }
}
