/**
 * PPE (EPI) Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ppeService } from '@/services/hr/ppe.service';
import type {
  PPEItem,
  PPEAssignment,
  CreatePPEItemData,
  UpdatePPEItemData,
  AssignPPEData,
  ReturnPPEData,
} from '@/types/hr';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { ppeKeys } from './keys';

/* ===========================================
   CREATE PPE ITEM
   =========================================== */

export interface CreatePPEItemOptions {
  onSuccess?: (item: PPEItem) => void;
  onError?: (error: Error) => void;
}

export function useCreatePPEItem(options: CreatePPEItemOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async (data: CreatePPEItemData): Promise<PPEItem> => {
      const response = await ppeService.createItem(data);
      return response.ppeItem;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ppeKeys.items() });
      toast.success('EPI cadastrado com sucesso!');
      onSuccess?.(item);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   UPDATE PPE ITEM
   =========================================== */

export interface UpdatePPEItemOptions {
  onSuccess?: (item: PPEItem) => void;
  onError?: (error: Error) => void;
}

export function useUpdatePPEItem(options: UpdatePPEItemOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePPEItemData;
    }): Promise<PPEItem> => {
      const response = await ppeService.updateItem(id, data);
      return response.ppeItem;
    },
    onSuccess: (item, { id }) => {
      queryClient.invalidateQueries({ queryKey: ppeKeys.items() });
      queryClient.invalidateQueries({ queryKey: ppeKeys.itemDetail(id) });
      toast.success('EPI atualizado com sucesso!');
      onSuccess?.(item);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   DELETE PPE ITEM
   =========================================== */

export interface DeletePPEItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeletePPEItem(options: DeletePPEItemOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await ppeService.deleteItem(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ppeKeys.items() });
      queryClient.removeQueries({ queryKey: ppeKeys.itemDetail(id) });
      toast.success('EPI excluído com sucesso!');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   ADJUST STOCK
   =========================================== */

export interface AdjustStockOptions {
  onSuccess?: (item: PPEItem) => void;
  onError?: (error: Error) => void;
}

export function useAdjustPPEStock(options: AdjustStockOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async ({
      id,
      adjustment,
    }: {
      id: string;
      adjustment: number;
    }): Promise<PPEItem> => {
      const response = await ppeService.adjustStock(id, { adjustment });
      return response.ppeItem;
    },
    onSuccess: (item, { id }) => {
      queryClient.invalidateQueries({ queryKey: ppeKeys.items() });
      queryClient.invalidateQueries({ queryKey: ppeKeys.itemDetail(id) });
      toast.success('Estoque ajustado com sucesso!');
      onSuccess?.(item);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   ASSIGN PPE
   =========================================== */

export interface AssignPPEOptions {
  onSuccess?: (assignment: PPEAssignment) => void;
  onError?: (error: Error) => void;
}

export function useAssignPPE(options: AssignPPEOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async (data: AssignPPEData): Promise<PPEAssignment> => {
      const response = await ppeService.assignPPE(data);
      return response.assignment;
    },
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: ppeKeys.all });
      toast.success('EPI atribuído com sucesso!');
      onSuccess?.(assignment);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   RETURN PPE
   =========================================== */

export interface ReturnPPEOptions {
  onSuccess?: (assignment: PPEAssignment) => void;
  onError?: (error: Error) => void;
}

export function useReturnPPE(options: ReturnPPEOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: ReturnPPEData;
    }): Promise<PPEAssignment> => {
      const response = await ppeService.returnPPE(assignmentId, data);
      return response.assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ppeKeys.all });
      toast.success('EPI devolvido com sucesso!');
      onSuccess?.(undefined as unknown as PPEAssignment);
    },
    onError: (error: Error) => {
      toast.error(translateError(error));
      onError?.(error);
    },
  });
}
