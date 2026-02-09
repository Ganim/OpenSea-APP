/**
 * Page Header Component
 * Header padrão para páginas de estoque com título e ações customizáveis
 * Mobile-first: botões com ícones no mobile, com texto no desktop
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface PageHeaderButtonStyle {
  iconColor?: string;
  badgeColor?: string;
}

interface PageHeaderButton {
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary';
  icon?: React.ComponentType<{ className?: string }>;
  text?: string;
  onClick: () => void;
  badge?: string | number;
  style?: PageHeaderButtonStyle;
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  buttons?: PageHeaderButton[];
}

export function PageHeader({
  title,
  description,
  showBackButton = true,
  backUrl,
  buttons = [],
}: PageHeaderProps) {
  const router = useRouter();

  const renderButton = (button: PageHeaderButton, isMobile: boolean) => {
    const {
      variant = 'default',
      icon: Icon,
      text,
      onClick,
      badge,
      style,
      disabled = false,
      loading = false,
    } = button;

    const iconClass = style?.iconColor || '';
    const badgeVariant = style?.badgeColor ? 'default' : 'secondary';
    const badgeClass = style?.badgeColor ? `bg-${style.badgeColor}` : '';

    if (isMobile) {
      // Mobile: apenas ícone, com title se text
      return (
        <Button
          key={text || 'button'}
          variant={variant}
          size="icon"
          onClick={onClick}
          disabled={disabled || loading}
          className="h-10 w-10 rounded-xl"
          title={text}
          aria-label={text || 'Acao'}
        >
          {Icon && <Icon className={`w-5 h-5 ${iconClass}`} />}
          {loading && <span className="ml-2">...</span>}
        </Button>
      );
    } else {
      // Desktop: ícone + texto se disponível
      return (
        <Button
          key={text || 'button'}
          variant={variant}
          size="default"
          onClick={onClick}
          disabled={disabled || loading}
          className="h-10 rounded-xl"
        >
          {Icon && <Icon className={`w-4 h-4 mr-2 ${iconClass}`} />}
          {text && <span>{loading ? `${text}...` : text}</span>}
          {badge && (
            <Badge variant={badgeVariant} className={`ml-2 ${badgeClass}`}>
              {badge}
            </Badge>
          )}
        </Button>
      );
    }
  };

  return (
    <div className="mb-6">
      {/* Header Principal */}
      <div className="flex gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Título e Descrição */}
        <div className="flex items-start gap-3 flex-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (backUrl ? router.push(backUrl) : router.back())}
              className="mt-1 shrink-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 hidden sm:flex">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Ações Customizáveis */}
        {buttons.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile: Somente ícones */}
            <div className="flex sm:hidden items-center gap-2">
              {buttons.map(button => renderButton(button, true))}
            </div>

            {/* Desktop: Ícones + texto */}
            <div className="hidden sm:flex items-center gap-2">
              {buttons.map(button => renderButton(button, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
