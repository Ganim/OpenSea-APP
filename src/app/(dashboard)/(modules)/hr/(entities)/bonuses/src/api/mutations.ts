/**
 * OpenSea OS - Bonus Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bonusesService } from '@/services/hr/bonuses.service';
import type { Bonus, CreateBonusData } from '@/types/hr';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { bonusKeys } from './keys';

/* ===========================================
   CREATE
   =========================================== */

export interface CreateBonusOptions {
  onSuccess?: (bonus: Bonus) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useCreateBonus(options: CreateBonusOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (data: CreateBonusData): Promise<Bonus> => {
      const response = await bonusesService.create(data);
      return response.bonus;
    },
    onSuccess: bonus => {
      queryClient.invalidateQueries({ queryKey: bonusKeys.lists() });
      if (showSuccessToast) {
        toast.success(`Bonificação "${bonus.name}" criada com sucesso!`);
      }
      onSuccess?.(bonus);
    },
    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   DELETE
   =========================================== */

export interface DeleteBonusOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useDeleteBonus(options: DeleteBonusOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await bonusesService.delete(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: bonusKeys.lists() });
      queryClient.removeQueries({ queryKey: bonusKeys.detail(id) });
      if (showSuccessToast) {
        toast.success('Bonificação excluída com sucesso!');
      }
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}
