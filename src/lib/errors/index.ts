/**
 * OpenSea OS - Error System
 *
 * Sistema centralizado de tratamento de erros.
 * Exporta todas as classes, tipos e funções relacionadas a erros.
 */

// API Error
export {
  ApiError,
  type ApiErrorType,
  type ApiErrorOptions,
  type ValidationFieldError,
} from './api-error';

// Error Messages
export {
  translateError,
  translateApiMessage,
  getDefaultMessage,
  addTranslation,
  addTranslations,
} from './error-messages';
