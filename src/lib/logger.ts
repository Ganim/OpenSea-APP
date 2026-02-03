/**
 * OpenSea - Logger Centralizado
 * Sistema de logging seguro e estruturado para toda a aplicação
 * 
 * Uso:
 * logger.debug('Message', { data });
 * logger.info('Message', { data });
 * logger.warn('Message', { data });
 * logger.error('Message', error, { context });
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  /**
   * Log em nível DEBUG - apenas em desenvolvimento
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.isDev) return;

    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log em nível INFO - sempre
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log em nível WARN - sempre
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log em nível ERROR - sempre + enviar para Sentry em produção
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    const errorInfo = error
      ? {
          message: error.message,
          stack: this.isDev ? error.stack : undefined,
        }
      : undefined;

    this.log(LogLevel.ERROR, message, context, errorInfo);

    // Em produção, enviar para Sentry
    if (!this.isDev && typeof window !== 'undefined') {
      // Sentry.captureException(error, { extra: context });
      // TODO: Integrar com Sentry quando configurado
    }
  }

  /**
   * Log interno - não usar diretamente
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    errorInfo?: { message: string; stack?: string }
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(errorInfo && { error: errorInfo }),
    };

    // Em desenvolvimento, mostrar no console
    if (this.isDev) {
      const consoleMethod =
        level === LogLevel.ERROR
          ? 'error'
          : level === LogLevel.WARN
            ? 'warn'
            : 'log';

      const prefix = `[${entry.timestamp}] ${level}`;
      console[consoleMethod as 'log' | 'warn' | 'error'](
        prefix,
        message,
        context ? JSON.stringify(context, null, 2) : ''
      );

      if (errorInfo?.stack) {
        console.error(errorInfo.stack);
      }
    } else {
      // Em produção, formato compacto
      if (level === LogLevel.ERROR || level === LogLevel.WARN) {
        console[level === LogLevel.ERROR ? 'error' : 'warn'](entry);
      }
    }
  }
}

/**
 * Instância global do logger
 * Use: import { logger } from '@/lib/logger'
 */
export const logger = new Logger();
