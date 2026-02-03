/**
 * Toast Utilities
 * Funções utilitárias para exibir toasts padronizados com funcionalidades extras
 */

import { toast } from 'sonner';

interface ErrorToastOptions {
  title: string;
  description: string;
  context?: Record<string, unknown>;
}

/**
 * Exibe um toast de erro com botão para copiar detalhes do erro
 */
export function showErrorToast(options: ErrorToastOptions) {
  const { title, description, context } = options;

  const errorDetails = JSON.stringify(
    {
      error: description,
      ...context,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );

  toast.error(title, {
    description,
    action: {
      label: 'Copiar erro',
      onClick: () => {
        navigator.clipboard.writeText(errorDetails);
        toast.success('Erro copiado para área de transferência');
      },
    },
  });
}

/**
 * Exibe um toast de sucesso simples
 */
export function showSuccessToast(message: string) {
  toast.success(message);
}

/**
 * Exibe um toast informativo simples
 */
export function showInfoToast(message: string) {
  toast.info(message);
}

/**
 * Exibe um toast de aviso simples
 */
export function showWarningToast(message: string) {
  toast.warning(message);
}
