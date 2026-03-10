/**
 * Bonus Types
 * Tipos para bonificações
 */

export interface Bonus {
  id: string;
  employeeId: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBonusData {
  employeeId: string;
  name: string;
  amount: number;
  reason: string;
  date: string;
}
