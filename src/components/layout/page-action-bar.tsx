'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeaderButton } from './types/header.types';

/**
 * Props do componente PageActionBar
 */
export interface PageActionBarProps {
  /** Botões a serem exibidos na action bar */
  buttons: HeaderButton[];
  /** Callback para o botão de voltar */
  onBack?: () => void;
  /** Label do botão de voltar */
  backLabel?: string;
  /** Ícone do botão de voltar (padrão: ArrowLeft) */
  backIcon?: React.ComponentType<{ className?: string }>;
  /** Classes customizadas para o container */
  className?: string;
  /** Classes customizadas para a seção de buttons */
  buttonsClassName?: string;
}

/**
 * Componente PageActionBar reutilizável
 *
 * Renderiza uma barra de ação no topo da página com:
 * - Botão de voltar à esquerda
 * - Botões de ação à direita
 *
 * @example
 * <PageActionBar
 *   buttons={headerButtons}
 *   onBack={() => router.back()}
 *   backLabel="Voltar"
 *   backIcon={ArrowLeft}
 * />
 */
export function PageActionBar({
  buttons,
  onBack,
  backLabel = 'Voltar',
  backIcon: BackIcon,
  className,
  buttonsClassName,
}: PageActionBarProps) {
  return (
    <div className={cn('flex w-full justify-between items-center', className)}>
      {/* Botão de Voltar */}
      {onBack && BackIcon && (
        <div>
          <Button variant="text" size="plan" onClick={onBack}>
            <BackIcon className="h-5 w-5" />
            <span className="hidden lg:inline">{backLabel}</span>
          </Button>
        </div>
      )}

      {/* Botões de Ação */}
      <div className={cn('flex items-center gap-2', buttonsClassName)}>
        {buttons.map(button => (
          <Button
            key={button.id}
            variant={button.variant || 'default'}
            size="sm"
            onClick={button.onClick}
            title={button.title}
          >
            {button.icon && (
              <button.icon
                className={`h-4 w-4 ${
                  button.variant === 'ghost' ? 'text-primary' : 'text-white'
                }`}
              />
            )}
            <span className="hidden lg:inline">{button.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
