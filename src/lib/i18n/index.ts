import { ptBR, type LocaleMessages } from './locales/pt-BR';

type Locale = 'pt-BR' | 'en';

const locales: Partial<Record<Locale, LocaleMessages>> & {
  'pt-BR': LocaleMessages;
} = {
  'pt-BR': ptBR,
  // 'en': en, // Future
};

let currentLocale: Locale = 'pt-BR';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Translate a message key with optional parameter interpolation.
 *
 * @example
 * t('validation.required', { field: 'Nome' }) // 'Nome é obrigatório'
 * t('form.errorsFound', { count: 3 }) // '3 erro(s) encontrado(s)'
 */
export function t(
  key: string,
  params?: Record<string, string | number>
): string {
  const messages = locales[currentLocale] ?? locales['pt-BR'];

  // Navigate nested keys: 'validation.required' → messages.validation.required
  const parts = key.split('.');
  let value: unknown = messages;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      // Key not found, return the key itself
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Interpolate parameters: '{field}' → actual value
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey] !== undefined
        ? String(params[paramKey])
        : `{${paramKey}}`;
    });
  }

  return value;
}

export type { Locale, LocaleMessages };
