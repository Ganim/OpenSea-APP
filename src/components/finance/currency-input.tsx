'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { financeAnalyticsService } from '@/services/finance';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

// ─── Currency Options ────────────────────────────────────────────────────────

interface CurrencyOption {
  code: string;
  flag: string;
  label: string;
}

const CURRENCIES: CurrencyOption[] = [
  { code: 'BRL', flag: '\u{1F1E7}\u{1F1F7}', label: 'BRL' },
  { code: 'USD', flag: '\u{1F1FA}\u{1F1F8}', label: 'USD' },
  { code: 'EUR', flag: '\u{1F1EA}\u{1F1FA}', label: 'EUR' },
  { code: 'GBP', flag: '\u{1F1EC}\u{1F1E7}', label: 'GBP' },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface CurrencyInputProps {
  value: string;
  onChange: (currency: string) => void;
  amount?: number;
  onConvertedAmountChange?: (brlAmount: number, rate: number) => void;
  disabled?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CurrencyInput({
  value,
  onChange,
  amount,
  onConvertedAmountChange,
  disabled = false,
}: CurrencyInputProps) {
  const [conversionInfo, setConversionInfo] = useState<{
    rate: number;
    brlAmount: number;
  } | null>(null);

  const isNonBRL = value !== 'BRL';

  const { data: rateData } = useQuery({
    queryKey: ['exchange-rate', value],
    queryFn: async () => {
      const response = await financeAnalyticsService.getExchangeRate(value);
      return response;
    },
    enabled: isNonBRL,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  const updateConversion = useCallback(() => {
    if (!isNonBRL || !rateData || !amount) {
      setConversionInfo(null);
      return;
    }

    const brlAmount = Math.round(amount * rateData.rate * 100) / 100;
    setConversionInfo({ rate: rateData.rate, brlAmount });
    onConvertedAmountChange?.(brlAmount, rateData.rate);
  }, [isNonBRL, rateData, amount, onConvertedAmountChange]);

  useEffect(() => {
    updateConversion();
  }, [updateConversion]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map(c => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isNonBRL && conversionInfo && amount && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          <span className="font-medium">
            1 {value} = R$ {conversionInfo.rate.toFixed(4)}
          </span>
          <span className="mx-1.5">&rarr;</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(conversionInfo.brlAmount)}
          </span>
        </div>
      )}

      {isNonBRL && !rateData && (
        <div className="text-xs text-muted-foreground/70 bg-muted/30 rounded-md px-3 py-2">
          Buscando cotacao...
        </div>
      )}
    </div>
  );
}
