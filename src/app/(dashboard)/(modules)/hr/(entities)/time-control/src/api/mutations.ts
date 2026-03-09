import type { ClockInOutRequest } from '@/services/hr/time-control.service';
import type { TimeEntry } from '@/types/hr';
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { timeControlApi } from './time-control.api';
import { timeEntryKeys } from './keys';

export type ClockInOptions = Omit<
  UseMutationOptions<TimeEntry, Error, ClockInOutRequest>,
  'mutationFn'
>;

export function useClockIn(options?: ClockInOptions) {
  const queryClient = useQueryClient();

  return useMutation<TimeEntry, Error, ClockInOutRequest>({
    mutationFn: data => timeControlApi.clockIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all });
      toast.success('Entrada registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao registrar entrada');
    },
    ...options,
  });
}

export type ClockOutOptions = Omit<
  UseMutationOptions<TimeEntry, Error, ClockInOutRequest>,
  'mutationFn'
>;

export function useClockOut(options?: ClockOutOptions) {
  const queryClient = useQueryClient();

  return useMutation<TimeEntry, Error, ClockInOutRequest>({
    mutationFn: data => timeControlApi.clockOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all });
      toast.success('Saída registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao registrar saída');
    },
    ...options,
  });
}
