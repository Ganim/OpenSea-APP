import { cn } from '@/lib/utils';
import { GlassContainer } from './glass-container';

export interface GlassTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Tabela com efeito glassmorphism
 * Usa design tokens CSS para adaptar automaticamente ao tema (light/dark-blue)
 */
export function GlassTable({ children, className }: GlassTableProps) {
  return (
    <GlassContainer
      variant="medium"
      className={cn('overflow-hidden', className)}
    >
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </GlassContainer>
  );
}

export function GlassTableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={cn(
        'border-b border-[rgb(var(--glass-border)/var(--glass-border-opacity))]',
        className
      )}
    >
      {children}
    </thead>
  );
}

export function GlassTableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={className}>{children}</tbody>;
}

export function GlassTableRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b central-transition',
        'border-[rgb(var(--glass-border)/calc(var(--glass-border-opacity)*0.5))]',
        'hover:bg-[rgb(var(--glass-bg)/calc(var(--glass-bg-opacity)*0.5))]',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function GlassTableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider',
        'central-text-muted',
        className
      )}
    >
      {children}
    </th>
  );
}

export function GlassTableCell({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn('px-6 py-4 text-sm central-text', className)}
    >
      {children}
    </td>
  );
}
