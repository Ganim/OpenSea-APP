/**
 * Portal do Contador — Visualização pública (autenticada via token na URL)
 *
 * Acesso de leitura: lançamentos, categorias, DRE, balanço
 * Exportação: SPED ECD
 * Seletor de período (ano/mês)
 * Branding: OpenSea logo + "Portal do Contador"
 * Sem capacidade de edição
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calculator,
  Calendar,
  Download,
  FileSpreadsheet,
  FolderTree,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountantPortalService } from '@/services/finance/accountant.service';
import type {
  AccountantPortalData,
  AccountantDreReport,
  AccountantDataCategory,
} from '@/types/finance';
import { toast } from 'sonner';

// =============================================================================
// HELPERS
// =============================================================================

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    OVERDUE: 'Atrasado',
    PAID: 'Pago',
    RECEIVED: 'Recebido',
    PARTIALLY_PAID: 'Parc. Pago',
    CANCELLED: 'Cancelado',
    SCHEDULED: 'Agendado',
  };
  return map[status] ?? status;
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    OVERDUE: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    RECEIVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    PARTIALLY_PAID: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
    CANCELLED: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    SCHEDULED: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  };
  return map[status] ?? '';
}

// =============================================================================
// SUMMARY CARDS
// =============================================================================

function SummaryCards({
  summary,
}: {
  summary: AccountantPortalData['summary'];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <ArrowUpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {formatMoney(summary.totalRevenue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10">
              <ArrowDownCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                {formatMoney(summary.totalExpenses)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
              <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resultado</p>
              <p
                className={`text-lg font-semibold ${
                  summary.netResult >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatMoney(summary.netResult)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10">
              <FileSpreadsheet className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lançamentos</p>
              <p className="text-lg font-semibold">{summary.entryCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// ENTRIES TABLE
// =============================================================================

function EntriesTable({
  entries,
}: {
  entries: AccountantPortalData['entries'];
}) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum lançamento encontrado para este período.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-20">Tipo</TableHead>
                <TableHead className="w-28 text-right">Valor</TableHead>
                <TableHead className="w-24">Vencimento</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead>Categoria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">
                    {entry.code}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {entry.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        entry.type === 'RECEIVABLE'
                          ? 'text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800'
                          : 'text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-800'
                      }
                    >
                      {entry.type === 'RECEIVABLE' ? 'Receber' : 'Pagar'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatMoney(entry.actualAmount ?? entry.expectedAmount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(entry.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(entry.status)} variant="secondary">
                      {getStatusLabel(entry.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {entry.categoryName ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// CATEGORIES TAB
// =============================================================================

function CategoriesTab({
  categories,
}: {
  categories: AccountantDataCategory[];
}) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma categoria cadastrada.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-28">Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {cat.type === 'EXPENSE'
                      ? 'Despesa'
                      : cat.type === 'REVENUE'
                        ? 'Receita'
                        : 'Ambos'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// DRE TAB
// =============================================================================

function DreTab({ dre }: { dre: AccountantDreReport | null }) {
  if (!dre) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando DRE...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Annual Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Demonstração do Resultado — {dre.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Receitas Operacionais</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {formatMoney(dre.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">(-) Despesas Operacionais</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">
                {formatMoney(dre.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-lg font-semibold">
              <span>(=) Resultado do Exercício</span>
              <span
                className={
                  dre.netResult >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }
              >
                {formatMoney(dre.netResult)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Breakdown Mensal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dre.monthly.map((m) => (
                <TableRow key={m.month}>
                  <TableCell>{MONTHS[m.month - 1]}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">
                    {formatMoney(m.revenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-rose-600 dark:text-rose-400">
                    {formatMoney(m.expenses)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm font-medium ${
                      m.result >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatMoney(m.result)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <Calculator className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function AccountantPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [activeTab, setActiveTab] = useState('entries');

  const [data, setData] = useState<AccountantPortalData | null>(null);
  const [dre, setDre] = useState<AccountantDreReport | null>(null);
  const [categories, setCategories] = useState<AccountantDataCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingSpEd, setExportingSped] = useState(false);

  const service = useMemo(
    () => new AccountantPortalService(token),
    [token],
  );

  // Load data
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [portalData, categoriesData] = await Promise.all([
          service.getData(year, month),
          service.getCategories(),
        ]);

        if (cancelled) return;
        setData(portalData);
        setCategories(categoriesData.categories);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : 'Token inválido ou expirado.',
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [service, year, month]);

  // Load DRE when tab changes
  useEffect(() => {
    if (activeTab !== 'dre') return;

    let cancelled = false;

    async function loadDre() {
      try {
        const dreData = await service.getDre(year);
        if (!cancelled) setDre(dreData);
      } catch {
        // Silent — already showing data/error state
      }
    }

    loadDre();
    return () => {
      cancelled = true;
    };
  }, [service, year, activeTab]);

  const handleExportSped = async () => {
    setExportingSped(true);
    try {
      const blob = await service.exportSped({ year, format: 'ECD' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SPED_ECD_${year}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Arquivo SPED exportado com sucesso');
    } catch {
      toast.error('Erro ao exportar SPED');
    } finally {
      setExportingSped(false);
    }
  };

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
              <Calculator className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Portal do Contador
              </h1>
              <p className="text-xs text-muted-foreground">
                OpenSea — Acesso de Leitura
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((name, idx) => (
                    <SelectItem key={idx} value={String(idx + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger className="w-[90px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(
                    (y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* SPED Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSped}
              disabled={exportingSpEd || isLoading}
              className="h-9"
            >
              {exportingSpEd ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              SPED ECD
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : data ? (
          <>
            {/* Summary */}
            <SummaryCards summary={data.summary} />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-12 mb-4">
                <TabsTrigger value="entries" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Lançamentos
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-2">
                  <FolderTree className="h-4 w-4" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="dre" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  DRE
                </TabsTrigger>
              </TabsList>

              <TabsContent value="entries">
                <EntriesTable entries={data.entries} />
              </TabsContent>

              <TabsContent value="categories">
                <CategoriesTab categories={categories} />
              </TabsContent>

              <TabsContent value="dre">
                <DreTab dre={dre} />
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
          Portal do Contador — OpenSea ERP. Todos os dados são somente leitura.
        </div>
      </footer>
    </div>
  );
}
