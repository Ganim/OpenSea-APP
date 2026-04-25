import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesService } from '@/services/hr/employees.service';

/**
 * Mutation for regenerating an Employee's public POS `shortId` (Emporion
 * Fase 1). Invalidates the employee detail cache on success so the new code
 * is shown immediately.
 */
export function useRegenerateEmployeeShortId(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => employeesService.regenerateShortId(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Código curto regenerado com sucesso.');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao regenerar o código curto.';
      toast.error(message);
    },
  });
}
