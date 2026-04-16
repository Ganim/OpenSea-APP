/**
 * OpenSea OS - HR Vacation Conflict Heatmap
 *
 * Helpers para calcular sobreposições de ausências por semana e
 * identificar semanas com risco de conflito (mais de 30% do quadro
 * ativo de uma área fora simultaneamente).
 */

import {
  addDays,
  eachWeekOfInterval,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  max,
  min,
  startOfDay,
  startOfWeek,
} from 'date-fns';

/* ===========================================
   CONSTANTS
   =========================================== */

/** Limite default de % do quadro fora ao mesmo tempo para flag de conflito. */
export const DEFAULT_CONFLICT_THRESHOLD = 0.3;

/* ===========================================
   TYPES
   =========================================== */

/** Item de ausência mínimo para o cálculo de conflito. */
export interface ConflictAbsenceItem {
  employeeId: string;
  startDate: string | Date;
  endDate: string | Date;
  /** Departamento para agrupar conflitos. Null/undefined = sem departamento. */
  departmentId?: string | null;
  /** Nome do departamento (apenas para apresentação). */
  departmentName?: string | null;
}

/** Departamento com headcount ativo para cálculo do ratio. */
export interface ConflictDepartmentRef {
  id: string;
  name: string;
  /** Total de funcionários ativos no departamento. */
  activeHeadcount: number;
}

export interface WeekRange {
  /** Início da semana (segunda-feira por convenção brasileira). */
  start: Date;
  /** Fim da semana (domingo). */
  end: Date;
}

export interface DepartmentConflict {
  departmentId: string;
  departmentName: string;
  /** Quantos funcionários distintos do dept ficarão fora na semana. */
  absentCount: number;
  /** Total ativo do dept usado como divisor. */
  totalActive: number;
  /** Razão entre absentCount e totalActive (0–1). */
  ratio: number;
}

export interface WeekConflictReport {
  week: WeekRange;
  /** Apenas departamentos com ratio acima do threshold. */
  conflictingDepartments: DepartmentConflict[];
  /** Soma total de funcionários distintos fora na semana (toda a empresa). */
  totalAbsentEmployees: number;
}

export interface CalculateConflictsParams {
  /** Ausências cobrindo o intervalo visível. */
  absences: ConflictAbsenceItem[];
  /** Departamentos com headcount ativo. */
  departments: ConflictDepartmentRef[];
  /** Início do range visível (ex.: primeiro dia da view). */
  rangeStart: Date;
  /** Fim do range visível (ex.: último dia da view). */
  rangeEnd: Date;
  /** Threshold opcional (default 0.3 = 30%). */
  threshold?: number;
}

/* ===========================================
   HELPERS
   =========================================== */

/**
 * Verifica se uma ausência intersecta uma semana.
 */
export function absenceIntersectsWeek(
  absenceStart: Date,
  absenceEnd: Date,
  week: WeekRange
): boolean {
  const intervalStart = startOfDay(week.start);
  const intervalEnd = startOfDay(week.end);

  if (isAfter(absenceStart, intervalEnd)) return false;
  if (isBefore(absenceEnd, intervalStart)) return false;

  return (
    isSameDay(absenceStart, intervalEnd) ||
    isSameDay(absenceEnd, intervalStart) ||
    isWithinInterval(absenceStart, {
      start: intervalStart,
      end: intervalEnd,
    }) ||
    isWithinInterval(absenceEnd, { start: intervalStart, end: intervalEnd }) ||
    (isBefore(absenceStart, intervalStart) && isAfter(absenceEnd, intervalEnd))
  );
}

/**
 * Calcula a interseção (em dias) entre uma ausência e uma semana.
 * Útil para cenários onde a sobreposição parcial deve contar diferente
 * (não é o caso da heatmap atual, mas exposto para futuro).
 */
export function intersectionDays(
  absenceStart: Date,
  absenceEnd: Date,
  week: WeekRange
): number {
  const overlapStart = max([absenceStart, week.start]);
  const overlapEnd = min([absenceEnd, week.end]);
  if (isAfter(overlapStart, overlapEnd)) return 0;
  const diffMs = overlapEnd.getTime() - overlapStart.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Lista as semanas (segunda → domingo) que cobrem o intervalo dado.
 */
export function listWeeksInRange(
  rangeStart: Date,
  rangeEnd: Date
): WeekRange[] {
  const weekStartsOn = 1; // Segunda-feira
  const starts = eachWeekOfInterval(
    { start: rangeStart, end: rangeEnd },
    { weekStartsOn }
  );
  return starts.map(weekStart => ({
    start: startOfWeek(weekStart, { weekStartsOn }),
    end: endOfWeek(weekStart, { weekStartsOn }),
  }));
}

/* ===========================================
   MAIN CALCULATION
   =========================================== */

/**
 * Para cada semana visível, calcula:
 * - quais departamentos ultrapassam o threshold de pessoas fora;
 * - o total geral de funcionários distintos ausentes.
 *
 * Retorna apenas semanas que contenham pelo menos um departamento em conflito.
 */
export function calculateWeeklyConflicts(
  params: CalculateConflictsParams
): WeekConflictReport[] {
  const {
    absences,
    departments,
    rangeStart,
    rangeEnd,
    threshold = DEFAULT_CONFLICT_THRESHOLD,
  } = params;

  const weeks = listWeeksInRange(rangeStart, rangeEnd);
  const departmentLookup = new Map(departments.map(dept => [dept.id, dept]));

  const reports: WeekConflictReport[] = [];

  for (const week of weeks) {
    // employeeIds distintos por departamento dentro desta semana
    const employeesByDepartment = new Map<string, Set<string>>();
    const allAbsentEmployees = new Set<string>();

    for (const absence of absences) {
      const start = startOfDay(new Date(absence.startDate));
      const end = startOfDay(new Date(absence.endDate));

      if (!absenceIntersectsWeek(start, end, week)) continue;

      allAbsentEmployees.add(absence.employeeId);

      const departmentId = absence.departmentId ?? '__no_department__';
      if (!employeesByDepartment.has(departmentId)) {
        employeesByDepartment.set(departmentId, new Set());
      }
      employeesByDepartment.get(departmentId)!.add(absence.employeeId);
    }

    const conflictingDepartments: DepartmentConflict[] = [];

    for (const [departmentId, employeeSet] of employeesByDepartment) {
      const department = departmentLookup.get(departmentId);
      if (!department) continue;
      if (department.activeHeadcount <= 0) continue;

      const absentCount = employeeSet.size;
      const ratio = absentCount / department.activeHeadcount;

      if (ratio >= threshold) {
        conflictingDepartments.push({
          departmentId,
          departmentName: department.name,
          absentCount,
          totalActive: department.activeHeadcount,
          ratio,
        });
      }
    }

    if (conflictingDepartments.length > 0) {
      conflictingDepartments.sort((a, b) => b.ratio - a.ratio);
      reports.push({
        week,
        conflictingDepartments,
        totalAbsentEmployees: allAbsentEmployees.size,
      });
    }
  }

  return reports;
}

/* ===========================================
   "QUEM ESTÁ FORA" HELPERS
   =========================================== */

export interface AbsenceWithDates {
  employeeId: string;
  startDate: string | Date;
  endDate: string | Date;
}

/**
 * Dado um conjunto de ausências, retorna apenas as que cobrem a data passada.
 */
export function filterAbsencesActiveOn<T extends AbsenceWithDates>(
  absences: T[],
  referenceDate: Date
): T[] {
  const target = startOfDay(referenceDate);
  return absences.filter(absence => {
    const start = startOfDay(new Date(absence.startDate));
    const end = startOfDay(new Date(absence.endDate));
    return (
      (isSameDay(start, target) ||
        isBefore(start, target) ||
        isAfter(start, target) === false) &&
      (isSameDay(end, target) || isAfter(end, target))
    );
  });
}

/**
 * Filtra ausências que iniciam no intervalo (today, today+days].
 */
export function filterAbsencesStartingWithin<T extends AbsenceWithDates>(
  absences: T[],
  referenceDate: Date,
  days: number
): T[] {
  const today = startOfDay(referenceDate);
  const limit = startOfDay(addDays(referenceDate, days));
  return absences.filter(absence => {
    const start = startOfDay(new Date(absence.startDate));
    return isAfter(start, today) && !isAfter(start, limit);
  });
}
