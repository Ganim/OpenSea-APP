/**
 * OpenSea OS - OKR Mutations (HR)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateObjectiveData,
  UpdateObjectiveData,
  CreateKeyResultData,
  CreateCheckInData,
} from '@/types/hr';
import { toast } from 'sonner';
import { okrsApi } from './okrs.api';
import { okrKeys } from './keys';

export function useCreateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateObjectiveData) => okrsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      toast.success('Objetivo criado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar objetivo');
    },
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateObjectiveData }) =>
      okrsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      toast.success('Objetivo atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar objetivo');
    },
  });
}

export function useDeleteObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => okrsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      toast.success('Objetivo excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir objetivo');
    },
  });
}

export function useCreateKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      objectiveId,
      data,
    }: {
      objectiveId: string;
      data: CreateKeyResultData;
    }) => okrsApi.createKeyResult(objectiveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      toast.success('Resultado-chave adicionado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao adicionar resultado-chave');
    },
  });
}

export function useCheckInKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      keyResultId,
      data,
    }: {
      keyResultId: string;
      data: CreateCheckInData;
    }) => okrsApi.checkIn(keyResultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: okrKeys.all });
      toast.success('Check-in registrado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao registrar check-in');
    },
  });
}
