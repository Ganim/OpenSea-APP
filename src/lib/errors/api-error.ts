/**
 * OpenSea OS - API Error System
 *
 * Sistema robusto de tratamento de erros de API com tipagem forte,
 * classificação automática de erros e mensagens amigáveis.
 */

/* ===========================================
   TYPES
   =========================================== */

/**
 * Tipos de erro de API
 * Cada tipo representa uma categoria de erro com comportamento específico
 */
export type ApiErrorType =
  | 'VALIDATION' // 400 - Dados inválidos
  | 'AUTHENTICATION' // 401 - Não autenticado
  | 'AUTHORIZATION' // 403 - Sem permissão
  | 'NOT_FOUND' // 404 - Recurso não encontrado
  | 'CONFLICT' // 409 - Conflito (duplicado, etc)
  | 'RATE_LIMIT' // 429 - Muitas requisições
  | 'SERVER' // 5xx - Erro no servidor
  | 'NETWORK' // Falha de conexão
  | 'TIMEOUT' // Timeout
  | 'UNKNOWN'; // Erro desconhecido

/**
 * Detalhes de validação de campo
 */
export interface ValidationFieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Opções para criar um ApiError
 */
export interface ApiErrorOptions {
  /** Mensagem de erro legível */
  message: string;
  /** Tipo/categoria do erro */
  type: ApiErrorType;
  /** Status HTTP */
  status: number;
  /** Código de erro da API (ex: USER_NOT_FOUND) */
  code?: string;
  /** Detalhes adicionais */
  details?: Record<string, unknown>;
  /** Erros de validação por campo */
  fieldErrors?: ValidationFieldError[];
  /** Erro original que causou este */
  originalError?: Error;
}

/* ===========================================
   API ERROR CLASS
   =========================================== */

/**
 * Classe de erro de API com tipagem forte
 *
 * Fornece informações estruturadas sobre erros de API,
 * permitindo tratamento específico por tipo de erro.
 *
 * @example
 * ```tsx
 * try {
 *   await api.createUser(data);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     if (error.type === 'VALIDATION') {
 *       // Mostrar erros de validação
 *       error.fieldErrors?.forEach(fe => {
 *         form.setError(fe.field, { message: fe.message });
 *       });
 *     } else if (error.type === 'CONFLICT') {
 *       // Usuário já existe
 *       toast.error('Este e-mail já está em uso');
 *     }
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  /** Tipo/categoria do erro */
  readonly type: ApiErrorType;

  /** Status HTTP do erro */
  readonly status: number;

  /** Código de erro da API */
  readonly code?: string;

  /** Detalhes adicionais do erro */
  readonly details?: Record<string, unknown>;

  /** Erros de validação por campo */
  readonly fieldErrors?: ValidationFieldError[];

  /** Erro original que causou este */
  readonly originalError?: Error;

  /** Timestamp de quando o erro ocorreu */
  readonly timestamp: Date;

  constructor(options: ApiErrorOptions) {
    super(options.message);

    // Nome da classe para instanceof funcionar corretamente
    this.name = 'ApiError';

    // Propriedades do erro
    this.type = options.type;
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.fieldErrors = options.fieldErrors;
    this.originalError = options.originalError;
    this.timestamp = new Date();

    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /* ===========================================
     STATIC FACTORY METHODS
     =========================================== */

  /**
   * Cria um ApiError a partir de uma resposta HTTP
   */
  static fromResponse(response: Response, data?: unknown): ApiError {
    const errorData = data as Record<string, unknown> | undefined;

    const type = ApiError.getTypeFromStatus(response.status);

    // Extrai mensagem de diferentes formatos de resposta
    const message = ApiError.extractMessage(errorData, response);

    // Extrai erros de validação se houver
    const fieldErrors = ApiError.extractFieldErrors(errorData);

    return new ApiError({
      message,
      type,
      status: response.status,
      code: errorData?.code as string | undefined,
      details: errorData,
      fieldErrors,
    });
  }

  /**
   * Cria um ApiError de rede (falha de conexão)
   */
  static networkError(originalError?: Error): ApiError {
    return new ApiError({
      message: 'Falha na conexão com o servidor',
      type: 'NETWORK',
      status: 0,
      originalError,
    });
  }

  /**
   * Cria um ApiError de timeout
   */
  static timeoutError(originalError?: Error): ApiError {
    return new ApiError({
      message: 'A requisição demorou muito para responder',
      type: 'TIMEOUT',
      status: 0,
      originalError,
    });
  }

  /**
   * Cria um ApiError genérico
   */
  static unknown(message?: string, originalError?: Error): ApiError {
    return new ApiError({
      message: message || 'Ocorreu um erro inesperado',
      type: 'UNKNOWN',
      status: 0,
      originalError,
    });
  }

  /* ===========================================
     STATIC HELPER METHODS
     =========================================== */

  /**
   * Determina o tipo de erro baseado no status HTTP
   */
  static getTypeFromStatus(status: number): ApiErrorType {
    if (status === 400) return 'VALIDATION';
    if (status === 401) return 'AUTHENTICATION';
    if (status === 403) return 'AUTHORIZATION';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    if (status === 429) return 'RATE_LIMIT';
    if (status >= 500) return 'SERVER';
    return 'UNKNOWN';
  }

  /**
   * Verifica se é um erro de rede
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message === 'Failed to fetch' ||
        error.name === 'AbortError' ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed')
      );
    }
    return false;
  }

  /**
   * Verifica se é um erro de timeout
   */
  static isTimeoutError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('Timeout')
      );
    }
    return false;
  }

  /**
   * Converte qualquer erro para ApiError
   */
  static from(error: unknown): ApiError {
    // Já é um ApiError
    if (error instanceof ApiError) {
      return error;
    }

    // É um Error padrão
    if (error instanceof Error) {
      // Erro de rede
      if (ApiError.isNetworkError(error)) {
        return ApiError.networkError(error);
      }

      // Erro de timeout
      if (ApiError.isTimeoutError(error)) {
        return ApiError.timeoutError(error);
      }

      // Erro com informações de status (do apiClient)
      const errorWithStatus = error as Error & {
        status?: number;
        data?: Record<string, unknown>;
        code?: string;
      };

      if (errorWithStatus.status) {
        return new ApiError({
          message: error.message,
          type: ApiError.getTypeFromStatus(errorWithStatus.status),
          status: errorWithStatus.status,
          code: errorWithStatus.code,
          details: errorWithStatus.data,
          originalError: error,
        });
      }

      // Erro genérico
      return ApiError.unknown(error.message, error);
    }

    // Tipo desconhecido
    return ApiError.unknown();
  }

  /**
   * Extrai mensagem de erro de diferentes formatos de resposta
   */
  private static extractMessage(
    data: Record<string, unknown> | undefined,
    response: Response
  ): string {
    if (!data) {
      return response.statusText || 'Ocorreu um erro inesperado';
    }

    // Tenta diferentes campos comuns de mensagem de erro
    const message =
      (typeof data.message === 'string' ? data.message : null) ||
      (typeof data.error === 'string' ? data.error : null) ||
      (typeof data.detail === 'string' ? data.detail : null) ||
      (typeof data.details === 'string' ? data.details : null);

    if (message) {
      return message;
    }

    // Se message é um objeto (erros de validação)
    if (typeof data.message === 'object' && data.message !== null) {
      const messageObj = data.message as Record<string, string[]>;
      const firstField = Object.keys(messageObj)[0];
      if (firstField && Array.isArray(messageObj[firstField])) {
        return messageObj[firstField][0];
      }
    }

    return response.statusText || 'Ocorreu um erro inesperado';
  }

  /**
   * Extrai erros de validação por campo
   */
  private static extractFieldErrors(
    data: Record<string, unknown> | undefined
  ): ValidationFieldError[] | undefined {
    if (!data) return undefined;

    // Formato: { errors: [{ field: 'email', message: '...' }] }
    if (Array.isArray(data.errors)) {
      return data.errors
        .filter(
          (e): e is { field: string; message: string } =>
            typeof e === 'object' &&
            e !== null &&
            'field' in e &&
            'message' in e
        )
        .map(e => ({
          field: e.field,
          message: e.message,
          code: (e as { code?: string }).code,
        }));
    }

    // Formato: { message: { email: ['erro1', 'erro2'], name: ['erro'] } }
    if (typeof data.message === 'object' && data.message !== null) {
      const messageObj = data.message as Record<string, string[]>;
      const errors: ValidationFieldError[] = [];

      for (const [field, messages] of Object.entries(messageObj)) {
        if (Array.isArray(messages)) {
          messages.forEach(msg => {
            errors.push({ field, message: msg });
          });
        }
      }

      return errors.length > 0 ? errors : undefined;
    }

    // Formato: { fieldErrors: { email: 'erro', name: 'erro' } }
    if (typeof data.fieldErrors === 'object' && data.fieldErrors !== null) {
      const fieldErrorsObj = data.fieldErrors as Record<string, string>;
      return Object.entries(fieldErrorsObj).map(([field, message]) => ({
        field,
        message,
      }));
    }

    return undefined;
  }

  /* ===========================================
     INSTANCE METHODS
     =========================================== */

  /**
   * Verifica se o erro é de um tipo específico
   */
  isType(type: ApiErrorType): boolean {
    return this.type === type;
  }

  /**
   * Verifica se é um erro de validação
   */
  isValidationError(): boolean {
    return this.type === 'VALIDATION';
  }

  /**
   * Verifica se é um erro de autenticação
   */
  isAuthenticationError(): boolean {
    return this.type === 'AUTHENTICATION';
  }

  /**
   * Verifica se é um erro de autorização
   */
  isAuthorizationError(): boolean {
    return this.type === 'AUTHORIZATION';
  }

  /**
   * Verifica se é um erro recuperável (pode tentar novamente)
   */
  isRetryable(): boolean {
    return ['NETWORK', 'TIMEOUT', 'SERVER', 'RATE_LIMIT'].includes(this.type);
  }

  /**
   * Obtém o erro de um campo específico
   */
  getFieldError(field: string): string | undefined {
    return this.fieldErrors?.find(e => e.field === field)?.message;
  }

  /**
   * Converte para objeto JSON serializável
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      status: this.status,
      code: this.code,
      details: this.details,
      fieldErrors: this.fieldErrors,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export default ApiError;
