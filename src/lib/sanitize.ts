/**
 * OpenSea - Sanitização de Dados para Logging
 * Remove informações sensíveis antes de logar
 *
 * Uso:
 * logger.debug('User data:', sanitizeForLogging(userData));
 */

const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'pwd',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'api_key',
  'secret',
  'clientSecret',
  'ssn',
  'cpf',
  'cnpj',
  'creditCard',
  'cardNumber',
  'cvv',
  'cvc',
  'pin',
  'email', // Pode ser sensível em alguns contextos
  'phone', // Pode ser sensível em alguns contextos
  'cellphone',
  'document',
  'rg',
  'passport',
  'bankAccount',
  'routingNumber',
];

/**
 * Sanitiza um objeto removendo dados sensíveis
 * @param obj - Objeto a sanitizar
 * @returns Objeto sanitizado
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();

  // Normalize: remove underscores and check both forms
  const normalizedKey = lowerKey.replace(/_/g, '');

  return SENSITIVE_KEYS.some(sensitiveKey => {
    const normalizedSensitive = sensitiveKey.toLowerCase().replace(/_/g, '');
    return (
      lowerKey.includes(sensitiveKey.toLowerCase()) ||
      normalizedKey.includes(normalizedSensitive)
    );
  });
}

export function sanitizeForLogging(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Verificar se a chave é sensível
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursivamente sanitizar objetos aninhados
      sanitized[key] = sanitizeForLogging(value);
    } else if (typeof value === 'string' && value.length > 100) {
      // Strings longas podem conter dados sensíveis
      sanitized[key] = `${value.substring(0, 50)}... [truncated]`;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitiza um erro removendo dados sensíveis da mensagem
 * @param error - Erro a sanitizar
 * @returns Mensagem sanitizada
 */
export function sanitizeErrorMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;

  // Remover padrões comuns de dados sensíveis
  const sanitized = message
    .replace(/password=\S+/gi, 'password=[REDACTED]')
    .replace(/token=\S+/gi, 'token=[REDACTED]')
    .replace(/api[_-]?key=\S+/gi, 'api_key=[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF REDACTED]') // CPF
    .replace(/\b\d{14}\b/g, '[CNPJ REDACTED]') // CNPJ
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD REDACTED]'); // Cartão

  return sanitized;
}

/**
 * Extrai apenas as chaves (sem valores sensíveis) de um objeto
 * Útil para logar que uma operação foi feita sem expor dados
 *
 * @example
 * logger.debug('User created', extractKeys(userData));
 * // Output: { firstName: true, lastName: true, email: true }
 */
export function extractKeys(obj: unknown): Record<string, boolean> {
  if (typeof obj !== 'object' || obj === null) {
    return {};
  }

  const keys: Record<string, boolean> = {};

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    keys[key] = true;
  }

  return keys;
}
