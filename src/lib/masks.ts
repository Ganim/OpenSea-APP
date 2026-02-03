/**
 * OpenSea - Input Masks Utilities
 * Utilitários para aplicação de máscaras em campos de formulário
 */

/**
 * Máscaras predefinidas
 */
const PREDEFINED_MASKS: Record<string, string> = {
  cnpj: '99.999.999/9999-99',
  cpf: '999.999.999-99',
  phone: '(99) 99999-9999',
  phoneLandline: '(99) 9999-9999',
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
  const resolvedMask = PREDEFINED_MASKS[mask] || mask;
  const cleanValue = value.replace(/[^\dA-Za-z]/g, '');

  let result = '';
  let valueIndex = 0;

  for (let maskIndex = 0; maskIndex < resolvedMask.length; maskIndex++) {
    if (valueIndex >= cleanValue.length) break;

    const maskChar = resolvedMask[maskIndex];
    const valueChar = cleanValue[valueIndex];

    if (maskChar === '9') {
      if (/\d/.test(valueChar)) {
        result += valueChar;
        valueIndex++;
      } else {
        valueIndex++;
        maskIndex--;
      }
    } else if (maskChar === 'A') {
      if (/[A-Za-z]/.test(valueChar)) {
        result += valueChar.toUpperCase();
        valueIndex++;
      } else {
        valueIndex++;
        maskIndex--;
      }
    } else if (maskChar === '*') {
      if (/[A-Za-z\d]/.test(valueChar)) {
        result += valueChar.toUpperCase();
        valueIndex++;
      } else {
        valueIndex++;
        maskIndex--;
      }
    } else {
      result += maskChar;
    }
  }

  return result;
}

/**
 * Remove a formatação de uma máscara
 * @param value - Valor formatado
 * @returns Valor sem formatação (apenas dígitos/letras)
 */
export function removeMask(value: string): string {
  return value.replace(/[^\dA-Za-z]/g, '');
}

/**
 * Formata um CNPJ
 * @example formatCNPJ('12345678000190') => '12.345.678/0001-90'
 */
export function formatCNPJ(value: string): string {
  return applyMask(value, 'cnpj');
}

/**
 * Formata um CPF
 * @example formatCPF('12345678901') => '123.456.789-01'
 */
export function formatCPF(value: string): string {
  return applyMask(value, 'cpf');
}

/**
 * Formata um telefone brasileiro (detecta fixo ou celular)
 * @example formatPhone('11987654321') => '(11) 98765-4321'
 * @example formatPhone('1132165498') => '(11) 3216-5498'
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 10) {
    return applyMask(digits, 'phoneLandline');
  }
  return applyMask(digits, 'phone');
}

/**
 * Formata um CEP
 * @example formatCEP('01310100') => '01310-100'
 */
export function formatCEP(value: string): string {
  return applyMask(value, 'cep');
}

/**
 * Cria um handler de onChange que aplica máscara automaticamente
 * @param setter - Função setState para atualizar o valor
 * @param maskType - Tipo de máscara a aplicar
 * @returns Handler para usar em onChange
 */
export function createMaskedChangeHandler(
  setter: (value: string) => void,
  maskType: 'cnpj' | 'cpf' | 'phone' | 'cep' | string
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (maskType === 'phone') {
      setter(formatPhone(value));
    } else {
      setter(applyMask(value, maskType));
    }
  };
}
