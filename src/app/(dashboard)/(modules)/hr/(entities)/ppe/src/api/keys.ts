/**
 * PPE (EPI) Query Keys
 */

export interface PPEItemFilters {
  category?: string;
  isActive?: string;
  lowStockOnly?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface PPEAssignmentFilters {
  employeeId?: string;
  ppeItemId?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export const ppeKeys = {
  all: ['ppe'] as const,
  items: () => [...ppeKeys.all, 'items'] as const,
  itemLists: () => [...ppeKeys.items(), 'list'] as const,
  itemList: (filters?: PPEItemFilters) =>
    [...ppeKeys.itemLists(), filters ?? {}] as const,
  itemDetails: () => [...ppeKeys.items(), 'detail'] as const,
  itemDetail: (id: string) => [...ppeKeys.itemDetails(), id] as const,
  assignments: () => [...ppeKeys.all, 'assignments'] as const,
  assignmentLists: () => [...ppeKeys.assignments(), 'list'] as const,
  assignmentList: (filters?: PPEAssignmentFilters) =>
    [...ppeKeys.assignmentLists(), filters ?? {}] as const,
  expiring: (daysAhead?: number) =>
    [...ppeKeys.assignments(), 'expiring', daysAhead ?? 30] as const,
} as const;

export default ppeKeys;
