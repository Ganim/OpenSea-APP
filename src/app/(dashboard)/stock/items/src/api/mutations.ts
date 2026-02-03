/**
 * OpenSea OS - Item Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsService } from '@/services/stock/items.service';
import type {
  Item,
  ItemMovement,
  RegisterItemEntryRequest,
  RegisterItemExitRequest,
  TransferItemRequest,
} from '@/types/stock';
import { toast } from 'sonner';
import { translateError } from '@/lib/errors';
import { itemKeys, movementKeys } from './keys';

// Variant keys - defined locally to avoid cross-module imports
const variantKeys = {
  all: ['variants'] as const,
  detail: (id: string) => [...variantKeys.all, 'detail', id] as const,
  items: (variantId: string) =>
    [...variantKeys.all, 'detail', variantId, 'items'] as const,
};

// Location keys - defined locally to avoid cross-module imports
const locationKeys = {
  all: ['locations'] as const,
  detail: (id: string) => [...locationKeys.all, 'detail', id] as const,
  items: (locationId: string) =>
    [...locationKeys.all, 'detail', locationId, 'items'] as const,
};

/* ===========================================
   REGISTER ITEM ENTRY
   =========================================== */

export type RegisterItemEntryData = RegisterItemEntryRequest;

export interface RegisterItemEntryResult {
  item: Item;
  movement: ItemMovement;
}

export interface RegisterItemEntryOptions {
  onSuccess?: (result: RegisterItemEntryResult) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useRegisterItemEntry(options: RegisterItemEntryOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (
      data: RegisterItemEntryData
    ): Promise<RegisterItemEntryResult> => {
      const response = await itemsService.registerEntry(data);
      return {
        item: response.item,
        movement: response.movement,
      };
    },

    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });

      // Invalidate related queries
      if (result.item.variantId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byVariant(result.item.variantId),
        });
        queryClient.invalidateQueries({
          queryKey: variantKeys.items(result.item.variantId),
        });
      }

      if (result.item.locationId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byLocation(result.item.locationId),
        });
        queryClient.invalidateQueries({
          queryKey: locationKeys.items(result.item.locationId),
        });
      }

      if (showSuccessToast) {
        toast.success(
          `Item "${result.item.uniqueCode}" registrado com sucesso!`
        );
      }

      onSuccess?.(result);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   REGISTER ITEM EXIT
   =========================================== */

export type RegisterItemExitData = RegisterItemExitRequest;

export interface RegisterItemExitResult {
  item: Item;
  movement: ItemMovement;
}

export interface RegisterItemExitOptions {
  onSuccess?: (result: RegisterItemExitResult) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useRegisterItemExit(options: RegisterItemExitOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async (
      data: RegisterItemExitData
    ): Promise<RegisterItemExitResult> => {
      const response = await itemsService.registerExit(data);
      return {
        item: response.item,
        movement: response.movement,
      };
    },

    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(result.item.id),
      });
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: movementKeys.byItem(result.item.id),
      });

      if (result.item.variantId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byVariant(result.item.variantId),
        });
        queryClient.invalidateQueries({
          queryKey: variantKeys.items(result.item.variantId),
        });
      }

      if (result.item.locationId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byLocation(result.item.locationId),
        });
        queryClient.invalidateQueries({
          queryKey: locationKeys.items(result.item.locationId),
        });
      }

      if (showSuccessToast) {
        toast.success('Saída registrada com sucesso!');
      }

      onSuccess?.(result);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   TRANSFER ITEM
   =========================================== */

export type TransferItemData = TransferItemRequest;

export interface TransferItemResult {
  item: Item;
  movement: ItemMovement;
}

export interface TransferItemOptions {
  onSuccess?: (result: TransferItemResult) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  previousLocationId?: string;
}

export function useTransferItem(options: TransferItemOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    previousLocationId,
  } = options;

  return useMutation({
    mutationFn: async (data: TransferItemData): Promise<TransferItemResult> => {
      const response = await itemsService.transferItem(data);
      return {
        item: response.item,
        movement: response.movement,
      };
    },

    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: itemKeys.detail(result.item.id),
      });
      queryClient.invalidateQueries({ queryKey: movementKeys.lists() });

      if (result.item.variantId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byVariant(result.item.variantId),
        });
      }

      // Invalidate both old and new location
      if (previousLocationId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byLocation(previousLocationId),
        });
        queryClient.invalidateQueries({
          queryKey: locationKeys.items(previousLocationId),
        });
      }

      if (result.item.locationId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byLocation(result.item.locationId),
        });
        queryClient.invalidateQueries({
          queryKey: locationKeys.items(result.item.locationId),
        });
      }

      if (showSuccessToast) {
        toast.success('Item transferido com sucesso!');
      }

      onSuccess?.(result);
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}

/* ===========================================
   DELETE ITEM
   =========================================== */

export interface DeleteItemVariables {
  id: string;
  variantId?: string;
  locationId?: string;
}

export interface DeleteItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useDeleteItem(options: DeleteItemOptions = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn: async ({ id }: DeleteItemVariables): Promise<void> => {
      await itemsService.deleteItem(id);
    },

    onSuccess: (_, { id, variantId, locationId }) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
      queryClient.removeQueries({ queryKey: movementKeys.byItem(id) });

      if (variantId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byVariant(variantId),
        });
        queryClient.invalidateQueries({
          queryKey: variantKeys.items(variantId),
        });
      }

      if (locationId) {
        queryClient.invalidateQueries({
          queryKey: itemKeys.byLocation(locationId),
        });
        queryClient.invalidateQueries({
          queryKey: locationKeys.items(locationId),
        });
      }

      if (showSuccessToast) {
        toast.success('Item excluído com sucesso!');
      }

      onSuccess?.();
    },

    onError: (error: Error) => {
      if (showErrorToast) toast.error(translateError(error));
      onError?.(error);
    },
  });
}
