/**
 * Position CRUD Operations
 * Funções isoladas para operações de CRUD no módulo de cargos
 */

import { logger } from '@/lib/logger';
import type { Position } from '@/types/hr';
import { positionsApi } from '../api';

/**
 * Criar novo cargo
 */
export async function createPosition(
  data: Partial<Position>
): Promise<Position> {
  const createData = {
    name: data.name ?? '',
    code: data.code ?? '',
    description: data.description,
    departmentId: data.departmentId,
    level: data.level ?? 1,
    minSalary: data.minSalary,
    maxSalary: data.maxSalary,
    isActive: data.isActive ?? true,
  };
  return positionsApi.create(createData as any);
}

/**
 * Atualizar cargo existente
 * Limpa campos null/undefined antes de enviar
 */
export async function updatePosition(
  id: string,
  data: Partial<Position>
): Promise<Position> {
  const cleanData: Partial<Position> = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
  );
  return positionsApi.update(id, cleanData as any);
}

/**
 * Deletar cargo
 */
export async function deletePosition(id: string): Promise<void> {
  return positionsApi.delete(id);
}

/**
 * Duplicar cargo existente
 * Busca o cargo original e cria uma cópia com os dados
 */
export async function duplicatePosition(
  id: string,
  data?: Partial<Position>
): Promise<Position> {
  // Buscar cargo original
  const original = await positionsApi.get(id);

  // Construir objeto de duplicação
  const duplicateData = {
    name: data?.name || `${original.name} (cópia)`,
    code: data?.code || `${original.code}_COPY`,
    description: original.description,
    departmentId: original.departmentId,
    level: original.level,
    minSalary: original.minSalary,
    maxSalary: original.maxSalary,
    isActive: original.isActive,
  };

  try {
    return positionsApi.create(duplicateData as any);
  } catch (error) {
    logger.error(
      '[Positions] Duplication failed',
      error instanceof Error ? error : undefined,
      { originalId: id }
    );
    throw error;
  }
}
