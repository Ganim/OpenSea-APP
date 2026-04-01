'use client';

import { useQuery } from '@tanstack/react-query';
import { hrAnalyticsService } from '@/services/hr';

// ============================================================================
// TYPES
// ============================================================================

export interface ComplianceAlert {
  id: string;
  type: 'medical_exam_expiring' | 'vacation_overdue';
  severity: 'warning' | 'critical';
  employeeId: string;
  employeeName: string;
  description: string;
  detail: string;
  link: string;
}

export interface BirthdayEmployee {
  id: string;
  fullName: string;
  photoUrl?: string | null;
  birthDate: string;
  departmentName: string;
  dayOfMonth: number;
}

export interface ProbationEnding {
  id: string;
  fullName: string;
  hireDate: string;
  departmentName: string;
  daysRemaining: number;
  probationEndDate: string;
}

export interface TurnoverDataPoint {
  month: string;
  rate: number;
  terminations: number;
  avgHeadcount: number;
}

export interface HRAnalyticsData {
  // KPIs
  totalEmployees: number;
  pendingOvertime: number;
  activeAbsences: number;
  currentPayrollNet: number;
  pendingApprovals: number;
  overdueVacations: number;

  // Chart data
  employeesByDepartment: { name: string; count: number }[];
  employeesByContractType: { name: string; count: number }[];
  absencesByType: { name: string; count: number }[];
  payrollTrend: { month: string; bruto: number; liquido: number }[];
  overtimeTrend: { month: string; horas: number; count: number }[];
  bonusesVsDeductions: {
    month: string;
    bonificacoes: number;
    deducoes: number;
  }[];
  turnoverTrend: TurnoverDataPoint[];

  // New widgets data
  complianceAlerts: ComplianceAlert[];
  birthdaysThisMonth: BirthdayEmployee[];
  probationEndings: ProbationEnding[];
}

// ============================================================================
// HOOK
// ============================================================================

export function useHRAnalytics() {
  return useQuery({
    queryKey: ['hr', 'analytics'],
    queryFn: async () => {
      const data = await hrAnalyticsService.getAnalytics();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: false,
  });
}
