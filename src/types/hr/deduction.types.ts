/**
 * Deduction Types
 * Tipos para deduções
 */

export interface Deduction {
  id: string;
  employeeId: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
  isRecurring: boolean;
  installments?: number | null;
  currentInstallment?: number | null;
  isApplied: boolean;
  appliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeductionData {
  employeeId: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
  isRecurring?: boolean;
  installments?: number;
}
