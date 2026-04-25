import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  posTerminalOperatorsService,
  type ListTerminalOperatorsParams,
} from '@/services/sales/pos-terminal-operators.service';

const KEYS = {
  all: ['pos-terminal-operators'] as const,
  list: (terminalId: string, params?: ListTerminalOperatorsParams) =>
    [...KEYS.all, terminalId, params ?? {}] as const,
};

/**
 * Lists Employees authorized as operators of a POS Terminal (Fase 1).
 */
export function usePosTerminalOperators(
  terminalId: string,
  params?: ListTerminalOperatorsParams
) {
  return useQuery({
    queryKey: KEYS.list(terminalId, params),
    queryFn: () => posTerminalOperatorsService.list(terminalId, params),
    enabled: !!terminalId,
  });
}

export function useAssignTerminalOperator(terminalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) =>
      posTerminalOperatorsService.assign(terminalId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...KEYS.all, terminalId] });
      toast.success('Operador autorizado com sucesso.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Erro ao autorizar operador.';
      toast.error(message);
    },
  });
}

export function useRevokeTerminalOperator(terminalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) =>
      posTerminalOperatorsService.revoke(terminalId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...KEYS.all, terminalId] });
      toast.success('Autorização revogada com sucesso.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Erro ao revogar autorização.';
      toast.error(message);
    },
  });
}
