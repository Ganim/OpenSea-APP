/**
 * OpenSea OS - Input Masks
 * Utilitários para aplicação de máscaras em campos de formulário
 */

/**
 * Máscaras predefinidas
 */
const PREDEFINED_MASKS: Record<string, string> = {
  cnpj: '99.999.999/9999-99',
  cpf: '999.999.999-99',
  phone: '(99) 99999-9999',
  cep: '99999-999',
  date: '99/99/9999',
};

/**
 * Aplica uma máscara a um valor
 * @param value - Valor a ser formatado
 * @param mask - Máscara a ser aplicada ('9' = dígito, 'A' = letra, '*' = alfanumérico)
 * @returns Valor formatado
 */
export function applyMask(value: string, mask: string): string {
  // Resolve máscara predefinida
  const resolvedMask = PREDEFINED_MASKS[mask] || mask;

  // Remove caracteres não permitidos do valor
  const cleanValue = value.replace(/[^\dA-Za-z]/g, '');

  let result = '';
  let valueIndex = 0;

  for (let maskIndex = 0; maskIndex < resolvedMask.length; maskIndex++) {
    if (valueIndex >= cleanValue.length) break;

    const maskChar = resolvedMask[maskIndex];
    const valueChar = cleanValue[valueIndex];

    if (maskChar === '9') {
      // Apenas dígitos
      if (/\d/.test(valueChar)) {
        result += valueChar;
        valueIndex++;
      } else {
        // Pula caracteres não numéricos
        valueIndex++;
        maskIndex--; // Tenta novamente com próximo caractere
      }
    } else if (maskChar === 'A') {
      // Apenas letras
      if (/[A-Za-z]/.test(valueChar)) {
        result += valueChar.toUpperCase();
        valueIndex++;
      } else {
        valueIndex++;
        maskIndex--;
      }
    } else if (maskChar === '*') {
      // Alfanumérico
      if (/[A-Za-z\d]/.test(valueChar)) {
        result += valueChar.toUpperCase();
        valueIndex++;
      } else {
        valueIndex++;
        maskIndex--;
      }
    } else {
      // Caractere literal da máscara (., -, /, etc.)
      result += maskChar;
    }
  }

  return result;
}

/**
 * Remove a formatação de uma máscara, retornando apenas os caracteres válidos
 * @param value - Valor formatado
 * @param mask - Máscara aplicada
 * @returns Valor sem formatação
 */
export function removeMask(value: string, mask: string): string {
  const resolvedMask = PREDEFINED_MASKS[mask] || mask;

  // Identifica quais caracteres são "literais" da máscara
  const maskLiterals = new Set<string>();
  for (const char of resolvedMask) {
    if (char !== '9' && char !== 'A' && char !== '*') {
      maskLiterals.add(char);
    }
  }

  // Remove os caracteres literais do valor
  let result = value;
  for (const literal of maskLiterals) {
    result = result.split(literal).join('');
  }

  return result;
}

/**
 * Verifica se uma máscara é predefinida
 */
export function isPredefinedMask(mask: string): boolean {
  return mask in PREDEFINED_MASKS;
}

/**
 * Retorna o comprimento máximo do valor após aplicar a máscara
 */
export function getMaskMaxLength(mask: string): number {
  const resolvedMask = PREDEFINED_MASKS[mask] || mask;
  return resolvedMask.length;
}

/**
 * Formata um telefone brasileiro (aceita 10 ou 11 dígitos)
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return applyMask(digits, '(99) 9999-9999');
  } else {
    // Celular: (XX) XXXXX-XXXX
    return applyMask(digits, '(99) 99999-9999');
  }
}

/**
 * Aplica máscara inteligente baseada no tipo
 */
export function applySmartMask(value: string, mask: string): string {
  // Telefone tem tratamento especial (10 ou 11 dígitos)
  if (mask === 'phone') {
    return formatPhone(value);
  }

  return applyMask(value, mask);
}
