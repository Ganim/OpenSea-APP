'use client';

import { useQuery } from '@tanstack/react-query';
import {
  employeesService,
  overtimeService,
  absencesService,
  payrollService,
  bonusesService,
  deductionsService,
} from '@/services/hr';
import type { Employee, Overtime, Absence, Payroll, Bonus, Deduction } from '@/types/hr';

// ============================================================================
// TYPES
// ============================================================================

export interface HRAnalyticsData {
  // KPIs
  totalEmployees: number;
  pendingOvertime: number;
  activeAbsences: number;
  currentPayrollNet: number;

  // Chart data
  employeesByDepartment: { name: string; count: number }[];
  employeesByContractType: { name: string; count: number }[];
  absencesByType: { name: string; count: number }[];
  payrollTrend: { month: string; bruto: number; liquido: number }[];
  overtimeTrend: { month: string; horas: number; count: number }[];
  bonusesVsDeductions: { month: string; bonificacoes: number; deducoes: number }[];
}

// ============================================================================
// LABELS
// ============================================================================

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CLT: 'CLT',
  PJ: 'PJ',
  INTERN: 'Estagiário',
  TEMPORARY: 'Temporário',
  APPRENTICE: 'Aprendiz',
};

const ABSENCE_TYPE_LABELS: Record<string, string> = {
  VACATION: 'Férias',
  SICK_LEAVE: 'Atestado',
  PERSONAL_LEAVE: 'Pessoal',
  MATERNITY_LEAVE: 'Maternidade',
  PATERNITY_LEAVE: 'Paternidade',
  BEREAVEMENT_LEAVE: 'Luto',
  WEDDING_LEAVE: 'Casamento',
  MEDICAL_APPOINTMENT: 'Consulta',
  JURY_DUTY: 'Júri',
  UNPAID_LEAVE: 'S/ Remuneração',
  OTHER: 'Outro',
};

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

// ============================================================================
// HELPERS
// ============================================================================

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

function getMonthSortKey(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getFullYear() * 100 + d.getMonth();
}

function getLast6Months(): { key: string; sortKey: number }[] {
  const months: { key: string; sortKey: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      sortKey: d.getFullYear() * 100 + d.getMonth(),
    });
  }
  return months;
}

// ============================================================================
// AGGREGATION
// ============================================================================

function aggregate(
  employees: Employee[],
  overtime: Overtime[],
  absences: Absence[],
  payrolls: Payroll[],
  bonuses: Bonus[],
  deductions: Deduction[],
): HRAnalyticsData {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const last6 = getLast6Months();

  // -- KPIs --
  const activeEmployees = employees.filter(e => e.status !== 'TERMINATED' && e.status !== 'INACTIVE');
  const pendingOvertime = overtime.filter(o => o.approved === null).length;
  const activeAbsences = absences.filter(a => a.status === 'IN_PROGRESS' || a.status === 'APPROVED').length;
  const currentPayroll = payrolls.find(
    p => p.referenceMonth === currentMonth && p.referenceYear === currentYear
  );

  // -- Employees by Department --
  const deptGroups = groupBy(activeEmployees, e => e.department?.name ?? 'Sem Departamento');
  const employeesByDepartment = Object.entries(deptGroups)
    .map(([name, items]) => ({ name, count: items.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // -- Employees by Contract Type --
  const contractGroups = groupBy(activeEmployees, e => e.contractType);
  const employeesByContractType = Object.entries(contractGroups)
    .map(([type, items]) => ({ name: CONTRACT_TYPE_LABELS[type] ?? type, count: items.length }))
    .sort((a, b) => b.count - a.count);

  // -- Absences by Type --
  const absenceGroups = groupBy(absences, a => a.type);
  const absencesByType = Object.entries(absenceGroups)
    .map(([type, items]) => ({ name: ABSENCE_TYPE_LABELS[type] ?? type, count: items.length }))
    .sort((a, b) => b.count - a.count);

  // -- Payroll Trend (last 6 months) --
  const payrollMap = new Map<string, { bruto: number; liquido: number }>();
  for (const p of payrolls) {
    const monthIdx = p.referenceMonth - 1;
    const key = `${MONTH_NAMES[monthIdx]} ${String(p.referenceYear).slice(2)}`;
    const existing = payrollMap.get(key) ?? { bruto: 0, liquido: 0 };
    payrollMap.set(key, {
      bruto: existing.bruto + p.totalGross,
      liquido: existing.liquido + p.totalNet,
    });
  }
  const payrollTrend = last6.map(m => ({
    month: m.key,
    bruto: payrollMap.get(m.key)?.bruto ?? 0,
    liquido: payrollMap.get(m.key)?.liquido ?? 0,
  }));

  // -- Overtime Trend (last 6 months) --
  const overtimeByMonth = new Map<string, { horas: number; count: number }>();
  for (const o of overtime) {
    const key = getMonthKey(o.date);
    const sortKey = getMonthSortKey(o.date);
    if (sortKey >= last6[0].sortKey) {
      const existing = overtimeByMonth.get(key) ?? { horas: 0, count: 0 };
      overtimeByMonth.set(key, {
        horas: existing.horas + o.hours,
        count: existing.count + 1,
      });
    }
  }
  const overtimeTrend = last6.map(m => ({
    month: m.key,
    horas: overtimeByMonth.get(m.key)?.horas ?? 0,
    count: overtimeByMonth.get(m.key)?.count ?? 0,
  }));

  // -- Bonuses vs Deductions (last 6 months) --
  const bonusByMonth = new Map<string, number>();
  for (const b of bonuses) {
    const key = getMonthKey(b.date);
    const sortKey = getMonthSortKey(b.date);
    if (sortKey >= last6[0].sortKey) {
      bonusByMonth.set(key, (bonusByMonth.get(key) ?? 0) + b.amount);
    }
  }
  const deductionByMonth = new Map<string, number>();
  for (const d of deductions) {
    const key = getMonthKey(d.date);
    const sortKey = getMonthSortKey(d.date);
    if (sortKey >= last6[0].sortKey) {
      deductionByMonth.set(key, (deductionByMonth.get(key) ?? 0) + d.amount);
    }
  }
  const bonusesVsDeductions = last6.map(m => ({
    month: m.key,
    bonificacoes: bonusByMonth.get(m.key) ?? 0,
    deducoes: deductionByMonth.get(m.key) ?? 0,
  }));

  return {
    totalEmployees: activeEmployees.length,
    pendingOvertime,
    activeAbsences,
    currentPayrollNet: currentPayroll?.totalNet ?? 0,
    employeesByDepartment,
    employeesByContractType,
    absencesByType,
    payrollTrend,
    overtimeTrend,
    bonusesVsDeductions,
  };
}

// ============================================================================
// HOOK
// ============================================================================

async function fetchAnalyticsData(): Promise<HRAnalyticsData> {
  const [
    employeesResult,
    overtimeResult,
    absencesResult,
    payrollsResult,
    bonusesResult,
    deductionsResult,
  ] = await Promise.allSettled([
    employeesService.listEmployees({ page: 1, perPage: 100 }),
    overtimeService.list({ perPage: 100 }),
    absencesService.list({ perPage: 100 }),
    payrollService.list({ perPage: 100 }),
    bonusesService.list({ perPage: 100 }),
    deductionsService.list({ perPage: 100 }),
  ]);

  const employees = employeesResult.status === 'fulfilled' ? employeesResult.value.employees : [];
  const overtime = overtimeResult.status === 'fulfilled' ? overtimeResult.value.overtime : [];
  const absences = absencesResult.status === 'fulfilled' ? absencesResult.value.absences : [];
  const payrolls = payrollsResult.status === 'fulfilled' ? payrollsResult.value.payrolls : [];
  const bonuses = bonusesResult.status === 'fulfilled' ? bonusesResult.value.bonuses : [];
  const deductions = deductionsResult.status === 'fulfilled' ? deductionsResult.value.deductions : [];

  return aggregate(employees, overtime, absences, payrolls, bonuses, deductions);
}

export function useHRAnalytics() {
  return useQuery({
    queryKey: ['hr', 'analytics'],
    queryFn: fetchAnalyticsData,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: false,
  });
}
