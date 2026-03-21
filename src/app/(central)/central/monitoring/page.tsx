'use client';

import { CentralCard } from '@/components/central/central-card';
import { CentralPageHeader } from '@/components/central/central-page-header';
import {
  CentralTable,
  CentralTableBody,
  CentralTableCell,
  CentralTableHead,
  CentralTableHeader,
  CentralTableRow,
} from '@/components/central/central-table';
import {
  useIntegrationStatus,
  useRevenueMetrics,
  useSystemHealth,
} from '@/hooks/admin/use-admin';
import type {
  IntegrationStatusReport,
  RevenueMetrics,
  SystemHealth,
} from '@/types/admin';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Clock,
  Database,
  DollarSign,
  Headphones,
  Link2,
  Loader2,
  Radio,
  Sparkles,
  Star,
  Timer,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_HEALTH: SystemHealth = {
  apiUptime: '99.97%',
  databaseStatus: 'ok',
  databaseLatencyMs: 12,
  eventBusStatus: 'ok',
  eventBusEventsPerMinute: 230,
};

const MOCK_INTEGRATIONS: IntegrationStatusReport = {
  byType: [
    {
      type: 'Email (IMAP)',
      connected: 42,
      disconnected: 3,
      error: 1,
      total: 46,
    },
    { type: 'Pagamento', connected: 28, disconnected: 0, error: 0, total: 28 },
    {
      type: 'Nota Fiscal',
      connected: 15,
      disconnected: 2,
      error: 2,
      total: 19,
    },
    { type: 'Webhook', connected: 67, disconnected: 5, error: 0, total: 72 },
    {
      type: 'S3 / Storage',
      connected: 34,
      disconnected: 0,
      error: 0,
      total: 34,
    },
  ],
  errors: [
    {
      tenantName: 'Acme Corp',
      integrationType: 'Nota Fiscal',
      errorMessage: 'Certificado A1 expirado',
      lastCheckAt: '2026-03-21T08:30:00Z',
    },
    {
      tenantName: 'TechFlow Solutions',
      integrationType: 'Email (IMAP)',
      errorMessage: 'Falha na autenticação OAuth',
      lastCheckAt: '2026-03-21T07:15:00Z',
    },
    {
      tenantName: 'Global Trade',
      integrationType: 'Nota Fiscal',
      errorMessage: 'Timeout na SEFAZ',
      lastCheckAt: '2026-03-21T06:45:00Z',
    },
  ],
};

const MOCK_REVENUE: RevenueMetrics = {
  mrr: 12500,
  churnRate: 2.1,
  overageTotal: 340,
  tenantsByStatus: [
    { status: 'Ativo', count: 45 },
    { status: 'Trial', count: 8 },
    { status: 'Suspenso', count: 2 },
    { status: 'Cancelado', count: 5 },
  ],
  upgradesThisMonth: 3,
  downgradesThisMonth: 1,
};

const MOCK_SUPPORT_METRICS = {
  avgFirstResponse: '2h15min',
  avgResolution: '18h',
  satisfaction: '4.2/5',
  aiResolution: '68%',
};

// ─── Components ─────────────────────────────────────────────────────────────────

type HealthStatus = 'ok' | 'warning' | 'error';

function HealthItem({
  label,
  value,
  status,
  icon,
}: {
  label: string;
  value: string;
  status: HealthStatus;
  icon: React.ReactNode;
}) {
  const statusColors: Record<HealthStatus, string> = {
    ok: '#10b981',
    warning: '#f97316',
    error: '#f43f5e',
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{ backgroundColor: 'var(--central-card-bg)' }}
    >
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg"
        style={{
          backgroundColor: `${statusColors[status]}15`,
          color: statusColors[status],
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: statusColors[status] }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--central-text-primary)' }}
          >
            {label}
          </p>
        </div>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'var(--central-text-secondary)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function RevenueCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor =
    trend === 'up'
      ? '#10b981'
      : trend === 'down'
        ? '#f43f5e'
        : 'var(--central-text-secondary)';

  return (
    <CentralCard className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{
            backgroundColor: 'var(--central-avatar-bg)',
            color: 'var(--central-avatar-text)',
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className="text-lg font-bold tabular-nums"
              style={{ color: 'var(--central-text-primary)' }}
            >
              {value}
            </p>
            {trend === 'up' && (
              <TrendingUp
                className="h-3.5 w-3.5"
                style={{ color: trendColor }}
              />
            )}
            {trend === 'down' && (
              <TrendingDown
                className="h-3.5 w-3.5"
                style={{ color: trendColor }}
              />
            )}
          </div>
          <p
            className="text-xs"
            style={{ color: 'var(--central-text-secondary)' }}
          >
            {label}
          </p>
        </div>
      </div>
    </CentralCard>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function MonitoringDashboardPage() {
  const router = useRouter();

  const { data: apiHealth, isLoading: loadingHealth } = useSystemHealth();
  const { data: apiIntegrations, isLoading: loadingIntegrations } =
    useIntegrationStatus();
  const { data: apiRevenue } = useRevenueMetrics();

  const health = apiHealth ?? MOCK_HEALTH;
  const integrations = apiIntegrations ?? MOCK_INTEGRATIONS;
  const revenue = apiRevenue ?? MOCK_REVENUE;

  const dbStatus: HealthStatus =
    health.databaseStatus === 'ok'
      ? 'ok'
      : health.databaseStatus === 'warning'
        ? 'warning'
        : 'error';

  const busStatus: HealthStatus =
    health.eventBusStatus === 'ok'
      ? 'ok'
      : health.eventBusStatus === 'warning'
        ? 'warning'
        : 'error';

  return (
    <div className="px-6 py-5 space-y-4">
      {/* Header */}
      <CentralPageHeader
        title="Monitoramento"
        description="Saúde do sistema, integrações e métricas"
      />

      {/* System Health */}
      <CentralCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity
            className="h-4 w-4"
            style={{ color: 'var(--central-text-secondary)' }}
          />
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--central-text-primary)' }}
          >
            Saúde do Sistema
          </h3>
        </div>

        {loadingHealth ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              className="h-5 w-5 animate-spin"
              style={{ color: 'var(--central-text-muted)' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <HealthItem
              icon={<Activity className="h-4 w-4" />}
              label="API"
              value={`Uptime: ${health.apiUptime}`}
              status="ok"
            />
            <HealthItem
              icon={<Database className="h-4 w-4" />}
              label="Banco de Dados"
              value={`${health.databaseLatencyMs}ms latência média`}
              status={dbStatus}
            />
            <HealthItem
              icon={<Radio className="h-4 w-4" />}
              label="Event Bus"
              value={`${health.eventBusEventsPerMinute} eventos/min`}
              status={busStatus}
            />
          </div>
        )}
      </CentralCard>

      {/* Integration Status */}
      <CentralCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2
              className="h-4 w-4"
              style={{ color: 'var(--central-text-secondary)' }}
            />
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--central-text-primary)' }}
            >
              Status das Integrações
            </h3>
            <span
              className="text-xs"
              style={{ color: 'var(--central-text-muted)' }}
            >
              (todos os tenants)
            </span>
          </div>
          <button
            onClick={() => router.push('/central/monitoring/integrations')}
            className="text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--central-accent)' }}
          >
            Ver detalhes
          </button>
        </div>

        {loadingIntegrations ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              className="h-5 w-5 animate-spin"
              style={{ color: 'var(--central-text-muted)' }}
            />
          </div>
        ) : (
          <CentralTable className="!p-0">
            <CentralTableHeader>
              <CentralTableRow>
                <CentralTableHead>Integração</CentralTableHead>
                <CentralTableHead>Conectados</CentralTableHead>
                <CentralTableHead>Desconectados</CentralTableHead>
                <CentralTableHead>Erros</CentralTableHead>
                <CentralTableHead>Total</CentralTableHead>
              </CentralTableRow>
            </CentralTableHeader>
            <CentralTableBody>
              {integrations.byType.map(item => (
                <CentralTableRow key={item.type}>
                  <CentralTableCell>
                    <span className="font-medium">{item.type}</span>
                  </CentralTableCell>
                  <CentralTableCell>
                    <span
                      style={{ color: '#10b981' }}
                      className="font-semibold tabular-nums"
                    >
                      {item.connected}
                    </span>
                  </CentralTableCell>
                  <CentralTableCell>
                    <span
                      style={{ color: '#f97316' }}
                      className="font-semibold tabular-nums"
                    >
                      {item.disconnected}
                    </span>
                  </CentralTableCell>
                  <CentralTableCell>
                    <span
                      style={{
                        color:
                          item.error > 0
                            ? '#f43f5e'
                            : 'var(--central-text-muted)',
                      }}
                      className="font-semibold tabular-nums"
                    >
                      {item.error}
                    </span>
                  </CentralTableCell>
                  <CentralTableCell>
                    <span className="tabular-nums">{item.total}</span>
                  </CentralTableCell>
                </CentralTableRow>
              ))}
            </CentralTableBody>
          </CentralTable>
        )}
      </CentralCard>

      {/* Revenue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <RevenueCard
          icon={<DollarSign className="h-4 w-4" />}
          label="MRR"
          value={formatCurrency(revenue.mrr)}
          trend="up"
        />
        <RevenueCard
          icon={<ArrowDownRight className="h-4 w-4" />}
          label="Churn"
          value={`${revenue.churnRate}%`}
          trend="down"
        />
        <RevenueCard
          icon={<ArrowUpRight className="h-4 w-4" />}
          label="Overage"
          value={formatCurrency(revenue.overageTotal)}
          trend="neutral"
        />
        <RevenueCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Upgrades este mês"
          value={String(revenue.upgradesThisMonth)}
          trend="up"
        />
      </div>

      {/* AI Usage link */}
      <CentralCard
        hover
        className="p-5 cursor-pointer"
        onClick={() => router.push('/central/monitoring/ai-usage')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                backgroundColor: 'rgba(139,92,246,0.1)',
                color: '#8b5cf6',
              }}
            >
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--central-text-primary)' }}
              >
                Uso de IA
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--central-text-secondary)' }}
              >
                Consumo e custos de IA por tier e tenant
              </p>
            </div>
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--central-accent)' }}
          >
            Ver relatório
          </span>
        </div>
      </CentralCard>

      {/* Support Metrics */}
      <CentralCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Headphones
              className="h-4 w-4"
              style={{ color: 'var(--central-text-secondary)' }}
            />
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--central-text-primary)' }}
            >
              Suporte
            </h3>
          </div>
          <button
            onClick={() => router.push('/central/support')}
            className="text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--central-accent)' }}
          >
            Ver tickets
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--central-card-bg)' }}
          >
            <Timer
              className="h-4 w-4"
              style={{ color: 'var(--central-text-muted)' }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--central-text-primary)' }}
              >
                {MOCK_SUPPORT_METRICS.avgFirstResponse}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--central-text-secondary)' }}
              >
                Tempo médio 1.a resposta
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--central-card-bg)' }}
          >
            <Clock
              className="h-4 w-4"
              style={{ color: 'var(--central-text-muted)' }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--central-text-primary)' }}
              >
                {MOCK_SUPPORT_METRICS.avgResolution}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--central-text-secondary)' }}
              >
                Tempo médio resolução
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--central-card-bg)' }}
          >
            <Star
              className="h-4 w-4"
              style={{ color: 'var(--central-text-muted)' }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--central-text-primary)' }}
              >
                {MOCK_SUPPORT_METRICS.satisfaction}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--central-text-secondary)' }}
              >
                Satisfação
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--central-card-bg)' }}
          >
            <Sparkles
              className="h-4 w-4"
              style={{ color: 'var(--central-text-muted)' }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--central-text-primary)' }}
              >
                {MOCK_SUPPORT_METRICS.aiResolution}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--central-text-secondary)' }}
              >
                Resolvidos por IA
              </p>
            </div>
          </div>
        </div>
      </CentralCard>
    </div>
  );
}
