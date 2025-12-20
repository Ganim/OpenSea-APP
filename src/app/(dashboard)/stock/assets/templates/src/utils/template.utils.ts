/**
 * Template Utils
 * Funções utilitárias para operações com templates
 */

import type { Template } from '@/types/stock';

/**
 * Calcula o número total de atributos definidos em um template
 * @param template - Template para contar atributos
 * @returns Número total de atributos
 */
export function countTemplateAttributes(template: Template): number {
  return (
    (Object.keys(template.productAttributes || {}).length || 0) +
    (Object.keys(template.variantAttributes || {}).length || 0) +
    (Object.keys(template.itemAttributes || {}).length || 0)
  );
}

/**
 * Verifica se um template tem dados de cuidados especiais
 * @param template - Template para verificar
 * @returns true se tem dados de cuidados
 */
export function hasCareInstructions(template: Template): boolean {
  return (
    template.careInstructions !== null &&
    template.careInstructions !== undefined &&
    Object.keys(template.careInstructions).length > 0
  );
}

/**
 * Formata informações do template para exibição
 * @param template - Template a formatar
 * @returns Objeto com informações formatadas
 */
export function formatTemplateInfo(template: Template) {
  const attributesCount = countTemplateAttributes(template);
  const hasCare = hasCareInstructions(template);

  return {
    attributesCount,
    hasCareInstructions: hasCare,
    subtitle: `${attributesCount} atributos definidos${hasCare ? ' com cuidados' : ''}`,
  };
}

/**
 * Limpa dados null/undefined antes de enviar ao servidor
 * @param data - Dados a limpar
 * @returns Dados limpos
 */
export function cleanTemplateData<T extends Record<string, unknown>>(
  data: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}

/**
 * Valida se um template tem dados mínimos necessários
 * @param template - Template a validar
 * @returns true se é válido
 */
export function isValidTemplate(template: Template): boolean {
  return !!(
    template.id &&
    template.name &&
    template.name.trim().length > 0 &&
    template.unitOfMeasure
  );
}
