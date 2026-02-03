/**
 * OpenSea - Error Boundary
 * Captura erros de React e mostra UI amigável
 */

'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary que captura erros de componentes React
 *
 * Uso:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * Com callback personalizado:
 * <ErrorBoundary
 *   onError={(error, info) => {
 *     console.log('Custom error handler', error);
 *   }}
 *   fallback={(error, reset) => (
 *     <div>Custom error UI</div>
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    logger.error('React component error', error, {
      componentStack: errorInfo.componentStack?.substring(0, 500), // Truncar para evitar logs muito grandes
    });

    // Callback customizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Atualizar estado
    this.setState({ errorInfo });

    // TODO: Integrar com Sentry em produção
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // UI padrão
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full border border-red-200">
            {/* Ícone */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Título e descrição */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">
              Algo deu errado
            </h1>

            <p className="text-gray-600 text-center mb-6 text-lg">
              Desculpe, encontramos um erro inesperado. Não se preocupe, já foi
              registrado e nosso time foi notificado.
            </p>

            {/* Erro em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-3 mb-6">
                <details className="bg-red-50 border border-red-200 rounded p-4">
                  <summary className="cursor-pointer font-semibold text-red-800 hover:text-red-900">
                    Detalhes do Erro (Desenvolvimento)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-mono text-red-800 break-words">
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack.substring(0, 500)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Erro ID (para reportar) */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-6 text-center">
              <p className="text-xs text-gray-600">ID do Erro</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {this.generateErrorId()}
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="gap-2"
                size="lg"
              >
                <RotateCcw className="w-4 h-4" />
                Tentar Novamente
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="gap-2"
                size="lg"
              >
                <Home className="w-4 h-4" />
                Voltar para Home
              </Button>
            </div>

            {/* Aviso em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <p className="font-semibold mb-1">💡 Modo Desenvolvimento</p>
                <p>
                  Os detalhes do erro acima aparecem apenas neste ambiente. Em
                  produção, os usuários verão apenas a mensagem de erro amigável.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  /**
   * Gera um ID único para o erro (para reporting)
   */
  private generateErrorId(): string {
    const timestamp = new Date().toISOString();
    const errorHash = this.state.error
      ?.message.substring(0, 20)
      .replace(/\s+/g, '_')
      .toUpperCase() || 'UNKNOWN';

    return `ERR_${errorHash}_${Date.now()}`;
  }
}
