/**
 * OpenSea OS - Core Provider
 * Provider central que combina todos os providers do sistema core
 */

'use client';

import React, { ReactNode } from 'react';
import {
  SelectionProvider,
  type SelectionProviderComponentProps,
} from '@/core/selection';

// =============================================================================
// TYPES
// =============================================================================

export interface CoreProviderProps {
  children: ReactNode;
  /** Configurações do SelectionProvider */
  selection?: Omit<SelectionProviderComponentProps, 'children'>;
}

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * CoreProvider
 *
 * Provider central que agrupa todos os providers necessários para o sistema core.
 * Atualmente inclui:
 * - SelectionProvider: Gerencia estado de seleção múltipla
 *
 * Futuramente incluirá:
 * - UndoRedoProvider: Sistema de desfazer/refazer
 * - AuditProvider: Registro de auditoria
 * - RBACProvider: Controle de permissões
 */
export function CoreProvider({ children, selection }: CoreProviderProps) {
  // Se não tiver configuração de selection, renderiza sem provider
  if (!selection) {
    return <>{children}</>;
  }

  return <SelectionProvider {...selection}>{children}</SelectionProvider>;
}

// =============================================================================
// COMPOSABLE PROVIDERS
// =============================================================================

/**
 * withCoreProviders
 *
 * HOC para envolver um componente com os providers core.
 * Útil para páginas que precisam de funcionalidades core.
 */
export function withCoreProviders<P extends object>(
  Component: React.ComponentType<P>,
  providerProps?: Omit<CoreProviderProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = props => {
    return (
      <CoreProvider {...providerProps}>
        <Component {...props} />
      </CoreProvider>
    );
  };

  WrappedComponent.displayName = `withCoreProviders(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

export default CoreProvider;
