import { cn } from '@/lib/utils';
import { GlassContainer } from './glass-container';

export interface GlassTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Tabela com efeito glassmorphism
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
    <thead className={cn('border-b border-white/10', className)}>
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
        'border-b border-white/5 transition-colors',
        'hover:bg-white/5',
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
        'px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider',
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
    <td colSpan={colSpan} className={cn('px-6 py-4 text-sm text-white/90', className)}>
      {children}
    </td>
  );
}
