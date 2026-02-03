'use client';

import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Loader2, X, type LucideIcon } from 'lucide-react';
import type {
  DialogHeaderAction,
  DialogHeaderProps,
} from './dialog-header.types';

const variantClasses: Record<
  NonNullable<DialogHeaderProps['variant']>,
  string
> = {
  default:
    'bg-linear-to-br from-slate-100 to-slate-300 dark:from-slate-800 dark:to-slate-900',
  subtle: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur',
  solid: 'bg-slate-900 text-white',
};

const alignMap: Record<NonNullable<DialogHeaderProps['align']>, string> = {
  left: 'justify-start gap-4',
  center: 'justify-center text-center',
  between: 'justify-between',
};

function renderAction(action: DialogHeaderAction) {
  const Icon = action.icon;
  const content = (
    <Button
      key={action.id || action.label}
      onClick={() => action.onClick()}
      variant={action.variant || 'ghost'}
      size={action.size || 'sm'}
      disabled={action.disabled || action.loading}
      className={cn('gap-2', action.className)}
      aria-label={action.label}
    >
      {action.loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {action.size !== 'icon' && (
        <span className="hidden sm:inline">{action.label}</span>
      )}
    </Button>
  );

  return action.tooltip ? (
    <Tooltip key={action.id || action.label}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{action.tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    <span key={action.id || action.label}>{content}</span>
  );
}

export function DialogHeader({
  title,
  description,
  icon,
  iconBgClassName,
  titleClassName,
  descriptionClassName,
  align = 'between',
  variant = 'default',
  actions,
  onClose,
  closeTooltip = 'Fechar',
  className,
  contentClassName,
}: DialogHeaderProps) {
  // Check if icon is a React component (LucideIcon or functional component)
  const isComponent =
    typeof icon === 'function' ||
    (icon && typeof icon === 'object' && '$$typeof' in icon);
  const IconComp = isComponent ? (icon as LucideIcon) : null;

  return (
    <TooltipProvider>
      <div
        className={cn(
          'absolute w-full flex items-center p-4 border-b',
          variantClasses[variant],
          alignMap[align],
          className
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3',
            align === 'center' && 'justify-center',
            contentClassName
          )}
        >
          {IconComp && (
            <div
              className={cn(
                'flex items-center justify-center rounded-lg p-2',
                'bg-linear-to-br from-purple-500 to-pink-600 text-white',
                iconBgClassName
              )}
            >
              <IconComp className="h-5 w-5" />
            </div>
          )}

          <div
            className={cn(
              'flex flex-col',
              align === 'center' && 'items-center text-center'
            )}
          >
            <DialogTitle
              className={cn(
                'text-lg font-semibold text-gray-900 dark:text-white',
                titleClassName
              )}
            >
              {title}
            </DialogTitle>
            {description && (
              <span
                className={cn(
                  'text-sm text-gray-600 dark:text-gray-300',
                  descriptionClassName
                )}
              >
                {description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions?.map(renderAction)}

          {onClose && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label={closeTooltip}
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{closeTooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="h-12" /> {/* Spacer to offset content below the header */}
    </TooltipProvider>
  );
}

export type {
  DialogHeaderAction,
  DialogHeaderProps,
} from './dialog-header.types';
