'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Select com efeito glassmorphism para o Central.
 * Wrapper dos componentes Radix Select com visual consistente.
 */

function GlassSelect({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

function GlassSelectValue({
  placeholder,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value placeholder={placeholder} {...props} />;
}

function GlassSelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'w-full rounded-xl',
        'central-glass central-text',
        'px-4 py-2.5',
        'central-transition',
        'focus:outline-none focus:ring-2',
        'focus:ring-[rgb(var(--color-ring)/0.3)]',
        'focus:border-[rgb(var(--color-border-focus))]',
        'hover:bg-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*1.5))]',
        'disabled:pointer-events-none disabled:opacity-50',
        'flex items-center justify-between gap-2',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function GlassSelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'central-glass-strong backdrop-blur-xl',
          'border border-[rgb(var(--central-border)/0.15)]',
          'central-text shadow-2xl',
          'relative z-50 max-h-[--radix-select-content-available-height] min-w-32',
          'origin-[--radix-select-content-transform-origin]',
          'overflow-x-hidden overflow-y-auto rounded-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <GlassSelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[--radix-select-trigger-height] w-full min-w-[--radix-select-trigger-width] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <GlassSelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function GlassSelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-pointer items-center gap-2',
        'rounded-lg py-2.5 pr-8 pl-3 text-sm',
        'central-text outline-none select-none',
        'hover:bg-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*2))]',
        'focus:bg-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*2))]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'central-transition',
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function GlassSelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        'central-text-muted px-3 py-1.5 text-xs font-medium',
        className
      )}
      {...props}
    />
  );
}

function GlassSelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        'pointer-events-none -mx-1 my-1 h-px',
        'bg-[rgb(var(--central-border)/0.15)]',
        className
      )}
      {...props}
    />
  );
}

function GlassSelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function GlassSelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectLabel,
  GlassSelectScrollDownButton,
  GlassSelectScrollUpButton,
  GlassSelectSeparator,
  GlassSelectTrigger,
  GlassSelectValue,
};
