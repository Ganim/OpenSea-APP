/**
 * Payroll Types
 * Tipos para folha de pagamento
 */

export type PayrollStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'CALCULATED'
  | 'APPROVED'
  | 'PAID'
  | 'CANCELLED';

export type PayrollItemType =
  | 'BASE_SALARY'
  | 'OVERTIME'
  | 'NIGHT_SHIFT'
  | 'HAZARD_PAY'
  | 'UNHEALTHY_PAY'
  | 'BONUS'
  | 'COMMISSION'
  | 'VACATION_PAY'
  | 'THIRTEENTH_SALARY'
  | 'PROFIT_SHARING'
  | 'TRANSPORTATION_ALLOWANCE'
  | 'MEAL_ALLOWANCE'
  | 'HEALTH_PLAN'
  | 'DENTAL_PLAN'
  | 'INSS'
  | 'IRRF'
  | 'FGTS'
  | 'UNION_CONTRIBUTION'
  | 'ADVANCE_DEDUCTION'
  | 'ABSENCE_DEDUCTION'
  | 'OTHER_EARNING'
  | 'OTHER_DEDUCTION';

export interface Payroll {
  id: string;
  tenantId: string;
  referenceMonth: number;
  referenceYear: number;
  status: PayrollStatus;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  processedBy?: string | null;
  processedAt?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  paidBy?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  employeeId: string;
  type: PayrollItemType;
  description: string;
  amount: number;
  isDeduction: boolean;
  referenceId?: string | null;
  referenceType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollData {
  referenceMonth: number;
  referenceYear: number;
}
