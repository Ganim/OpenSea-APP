'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { Header } from '@/components/layout/header';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Clock,
  UserX,
  DollarSign,
} from 'lucide-react';
import { useHRAnalytics } from '../_shared/hooks/use-hr-analytics';
import { CHART_COLORS, CHART_COLOR_SCALE, PIE_COLOR_SCALE } from '@/lib/chart-colors';

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, subtitle, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1">{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CHART CARD
// ============================================================================

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

function ChartCard({ title, children, isLoading, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CURRENCY FORMATTER
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTooltipCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  isCurrency?: boolean;
}

function CustomTooltip({ active, payload, label, isCurrency }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {isCurrency ? formatTooltipCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function HROverviewPage() {
  const { data, isLoading } = useHRAnalytics();

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Visão Geral', href: '/hr/overview' },
          ]}
        />
        <Header
          title="Visão Geral"
          description="Indicadores e análises do módulo de Recursos Humanos"
        />
      </PageHeader>

      <PageBody>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Funcionários Ativos"
            value={data?.totalEmployees ?? 0}
            icon={Users}
            iconBg="bg-blue-100 dark:bg-blue-500/20"
            iconColor="text-primary"
            isLoading={isLoading}
          />
          <StatCard
            title="Horas Extras Pendentes"
            value={data?.pendingOvertime ?? 0}
            icon={Clock}
            iconBg="bg-amber-100 dark:bg-amber-500/20"
            iconColor="text-amber-600 dark:text-amber-400"
            subtitle="Aguardando aprovação"
            isLoading={isLoading}
          />
          <StatCard
            title="Ausências Ativas"
            value={data?.activeAbsences ?? 0}
            icon={UserX}
            iconBg="bg-rose-100 dark:bg-rose-500/20"
            iconColor="text-rose-600 dark:text-rose-400"
            subtitle="Em andamento ou aprovadas"
            isLoading={isLoading}
          />
          <StatCard
            title="Folha do Mês"
            value={data ? formatCurrency(data.currentPayrollNet) : 'R$ 0'}
            icon={DollarSign}
            iconBg="bg-emerald-100 dark:bg-emerald-500/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
            subtitle="Valor líquido"
            isLoading={isLoading}
          />
        </div>

        {/* Row 1: Employees by Department + Contract Types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Funcionários por Departamento"
            isLoading={isLoading}
            className="lg:col-span-2"
          >
            {data && data.employeesByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.employeesByDepartment} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" allowDecimals={false} className="text-xs" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Funcionários" radius={[0, 4, 4, 0]}>
                    {data.employeesByDepartment.map((_, i) => (
                      <Cell key={i} fill={CHART_COLOR_SCALE[i % CHART_COLOR_SCALE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhum funcionário cadastrado" />
            )}
          </ChartCard>

          <ChartCard title="Tipos de Contrato" isLoading={isLoading}>
            {data && data.employeesByContractType.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.employeesByContractType}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.employeesByContractType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLOR_SCALE[i % PIE_COLOR_SCALE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhum funcionário cadastrado" />
            )}
          </ChartCard>
        </div>

        {/* Row 2: Payroll Trend + Overtime Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Folha de Pagamento (6 meses)" isLoading={isLoading}>
            {data && data.payrollTrend.some(p => p.bruto > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.payrollTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCurrency} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip isCurrency />} />
                  <Legend />
                  <Bar dataKey="bruto" name="Bruto" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="liquido" name="Líquido" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma folha processada nos últimos 6 meses" />
            )}
          </ChartCard>

          <ChartCard title="Horas Extras (6 meses)" isLoading={isLoading}>
            {data && data.overtimeTrend.some(o => o.horas > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.overtimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="horas"
                    name="Horas"
                    stroke={CHART_COLORS.amber}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Registros"
                    stroke={CHART_COLORS.violet}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma hora extra nos últimos 6 meses" />
            )}
          </ChartCard>
        </div>

        {/* Row 3: Absences by Type + Bonuses vs Deductions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Ausências por Tipo" isLoading={isLoading}>
            {data && data.absencesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.absencesByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Ocorrências" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]}>
                    {data.absencesByType.map((_, i) => (
                      <Cell key={i} fill={CHART_COLOR_SCALE[i % CHART_COLOR_SCALE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma ausência registrada" />
            )}
          </ChartCard>

          <ChartCard title="Bonificações vs Deduções (6 meses)" isLoading={isLoading}>
            {data && data.bonusesVsDeductions.some(b => b.bonificacoes > 0 || b.deducoes > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.bonusesVsDeductions}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCurrency} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip isCurrency />} />
                  <Legend />
                  <Bar dataKey="bonificacoes" name="Bonificações" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deducoes" name="Deduções" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma bonificação ou dedução nos últimos 6 meses" />
            )}
          </ChartCard>
        </div>
      </PageBody>
    </PageLayout>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
      {message}
    </div>
  );
}
