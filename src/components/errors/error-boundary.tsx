/**
 * OpenSea OS - Error Boundary
 *
 * Componente que captura erros de renderização em seus filhos
 * e exibe uma interface amigável de erro.
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(err) => logToService(err)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/* ===========================================
   TYPES
   =========================================== */

interface ErrorBoundaryProps {
  /** Componentes filhos a serem renderizados */
  children: ReactNode;
  /** Componente de fallback customizado (opcional) */
  fallback?: ReactNode;
  /** Callback executado quando um erro é capturado */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Se deve mostrar detalhes técnicos (desenvolvimento) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  /** Indica se um erro foi capturado */
  hasError: boolean;
  /** O erro capturado */
  error: Error | null;
  /** Informações adicionais do erro */
  errorInfo: ErrorInfo | null;
}

/* ===========================================
   COMPONENT
   =========================================== */

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Atualiza o state quando um erro é capturado
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Loga o erro e executa callback customizado
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log para console em desenvolvimento
    console.error('[ErrorBoundary] Erro capturado:', {
      error,
      componentStack: errorInfo.componentStack,
    });

    // Atualiza state com info adicional
    this.setState({ errorInfo });

    // Executa callback customizado se fornecido
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reseta o estado de erro para tentar novamente
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Navega para a página inicial
   */
  handleGoHome = (): void => {
    window.location.href = '/';
  };

  /**
   * Recarrega a página
   */
  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    // Se não houve erro, renderiza os filhos normalmente
    if (!hasError) {
      return children;
    }

    // Se foi fornecido um fallback customizado, usa ele
    if (fallback) {
      return fallback;
    }

    // Renderiza a interface de erro padrão
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 text-center shadow-lg">
          {/* Ícone de erro */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Ops! Algo deu errado
          </h2>

          {/* Mensagem */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ocorreu um erro inesperado ao renderizar esta página. Por favor,
            tente novamente ou volte para a página inicial.
          </p>

          {/* Detalhes técnicos (opcional) */}
          {showDetails && error && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Detalhes do erro
                </span>
              </div>
              <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                {error.name}: {error.message}
              </p>
              {errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={this.handleGoHome}>
              <Home className="w-4 h-4 mr-2" />
              Página Inicial
            </Button>
            <Button onClick={this.handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}

/* ===========================================
   HOOK PARA RESET PROGRAMÁTICO
   =========================================== */

/**
 * Props para o ErrorBoundary com ref
 */
export interface ErrorBoundaryRef {
  reset: () => void;
}

export default ErrorBoundary;
