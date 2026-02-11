import { cn } from '@/lib/utils';
import * as React from 'react';

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full items-stretch rounded-(--input-radius) overflow-hidden',
        className
      )}
      {...props}
    />
  );
});
InputGroup.displayName = 'InputGroup';

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'inline-start' | 'inline-end';
  }
>(({ className, align, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center',
        align === 'inline-end' ? 'order-last' : 'order-first',
        className
      )}
      {...props}
    />
  );
});
InputGroupAddon.displayName = 'InputGroupAddon';

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    align?: 'inline-start' | 'inline-end';
  }
>(({ className, align, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex h-12 items-center px-4 text-base',
        'bg-(--input-bg)',
        'border border-[rgb(var(--color-border))]',
        'text-[rgb(var(--color-foreground-subtle))]',
        'transition-all duration-(--transition-normal)',
        align === 'inline-end' ? 'border-l-0' : 'border-r-0',
        className
      )}
      {...props}
    />
  );
});
InputGroupText.displayName = 'InputGroupText';

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full px-4 py-3 text-base',
        'bg-(--input-bg)',
        'border-y border-[rgb(var(--color-border))]',
        'text-[rgb(var(--color-foreground))]',
        'placeholder:text-[rgb(var(--color-foreground-subtle))]',
        'transition-all duration-(--transition-normal)',
        'focus:outline-none focus:border-[rgb(var(--color-border-focus))] focus:relative focus:z-10',
        'focus:ring-[3px] focus:ring-[rgb(var(--color-ring)/0.5)]',
        'disabled:pointer-events-none disabled:opacity-(--state-disabled-opacity) disabled:bg-[rgb(var(--color-background-muted))]',
        'aria-invalid:border-[rgb(var(--color-border-error))] aria-invalid:ring-[rgb(var(--color-destructive)/0.2)]',
        'rounded-none',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
InputGroupInput.displayName = 'InputGroupInput';

// Componente para input monetário com formatação BRL
// Solução simples e robusta: usa type="number" com step de 0.01
// Sem máscara complexa = sem bugs de máscara
const MoneyInput = React.forwardRef<
  HTMLInputElement,
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'type' | 'step'
  > & {
    value?: number | string;
    onChange?: (value: number) => void;
  }
>(({ className, value, onChange, disabled, ...props }, ref) => {
  const numValue =
    typeof value === 'number'
      ? value
      : parseFloat(value as string) || undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value) || 0;
    if (onChange) {
      onChange(parsed);
    }
  };

  return (
    <input
      ref={ref}
      type="number"
      step="0.01"
      inputMode="decimal"
      disabled={disabled}
      onChange={handleChange}
      value={numValue ?? ''}
      placeholder="0,00"
      className={cn(
        'flex h-12 w-full px-4 py-3 text-base',
        'bg-(--input-bg)',
        'border-y border-[rgb(var(--color-border))]',
        'text-[rgb(var(--color-foreground))]',
        'placeholder:text-[rgb(var(--color-foreground-subtle))]',
        'transition-all duration-(--transition-normal)',
        'focus:outline-none focus:border-[rgb(var(--color-border-focus))] focus:relative focus:z-10',
        'focus:ring-[3px] focus:ring-[rgb(var(--color-ring)/0.5)]',
        'disabled:pointer-events-none disabled:opacity-(--state-disabled-opacity) disabled:bg-[rgb(var(--color-background-muted))]',
        'aria-invalid:border-[rgb(var(--color-border-error))] aria-invalid:ring-[rgb(var(--color-destructive)/0.2)]',
        'rounded-none',
        // Escondecontroles de número no Chrome/Edge
        '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&[type=number]]:appearance-textfield',
        className
      )}
      {...props}
    />
  );
});
MoneyInput.displayName = 'MoneyInput';

export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  MoneyInput,
};
