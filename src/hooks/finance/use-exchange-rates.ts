import { exchangeRatesService } from '@/services/finance';
import { useQuery } from '@tanstack/react-query';

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  EXCHANGE_RATE: (currency: string, date?: string) => [
    'exchange-rates',
    currency,
    date,
  ],
} as const;

export { QUERY_KEYS as exchangeRateKeys };

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Busca a cotação de uma moeda em relação ao BRL.
 * Desabilitado quando currency é falsy ou 'BRL'.
 */
export function useExchangeRate(currency: string, date?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EXCHANGE_RATE(currency, date),
    queryFn: () => exchangeRatesService.getRate(currency, date),
    enabled: !!currency && currency !== 'BRL',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
