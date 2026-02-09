/**
 * Template CRUD Operations
 * Funções isoladas para operações de CRUD no módulo de templates
 */

import { templatesService } from '@/services/stock';
import { logger } from '@/lib/logger';
import type { Template } from '@/types/stock';

/**
 * Criar novo template
 */
export async function createTemplate(
  data: Partial<Template>
): Promise<Template> {
  const createData = {
    name: data.name ?? '',
    unitOfMeasure: data.unitOfMeasure ?? 'UNITS',
    productAttributes: data.productAttributes,
    variantAttributes: data.variantAttributes,
    itemAttributes: data.itemAttributes,
    careInstructions: data.careInstructions,
  };
  return templatesService.createTemplate(createData).then(r => r.template);
}

/**
 * Atualizar template existente
 * Limpa campos null/undefined antes de enviar
 */
export async function updateTemplate(
  id: string,
  data: Partial<Template>
): Promise<Template> {
  const cleanData: Partial<Template> = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
  );
  return templatesService.updateTemplate(id, cleanData).then(r => r.template);
}

/**
 * Deletar template
 */
export async function deleteTemplate(id: string): Promise<void> {
  return templatesService.deleteTemplate(id);
}

/**
 * Duplicar template existente
 * Busca o template original e cria uma cópia com os dados
 */
export async function duplicateTemplate(
  id: string,
  data?: Partial<Template>
): Promise<Template> {
  // Buscar template original
  const original = await templatesService.getTemplate(id).then(r => r.template);

  // Construir objeto de duplicação apenas com campos definidos
  const duplicateData: Record<string, unknown> = {
    name: data?.name || `${original.name} (cópia)`,
    unitOfMeasure: original.unitOfMeasure,
  };

  // Adicionar campos opcionais apenas se existirem e não forem vazios
  if (
    original.productAttributes &&
    Object.keys(original.productAttributes).length > 0
  ) {
    duplicateData.productAttributes = original.productAttributes;
  }
  if (
    original.variantAttributes &&
    Object.keys(original.variantAttributes).length > 0
  ) {
    duplicateData.variantAttributes = original.variantAttributes;
  }
  if (
    original.itemAttributes &&
    Object.keys(original.itemAttributes).length > 0
  ) {
    duplicateData.itemAttributes = original.itemAttributes;
  }
  if (original.careInstructions) {
    duplicateData.careInstructions = original.careInstructions;
  }

  try {
    const result = await templatesService.createTemplate(
      duplicateData as unknown as Parameters<
        typeof templatesService.createTemplate
      >[0]
    );
    return result.template;
  } catch (error) {
    logger.error(
      '[Templates] Duplication failed',
      error instanceof Error ? error : undefined,
      {
        originalId: id,
      }
    );
    throw error;
  }
}
