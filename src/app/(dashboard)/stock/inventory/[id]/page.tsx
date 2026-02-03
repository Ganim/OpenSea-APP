'use client';

import { use, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Loader2,
  Package,
  Play,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import type {
  InventoryCycle,
  InventoryCount,
  InventoryCountStatus,
} from '@/types/stock';

interface PageProps {
  params: Promise<{ id: string }>;
}

const COUNT_STATUS_CONFIG: Record<
  InventoryCountStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pendente',
    className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  },
  COUNTED: {
    label: 'Contado',
    className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  },
  ADJUSTED: {
    label: 'Ajustado',
    className: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  },
  VERIFIED: {
    label: 'Verificado',
    className: 'bg-green-500/20 text-green-700 dark:text-green-400',
  },
};

// Mock data for cycles
const MOCK_CYCLES: Record<string, InventoryCycle> = {
  '1': {
    id: '1',
    name: 'Contagem Mensal - Janeiro 2025',
    description: 'Contagem completa do estoque para fechamento mensal',
    status: 'COMPLETED',
    totalBins: 150,
    countedBins: 150,
    adjustedBins: 5,
    createdAt: new Date('2025-01-02'),
    startedAt: new Date('2025-01-02T08:00:00'),
    completedAt: new Date('2025-01-02T18:00:00'),
  },
  '2': {
    id: '2',
    name: 'Contagem Parcial - Setor A',
    description: 'Contagem do setor A para verificação de divergências',
    status: 'IN_PROGRESS',
    totalBins: 45,
    countedBins: 28,
    adjustedBins: 2,
    createdAt: new Date('2025-01-10'),
    startedAt: new Date('2025-01-10T09:00:00'),
  },
  '3': {
    id: '3',
    name: 'Contagem de Produtos de Alto Valor',
    description: 'Verificação especial de itens com valor acima de R$ 1.000',
    status: 'DRAFT',
    totalBins: 20,
    countedBins: 0,
    adjustedBins: 0,
    createdAt: new Date('2025-01-15'),
  },
};

// Mock counts for cycle 2
const MOCK_COUNTS: InventoryCount[] = [
  {
    id: 'c1',
    cycleId: '2',
    binId: 'bin-001',
    bin: {
      id: 'bin-001',
      code: 'A-01-01',
      name: 'Prateleira A1',
      type: 'BIN',
      isActive: true,
      createdAt: new Date(),
    },
    status: 'COUNTED',
    expectedQuantity: 50,
    countedQuantity: 48,
    variance: -2,
    countedAt: new Date('2025-01-10T10:30:00'),
  },
  {
    id: 'c2',
    cycleId: '2',
    binId: 'bin-002',
    bin: {
      id: 'bin-002',
      code: 'A-01-02',
      name: 'Prateleira A2',
      type: 'BIN',
      isActive: true,
      createdAt: new Date(),
    },
    status: 'ADJUSTED',
    expectedQuantity: 30,
    countedQuantity: 35,
    variance: 5,
    countedAt: new Date('2025-01-10T11:00:00'),
    adjustedAt: new Date('2025-01-10T14:00:00'),
  },
  {
    id: 'c3',
    cycleId: '2',
    binId: 'bin-003',
    bin: {
      id: 'bin-003',
      code: 'A-02-01',
      name: 'Prateleira A3',
      type: 'BIN',
      isActive: true,
      createdAt: new Date(),
    },
    status: 'PENDING',
    expectedQuantity: 25,
  },
  {
    id: 'c4',
    cycleId: '2',
    binId: 'bin-004',
    bin: {
      id: 'bin-004',
      code: 'A-02-02',
      name: 'Prateleira A4',
      type: 'BIN',
      isActive: true,
      createdAt: new Date(),
    },
    status: 'PENDING',
    expectedQuantity: 40,
  },
];

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR');
}

export default function InventoryCycleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState('counts');
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [countInputs, setCountInputs] = useState<Record<string, string>>({});
  const [expandedBins, setExpandedBins] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - API not yet implemented
  const cycle = MOCK_CYCLES[id];
  const counts = id === '2' ? MOCK_COUNTS : [];

  // Calculate progress
  const progress = useMemo(() => {
    if (!cycle?.totalBins || cycle.totalBins === 0) return 0;
    return Math.round(((cycle.countedBins || 0) / cycle.totalBins) * 100);
  }, [cycle]);

  // Group counts by status
  const countsByStatus = useMemo(() => {
    const groups = {
      PENDING: [] as InventoryCount[],
      COUNTED: [] as InventoryCount[],
      ADJUSTED: [] as InventoryCount[],
      VERIFIED: [] as InventoryCount[],
    };
    counts.forEach(count => {
      groups[count.status].push(count);
    });
    return groups;
  }, [counts]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Dados atualizados');
    }, 500);
  }, []);

  const handleStartCycle = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API não disponível');
  }, []);

  const handleCompleteCycle = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API não disponível');
    setIsCompleteDialogOpen(false);
  }, []);

  const handleSubmitCount = useCallback(
    (countId: string) => {
      const inputValue = countInputs[countId];
      if (!inputValue) {
        toast.error('Digite a quantidade contada');
        return;
      }

      toast.info('Funcionalidade em desenvolvimento - API não disponível');
      setCountInputs(prev => ({ ...prev, [countId]: '' }));
    },
    [countInputs]
  );

  const handleAdjustCount = useCallback((countId: string) => {
    toast.info('Funcionalidade em desenvolvimento - API não disponível');
  }, []);

  const toggleBinExpansion = useCallback((binId: string) => {
    setExpandedBins(prev => {
      const next = new Set(prev);
      if (next.has(binId)) {
        next.delete(binId);
      } else {
        next.add(binId);
      }
      return next;
    });
  }, []);

  // Not found
  if (!cycle) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">Ciclo não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          O ciclo de inventário solicitado não existe.
        </p>
        <Button onClick={() => router.push('/stock/inventory')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Inventário
        </Button>
      </div>
    );
  }

  const statusBadge = {
    DRAFT: { label: 'Rascunho', className: 'bg-gray-500/20 text-gray-700' },
    IN_PROGRESS: {
      label: 'Em Andamento',
      className: 'bg-blue-500/20 text-blue-700',
    },
    COMPLETED: {
      label: 'Concluído',
      className: 'bg-green-500/20 text-green-700',
    },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-500/20 text-red-700' },
  }[cycle.status];

  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Módulo em desenvolvimento
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                A API de inventário ainda está sendo implementada. Os dados
                exibidos são demonstrativos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/stock/inventory')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6" />
              {cycle.name}
            </h1>
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          </div>
          {cycle.description && (
            <p className="text-muted-foreground ml-10">{cycle.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>

          {cycle.status === 'DRAFT' && (
            <Button onClick={handleStartCycle}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Contagem
            </Button>
          )}

          {cycle.status === 'IN_PROGRESS' && (
            <Button onClick={() => setIsCompleteDialogOpen(true)}>
              <Check className="h-4 w-4 mr-2" />
              Finalizar Ciclo
            </Button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {cycle.status === 'IN_PROGRESS' &&
        cycle.totalBins &&
        cycle.totalBins > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ClipboardCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Progresso da Contagem</h3>
                    <p className="text-sm text-muted-foreground">
                      {cycle.countedBins || 0} de {cycle.totalBins} bins
                      contados
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {progress}%
                </div>
              </div>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>
        )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Bins</p>
                <p className="text-2xl font-bold">{cycle.totalBins || 0}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {cycle.countedBins || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50/50 dark:bg-yellow-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(cycle.totalBins || 0) - (cycle.countedBins || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ajustados</p>
                <p className="text-2xl font-bold text-orange-600">
                  {cycle.adjustedBins || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="counts">Contagens</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="counts" className="space-y-4">
          {counts.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma contagem</h3>
              <p className="text-muted-foreground">
                {cycle.status === 'DRAFT'
                  ? 'Inicie o ciclo para gerar as contagens.'
                  : 'Não há bins para contar neste ciclo.'}
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4">
                {counts.map(count => (
                  <CountCard
                    key={count.id}
                    count={count}
                    isExpanded={expandedBins.has(count.id)}
                    onToggleExpand={() => toggleBinExpansion(count.id)}
                    inputValue={countInputs[count.id] || ''}
                    onInputChange={value =>
                      setCountInputs(prev => ({ ...prev, [count.id]: value }))
                    }
                    onSubmit={() => handleSubmitCount(count.id)}
                    onAdjust={() => handleAdjustCount(count.id)}
                    cycleStatus={cycle.status}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Ciclo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{cycle.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>
                    <Badge className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{cycle.description || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Criado em</Label>
                  <p className="font-medium">
                    {formatDateTime(cycle.createdAt)}
                  </p>
                </div>
                {cycle.startedAt && (
                  <div>
                    <Label className="text-muted-foreground">Iniciado em</Label>
                    <p className="font-medium">
                      {formatDateTime(cycle.startedAt)}
                    </p>
                  </div>
                )}
                {cycle.completedAt && (
                  <div>
                    <Label className="text-muted-foreground">
                      Concluído em
                    </Label>
                    <p className="font-medium">
                      {formatDateTime(cycle.completedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Percentual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(countsByStatus).map(([status, items]) => {
                    const config =
                      COUNT_STATUS_CONFIG[status as InventoryCountStatus];
                    const percentage =
                      counts.length > 0
                        ? Math.round((items.length / counts.length) * 100)
                        : 0;
                    return (
                      <TableRow key={status}>
                        <TableCell>
                          <Badge className={config.className}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {items.length}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {percentage}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  icon={<Play className="h-4 w-4" />}
                  title="Ciclo Criado"
                  date={cycle.createdAt}
                  isCompleted
                />
                {cycle.startedAt && (
                  <TimelineItem
                    icon={<ClipboardCheck className="h-4 w-4" />}
                    title="Contagem Iniciada"
                    date={cycle.startedAt}
                    isCompleted
                  />
                )}
                {cycle.status === 'IN_PROGRESS' && (
                  <TimelineItem
                    icon={<Loader2 className="h-4 w-4 animate-spin" />}
                    title="Contagem em Andamento"
                    description={`${cycle.countedBins || 0} de ${cycle.totalBins || 0} bins contados`}
                    isCurrent
                  />
                )}
                {cycle.completedAt && (
                  <TimelineItem
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    title="Ciclo Concluído"
                    date={cycle.completedAt}
                    description={`${cycle.adjustedBins || 0} ajustes realizados`}
                    isCompleted
                  />
                )}
                {cycle.status === 'CANCELLED' && (
                  <TimelineItem
                    icon={<X className="h-4 w-4" />}
                    title="Ciclo Cancelado"
                    isCompleted
                    variant="destructive"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Cycle Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Ciclo de Contagem</DialogTitle>
            <DialogDescription>
              Ao finalizar o ciclo, não será mais possível realizar novas
              contagens.
              {(cycle.totalBins || 0) - (cycle.countedBins || 0) > 0 && (
                <span className="block mt-2 text-yellow-600">
                  Atenção: Ainda há{' '}
                  {(cycle.totalBins || 0) - (cycle.countedBins || 0)} bins
                  pendentes de contagem.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoAdjust"
                checked={autoAdjust}
                onChange={e => setAutoAdjust(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="autoAdjust">
                Ajustar estoque automaticamente para os itens com divergência
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre a conclusão do ciclo..."
                value={completeNotes}
                onChange={e => setCompleteNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCompleteCycle}>
              <Check className="h-4 w-4 mr-2" />
              Finalizar Ciclo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Count Card Component
interface CountCardProps {
  count: InventoryCount;
  isExpanded: boolean;
  onToggleExpand: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onAdjust: () => void;
  cycleStatus: string;
}

function CountCard({
  count,
  isExpanded,
  onToggleExpand,
  inputValue,
  onInputChange,
  onSubmit,
  onAdjust,
  cycleStatus,
}: CountCardProps) {
  const statusConfig = COUNT_STATUS_CONFIG[count.status];
  const hasVariance = count.variance !== undefined && count.variance !== 0;
  const canCount = cycleStatus === 'IN_PROGRESS' && count.status === 'PENDING';
  const canAdjust =
    cycleStatus === 'IN_PROGRESS' && count.status === 'COUNTED' && hasVariance;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <Card
        className={cn(
          hasVariance && 'border-orange-300 dark:border-orange-700'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <div>
                <p className="font-medium">{count.bin?.code || count.binId}</p>
                <p className="text-sm text-muted-foreground">
                  {count.bin?.name || 'Bin'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {count.status !== 'PENDING' && (
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Esperado:
                    </span>
                    <span className="font-medium">
                      {count.expectedQuantity ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Contado:
                    </span>
                    <span className="font-medium">
                      {count.countedQuantity ?? '-'}
                    </span>
                  </div>
                  {hasVariance && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Variação:
                      </span>
                      <span
                        className={cn(
                          'font-medium',
                          (count.variance || 0) > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        )}
                      >
                        {(count.variance || 0) > 0 ? '+' : ''}
                        {count.variance}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Badge className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Count Input */}
          {canCount && (
            <div className="mt-4 flex items-center gap-2">
              <Input
                type="number"
                placeholder="Quantidade contada"
                value={inputValue}
                onChange={e => onInputChange(e.target.value)}
                className="w-40"
                min={0}
              />
              <Button onClick={onSubmit} disabled={!inputValue}>
                <Save className="h-4 w-4 mr-2" />
                Registrar
              </Button>
            </div>
          )}

          {/* Adjust Button */}
          {canAdjust && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={onAdjust}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Ajustar Estoque
              </Button>
            </div>
          )}

          {/* Expanded Content */}
          <CollapsibleContent>
            <Separator className="my-4" />
            <div className="space-y-4">
              {/* Timestamps */}
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                {count.countedAt && (
                  <div>
                    <span className="text-muted-foreground">Contado em: </span>
                    <span>{formatDateTime(count.countedAt)}</span>
                  </div>
                )}
                {count.adjustedAt && (
                  <div>
                    <span className="text-muted-foreground">Ajustado em: </span>
                    <span>{formatDateTime(count.adjustedAt)}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {count.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-sm">{count.notes}</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

// Timeline Component
interface TimelineItemProps {
  icon: React.ReactNode;
  title: string;
  date?: Date | string;
  description?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  variant?: 'default' | 'destructive';
}

function TimelineItem({
  icon,
  title,
  date,
  description,
  isCompleted,
  isCurrent,
  variant = 'default',
}: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
          isCompleted &&
            variant === 'default' &&
            'border-green-500 bg-green-50 text-green-600',
          isCompleted &&
            variant === 'destructive' &&
            'border-red-500 bg-red-50 text-red-600',
          isCurrent && 'border-blue-500 bg-blue-50 text-blue-600',
          !isCompleted &&
            !isCurrent &&
            'border-muted bg-muted/50 text-muted-foreground'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 pt-1.5">
        <p className="font-medium">{title}</p>
        {date && (
          <p className="text-sm text-muted-foreground">
            {formatDateTime(date)}
          </p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
