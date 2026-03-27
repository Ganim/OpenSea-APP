import {
  financeQueryService,
  type FinanceQueryRequest,
} from '@/services/finance/finance-query.service';
import { useMutation } from '@tanstack/react-query';

export function useFinanceQuery() {
  return useMutation({
    mutationFn: (request: FinanceQueryRequest) =>
      financeQueryService.query(request),
  });
}
