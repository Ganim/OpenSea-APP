export type ReceivableSubType = 'VENDA' | 'SERVICO' | 'ALUGUEL' | 'OUTROS';

export const RECEIVABLE_SUBTYPE_LABELS: Record<ReceivableSubType, string> = {
  VENDA: 'Venda',
  SERVICO: 'Servico',
  ALUGUEL: 'Aluguel',
  OUTROS: 'Outros',
};
