'use client';

/**
 * CustomerCreditBadge — pílula compacta que mostra o saldo de crédito do
 * cliente (limite, disponível, store credit). Usado no PDV antes de fechar
 * uma venda fiada para evitar estouro de limite.
 *
 * Comportamento:
 *  - Sem `customerId`: nada é renderizado.
 *  - Sem limite cadastrado e sem store credit: nada é renderizado (silencioso).
 *  - Limite cadastrado: pill com cor por status (verde > 50%, âmbar 10-50%,
 *    rose <10% ou bloqueado).
 */
import { useCustomerCredit } from '@/hooks/sales/use-customers';
import { cn } from '@/lib/utils';
import { ShieldCheck, Wallet } from 'lucide-react';

interface CustomerCreditBadgeProps {
  customerId: string | null | undefined;
  className?: string;
  /**
   * Quando true (padrão), mostra também o store credit como linha separada.
   * Útil esconder em listagens compactas.
   */
  showStoreCredit?: boolean;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export function CustomerCreditBadge({
  customerId,
  className,
  showStoreCredit = true,
}: CustomerCreditBadgeProps) {
  const { data: credit, isLoading } = useCustomerCredit(customerId);

  if (!customerId) return null;
  if (isLoading) return null;
  if (!credit) return null;

  const hasAnything =
    credit.hasLimit || (showStoreCredit && credit.storeCreditBalance > 0);
  if (!hasAnything) return null;

  const ratio =
    credit.hasLimit && credit.creditLimit > 0
      ? credit.available / credit.creditLimit
      : 0;
  const tone = !credit.isActive
    ? 'rose'
    : ratio >= 0.5
      ? 'emerald'
      : ratio >= 0.1
        ? 'amber'
        : 'rose';

  const toneClasses: Record<string, string> = {
    emerald:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    amber:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {credit.hasLimit && (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
            toneClasses[tone]
          )}
          title={
            credit.isActive
              ? `Disponível: ${formatBRL(credit.available)} de ${formatBRL(credit.creditLimit)}`
              : 'Limite de crédito inativo'
          }
        >
          <ShieldCheck className="h-3 w-3" />
          {credit.isActive
            ? `Crédito: ${formatBRL(credit.available)}`
            : 'Crédito bloqueado'}
        </span>
      )}
      {showStoreCredit && credit.storeCreditBalance > 0 && (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
            'bg-violet-50 text-violet-700 border-violet-200',
            'dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30'
          )}
          title={`Store credit disponível: ${formatBRL(credit.storeCreditBalance)}`}
        >
          <Wallet className="h-3 w-3" />
          Store credit: {formatBRL(credit.storeCreditBalance)}
        </span>
      )}
    </div>
  );
}
