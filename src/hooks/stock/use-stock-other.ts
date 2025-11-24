import {
  manufacturersService,
  purchaseOrdersService,
  suppliersService,
  tagsService,
  templatesService,
} from '@/services/stock';
import { locationsService } from '@/services/stock/locations.service';
import type {
  ApiLocation,
  CreateLocationRequest,
  CreateManufacturerRequest,
  CreatePurchaseOrderRequest,
  CreateSupplierRequest,
  CreateTagRequest,
  CreateTemplateRequest,
  LocationType,
  UpdateLocationRequest,
  UpdateManufacturerRequest,
  UpdatePurchaseOrderStatusRequest,
  UpdateSupplierRequest,
  UpdateTagRequest,
  UpdateTemplateRequest,
} from '@/types/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
  MANUFACTURERS: ['manufacturers'],
  MANUFACTURER: (id: string) => ['manufacturers', id],
  SUPPLIERS: ['suppliers'],
  SUPPLIER: (id: string) => ['suppliers', id],
  LOCATIONS: ['locations'],
  LOCATION: (id: string) => ['locations', id],
  TAGS: ['tags'],
  TAG: (id: string) => ['tags', id],
  TEMPLATES: ['templates'],
  TEMPLATE: (id: string) => ['templates', id],
  PURCHASE_ORDERS: ['purchase-orders'],
  PURCHASE_ORDER: (id: string) => ['purchase-orders', id],
} as const;

// ==================== MANUFACTURERS ====================

export function useManufacturers() {
  return useQuery({
    queryKey: QUERY_KEYS.MANUFACTURERS,
    queryFn: () => manufacturersService.listManufacturers(),
  });
}

export function useManufacturer(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MANUFACTURER(id),
    queryFn: () => manufacturersService.getManufacturer(id),
    enabled: !!id,
  });
}

export function useCreateManufacturer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManufacturerRequest) =>
      manufacturersService.createManufacturer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANUFACTURERS });
    },
  });
}

export function useUpdateManufacturer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateManufacturerRequest;
    }) => manufacturersService.updateManufacturer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANUFACTURERS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MANUFACTURER(variables.id),
      });
    },
  });
}

export function useDeleteManufacturer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => manufacturersService.deleteManufacturer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MANUFACTURERS });
    },
  });
}

// ==================== SUPPLIERS ====================

export function useSuppliers() {
  return useQuery({
    queryKey: QUERY_KEYS.SUPPLIERS,
    queryFn: () => suppliersService.listSuppliers(),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SUPPLIER(id),
    queryFn: () => suppliersService.getSupplier(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierRequest) =>
      suppliersService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierRequest }) =>
      suppliersService.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SUPPLIER(variables.id),
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
    },
  });
}

// ==================== LOCATIONS ====================

export function useLocations(query?: {
  type?: string;
  parentId?: string;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['locations', query],
    queryFn: async () => {
      const response = await locationsService.listLocations(query);
      // Mapear campos da API para manter consistência com o tipo Location
      return response.locations.map((location: ApiLocation) => ({
        ...location,
        name: location.titulo, // Mapear titulo da API para name do frontend
        type: location.type as LocationType, // Mapear type da API para type do frontend
        locationType: location.type, // Manter o campo original também
      }));
    },
    enabled:
      typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
    retry: (failureCount, error) => {
      // Não tentar novamente se for erro de autenticação
      if (
        error instanceof Error &&
        error.message.includes('User not authorized')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.LOCATION(id),
    queryFn: async () => {
      const response = await locationsService.getLocation(id);
      // Mapear campos da API para manter consistência com o tipo Location
      const location: ApiLocation = response.location;
      return {
        ...location,
        name: location.titulo, // Mapear titulo da API para name do frontend
        type: location.type as LocationType, // Mapear type da API para type do frontend
        locationType: location.type, // Manter o campo original também
      };
    },
    enabled:
      !!id &&
      typeof window !== 'undefined' &&
      !!localStorage.getItem('auth_token'),
    retry: (failureCount, error) => {
      // Não tentar novamente se for erro de autenticação
      if (
        error instanceof Error &&
        error.message.includes('User not authorized')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLocationRequest) => {
      const response = await locationsService.createLocation(data);
      // Mapear campos da API para manter consistência com o tipo Location
      const location: ApiLocation = response.location;
      return {
        ...location,
        name: location.titulo, // Mapear titulo da API para name do frontend
        type: location.type as LocationType,
        locationType: location.type,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateLocationRequest;
    }) => {
      const response = await locationsService.updateLocation(id, data);
      // Mapear campos da API para manter consistência com o tipo Location
      const location: ApiLocation = response.location;
      return {
        ...location,
        name: location.titulo, // Mapear titulo da API para name do frontend
        type: location.type as LocationType,
        locationType: location.type,
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOCATION(variables.id),
      });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationsService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
    },
  });
}

// ==================== TAGS ====================

export function useTags() {
  return useQuery({
    queryKey: QUERY_KEYS.TAGS,
    queryFn: () => tagsService.listTags(),
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TAG(id),
    queryFn: () => tagsService.getTag(id),
    enabled: !!id,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagRequest) => tagsService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAGS });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) =>
      tagsService.updateTag(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAGS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TAG(variables.id),
      });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAGS });
    },
  });
}

// ==================== TEMPLATES ====================

export function useTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.TEMPLATES,
    queryFn: async () => {
      const response = await templatesService.listTemplates();
      return response.templates;
    },
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TEMPLATE(id),
    queryFn: async () => {
      const response = await templatesService.getTemplate(id);
      return response.template;
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTemplateRequest) => {
      const response = await templatesService.createTemplate(data);
      return response.template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTemplateRequest;
    }) => {
      const response = await templatesService.updateTemplate(id, data);
      return response.template;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TEMPLATE(variables.id),
      });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES });
    },
  });
}

// ==================== PURCHASE ORDERS ====================

export function usePurchaseOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.PURCHASE_ORDERS,
    queryFn: () => purchaseOrdersService.listPurchaseOrders(),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PURCHASE_ORDER(id),
    queryFn: () => purchaseOrdersService.getPurchaseOrder(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderRequest) =>
      purchaseOrdersService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PURCHASE_ORDERS });
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePurchaseOrderStatusRequest;
    }) => purchaseOrdersService.updatePurchaseOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PURCHASE_ORDERS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDER(variables.id),
      });
    },
  });
}
