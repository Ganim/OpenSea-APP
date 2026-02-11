'use client';

import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Lock,
  Network,
  RefreshCw,
  Search,
  Server,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { ErrorType, GridErrorProps } from './types/grid-error.types';

/**
 * Componente GridError
 *
 * Renderiza um card de erro com mensagens, ações e detalhes.
 * Suporta diferentes tipos de erro com ícones e títulos pré-definidos.
 *
 * @example
 * <GridError
 *   type="server"
 *   message="Falha ao carregar os dados"
 *   action={{
 *     label: "Tentar Novamente",
 *     onClick: () => refetch()
 *   }}
 * />
 */
export function GridError({
  type = 'generic',
  title,
  message,
  icon: CustomIcon,
  action,
  actions = [],
  errorCode,
  className,
  cardClassName,
  iconClassName,
  details,
  showDetails = false,
}: GridErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(showDetails);

  // Configurações padrão por tipo de erro
  const errorConfig: Record<
    ErrorType,
    {
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      message: string;
      color: string;
    }
  > = {
    connection: {
      icon: Network,
      title: 'Erro de Conexão',
      message:
        'Não foi possível conectar ao servidor. Verifique sua conexão de internet.',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    'not-found': {
      icon: Search,
      title: 'Não Encontrado',
      message: 'Os dados que você procura não foram encontrados.',
      color: 'text-blue-600 dark:text-blue-400',
    },
    unauthorized: {
      icon: Lock,
      title: 'Não Autorizado',
      message:
        'Você não tem permissão para acessar este recurso. Faça login novamente.',
      color: 'text-orange-600 dark:text-orange-400',
    },
    forbidden: {
      icon: Lock,
      title: 'Acesso Proibido',
      message: 'Você não tem permissão para acessar este recurso.',
      color: 'text-red-600 dark:text-red-400',
    },
    server: {
      icon: Server,
      title: 'Erro no Servidor',
      message:
        'O servidor encontrou um erro ao processar sua solicitação. Tente novamente mais tarde.',
      color: 'text-red-600 dark:text-red-400',
    },
    validation: {
      icon: AlertTriangle,
      title: 'Erro de Validação',
      message: 'Os dados fornecidos contêm erros. Verifique e tente novamente.',
      color: 'text-orange-600 dark:text-orange-400',
    },
    generic: {
      icon: AlertCircle,
      title: 'Erro ao Carregar',
      message: 'Ocorreu um erro ao carregar os dados.',
      color: 'text-red-600 dark:text-red-400',
    },
  };

  const config = errorConfig[type];
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  const handleRetry = async () => {
    if (action?.onClick) {
      setIsRetrying(true);
      try {
        const result = action.onClick();
        if (result instanceof Promise) {
          await result;
        }
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const handleActionClick = async (actionFn: () => void | Promise<void>) => {
    try {
      const result = actionFn();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      logger.error(
        'Error executing action',
        error instanceof Error ? error : undefined
      );
    }
  };

  const allActions = action ? [action, ...actions] : actions;

  return (
    <div className={className}>
      <Card
        className={cn(
          'bg-white/50 dark:bg-white/5',
          'border-red-200/50 dark:border-red-500/20',
          'overflow-hidden',
          cardClassName
        )}
      >
        <div className="p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'p-4 rounded-full',
                'bg-red-100 dark:bg-red-900/30',
                'flex items-center justify-center'
              )}
            >
              <Icon className={cn('w-12 h-12', config.color, iconClassName)} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {displayTitle}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {displayMessage}
          </p>

          {/* Error Code */}
          {errorCode && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mb-6 font-mono">
              Código: {errorCode}
            </p>
          )}

          {/* Actions */}
          {allActions.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {allActions.map((act, index) => (
                <Button
                  key={act.id || index}
                  onClick={() => handleActionClick(act.onClick)}
                  variant={act.variant || (index === 0 ? 'default' : 'outline')}
                  disabled={act.disabled || isRetrying}
                  size="sm"
                  className="gap-2"
                >
                  {isRetrying && index === 0 ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    index === 0 && <RefreshCw className="w-4 h-4" />
                  )}
                  {act.label}
                </Button>
              ))}
            </div>
          )}

          {/* Details Section */}
          {details && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 mb-2"
              >
                {showDetailedView ? (
                  <>
                    <X className="w-3 h-3" />
                    Ocultar detalhes
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Mostrar detalhes
                  </>
                )}
              </button>

              {showDetailedView && (
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40 whitespace-pre-wrap wrap-break-word">
                    {details}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export type {
  ErrorAction,
  ErrorType,
  GridErrorProps,
} from './types/grid-error.types';
