/**
 * OpenSea OS - Error Messages
 *
 * Mensagens de erro amigáveis em português para diferentes tipos de erro.
 * Centraliza a tradução de mensagens de erro da API.
 */

import { ApiError, type ApiErrorType } from './api-error';

/* ===========================================
   MESSAGE MAPS
   =========================================== */

/**
 * Mensagens padrão por tipo de erro
 */
const DEFAULT_MESSAGES: Record<ApiErrorType, string> = {
  VALIDATION: 'Os dados fornecidos são inválidos. Verifique os campos.',
  AUTHENTICATION: 'Sua sessão expirou. Por favor, faça login novamente.',
  AUTHORIZATION: 'Você não tem permissão para realizar esta ação.',
  NOT_FOUND: 'O recurso solicitado não foi encontrado.',
  CONFLICT: 'Este registro já existe ou há um conflito com dados existentes.',
  RATE_LIMIT: 'Muitas requisições. Por favor, aguarde um momento.',
  SERVER: 'Erro interno do servidor. Tente novamente mais tarde.',
  NETWORK: 'Erro de conexão. Verifique sua internet e tente novamente.',
  TIMEOUT: 'A requisição demorou muito. Tente novamente.',
  UNKNOWN: 'Ocorreu um erro inesperado. Tente novamente.',
};

/**
 * Tradução de mensagens específicas da API (inglês -> português)
 */
const API_MESSAGE_TRANSLATIONS: Record<string, string> = {
  // Autenticação
  'Invalid credentials': 'Credenciais inválidas',
  'Invalid email or password': 'E-mail ou senha inválidos',
  'User not found': 'Usuário não encontrado',
  'Invalid password': 'Senha inválida',
  'Password is incorrect': 'Senha incorreta',
  'Token expired': 'Token expirado',
  'Invalid token': 'Token inválido',
  'Session expired': 'Sessão expirada',
  Unauthorized: 'Não autorizado',
  Forbidden: 'Acesso negado',

  // Validação de senha
  'Password must be at least 8 characters':
    'A senha deve ter pelo menos 8 caracteres',
  'Password must contain at least one uppercase letter':
    'A senha deve conter pelo menos uma letra maiúscula',
  'Password must contain at least one lowercase letter':
    'A senha deve conter pelo menos uma letra minúscula',
  'Password must contain at least one number':
    'A senha deve conter pelo menos um número',
  'Password must contain at least one special character':
    'A senha deve conter pelo menos um caractere especial',
  'Passwords do not match': 'As senhas não coincidem',
  'Password reset is required': 'É necessário redefinir sua senha',

  // Validação geral
  'Field is required': 'Este campo é obrigatório',
  'Invalid email': 'E-mail inválido',
  'Invalid email format': 'Formato de e-mail inválido',
  'Email already exists': 'Este e-mail já está em uso',
  'Email already in use': 'Este e-mail já está em uso',
  'Username already exists': 'Este nome de usuário já está em uso',
  'Invalid CNPJ': 'CNPJ inválido',
  'Invalid CPF': 'CPF inválido',
  'CNPJ already exists': 'Este CNPJ já está cadastrado',
  'CPF already exists': 'Este CPF já está cadastrado',

  // Recursos
  'Resource not found': 'Recurso não encontrado',
  'Company not found': 'Empresa não encontrada',
  'Department not found': 'Departamento não encontrado',
  'Position not found': 'Cargo não encontrado',
  'Employee not found': 'Funcionário não encontrado',
  'Permission group not found': 'Grupo de permissões não encontrado',

  // Operações
  'Cannot delete': 'Não é possível excluir',
  'Cannot update': 'Não é possível atualizar',
  'Operation not allowed': 'Operação não permitida',
  'Duplicate entry': 'Registro duplicado',

  // Servidor
  'Internal server error': 'Erro interno do servidor',
  'Service unavailable': 'Serviço indisponível',
  'Too many requests': 'Muitas requisições, tente novamente mais tarde',
  'Request timeout': 'Tempo limite excedido',
  'Bad gateway': 'Erro de comunicação com o servidor',
};

/* ===========================================
   TRANSLATION FUNCTIONS
   =========================================== */

/**
 * Traduz uma mensagem de erro da API para português
 */
export function translateApiMessage(message: string): string {
  // Verifica tradução exata
  if (API_MESSAGE_TRANSLATIONS[message]) {
    return API_MESSAGE_TRANSLATIONS[message];
  }

  // Verifica tradução case-insensitive
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(API_MESSAGE_TRANSLATIONS)) {
    if (key.toLowerCase() === lowerMessage) {
      return value;
    }
  }

  // Verifica se contém alguma substring conhecida
  for (const [key, value] of Object.entries(API_MESSAGE_TRANSLATIONS)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Retorna a mensagem original se não houver tradução
  return message;
}

/**
 * Obtém a mensagem padrão para um tipo de erro
 */
export function getDefaultMessage(type: ApiErrorType): string {
  return DEFAULT_MESSAGES[type] || DEFAULT_MESSAGES.UNKNOWN;
}

/**
 * Traduz um erro para uma mensagem amigável em português
 *
 * @example
 * ```tsx
 * try {
 *   await api.login(credentials);
 * } catch (error) {
 *   toast.error(translateError(error));
 * }
 * ```
 */
export function translateError(error: unknown): string {
  // ApiError com mensagem
  if (error instanceof ApiError) {
    // Se tem mensagem específica, traduz ela
    if (error.message && error.message !== 'Ocorreu um erro inesperado') {
      return translateApiMessage(error.message);
    }
    // Senão, usa mensagem padrão do tipo
    return getDefaultMessage(error.type);
  }

  // Error padrão
  if (error instanceof Error) {
    // Erro de rede
    if (ApiError.isNetworkError(error)) {
      return getDefaultMessage('NETWORK');
    }
    // Erro de timeout
    if (ApiError.isTimeoutError(error)) {
      return getDefaultMessage('TIMEOUT');
    }
    // Traduz a mensagem
    return translateApiMessage(error.message);
  }

  // String direta
  if (typeof error === 'string') {
    return translateApiMessage(error);
  }

  // Objeto com message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return translateApiMessage(message);
    }
  }

  // Fallback
  return getDefaultMessage('UNKNOWN');
}

/**
 * Adiciona uma nova tradução dinamicamente
 * Útil para adicionar traduções específicas de módulos
 */
export function addTranslation(key: string, value: string): void {
  API_MESSAGE_TRANSLATIONS[key] = value;
}

/**
 * Adiciona múltiplas traduções de uma vez
 */
export function addTranslations(translations: Record<string, string>): void {
  Object.assign(API_MESSAGE_TRANSLATIONS, translations);
}

export default translateError;
