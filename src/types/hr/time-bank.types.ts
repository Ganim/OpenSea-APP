/**
 * Time Bank Types
 * Tipos para banco de horas
 */

export interface TimeBank {
  id: string;
  employeeId: string;
  balance: number;
  year: number;
  hasPositiveBalance: boolean;
  hasNegativeBalance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditDebitTimeBankData {
  employeeId: string;
  hours: number;
  year?: number;
}

export interface AdjustTimeBankData {
  employeeId: string;
  newBalance: number;
  year?: number;
}
