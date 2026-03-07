import { useQuery } from '@tanstack/react-query';

interface BrasilAPIBank {
  ispb: string;
  name: string | null;
  code: number | null;
  fullName: string | null;
}

export function useBrasilApiBanks() {
  return useQuery({
    queryKey: ['brasilapi-banks'],
    queryFn: async () => {
      const res = await fetch('https://brasilapi.com.br/api/banks/v1');
      if (!res.ok) throw new Error('Erro ao buscar bancos');
      const banks: BrasilAPIBank[] = await res.json();
      return banks
        .filter(b => b.code !== null)
        .sort((a, b) => (a.code ?? 0) - (b.code ?? 0));
    },
    staleTime: 24 * 60 * 60 * 1000, // 24h cache
  });
}
