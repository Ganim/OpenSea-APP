'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Search,
  Target,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PermissionGate } from '@/components/auth/permission-gate';
import { cn } from '@/lib/utils';

import type { InventoryCycle, InventoryCycleStatus } from '@/types/stock';

const STATUS_CONFIG: Record<
  InventoryCycleStatus,
  { label: string; icon: typeof ClipboardList; className: string }
> = {
  DRAFT: {
    label: 'Rascunho',
    icon: ClipboardList,
    className: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    icon: Play,
    className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  },
  COMPLETED: {
    label: 'Concluído',
    icon: CheckCircle2,
    className: 'bg-green-500/20 text-green-700 dark:text-green-400',
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: X,
    className: 'bg-red-500/20 text-red-700 dark:text-red-400',
  },
};

// Mock data until API is available
const MOCK_CYCLES: InventoryCycle[] = [
  {
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
  {
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
  {
    id: '3',
    name: 'Contagem de Produtos de Alto Valor',
    description: 'Verificação especial de itens com valor acima de R$ 1.000',
    status: 'DRAFT',
    totalBins: 20,
    countedBins: 0,
    adjustedBins: 0,
    createdAt: new Date('2025-01-15'),
  },
];

function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR');
}

export default function InventoryPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    InventoryCycleStatus | 'all'
  >('all');
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleDescription, setNewCycleDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Using mock data - API not yet implemented
  const cycles = MOCK_CYCLES;

  // Filter cycles
  const filteredCycles = useMemo(() => {
    let filtered = cycles;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [cycles, statusFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const inProgress = cycles.filter(c => c.status === 'IN_PROGRESS');
    const completed = cycles.filter(c => c.status === 'COMPLETED');
    const draft = cycles.filter(c => c.status === 'DRAFT');

    const totalVariance = completed.reduce(
      (sum, c) => sum + (c.adjustedBins || 0),
      0
    );

    return {
      total: cycles.length,
      inProgress: inProgress.length,
      completed: completed.length,
      draft: draft.length,
      totalVariance,
    };
  }, [cycles]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Ciclos atualizados');
    }, 500);
  }, []);

  const handleCreateCycle = useCallback(() => {
    if (!newCycleName.trim()) {
      toast.error('Nome da contagem é obrigatório');
      return;
    }

    toast.info('Funcionalidade em desenvolvimento - API não disponível');
    setIsCreateDialogOpen(false);
    setNewCycleName('');
    setNewCycleDescription('');
  }, [newCycleName]);

  const handleStartCycle = useCallback((cycleId: string) => {
    toast.info('Funcionalidade em desenvolvimento - API não disponível');
  }, []);

  const handleViewCycle = useCallback(
    (cycleId: string) => {
      router.push(`/stock/inventory/${cycleId}`);
    },
    [router]
  );

  const hasFilters = statusFilter !== 'all' || search;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Inventário
          </h1>
          <p className="text-muted-foreground">
            Gerencie ciclos de contagem e ajustes de estoque
          </p>
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

          <PermissionGate permission="inventory.create">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Contagem
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Ciclo de Contagem</DialogTitle>
                  <DialogDescription>
                    Crie um novo ciclo de contagem de inventário.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Contagem Mensal - Janeiro"
                      value={newCycleName}
                      onChange={e => setNewCycleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o objetivo desta contagem..."
                      value={newCycleDescription}
                      onChange={e => setNewCycleDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCycle}>Criar Ciclo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Ciclos</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats.total}</p>
                )}
              </div>
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </p>
                )}
              </div>
              <Play className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 dark:bg-green-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                )}
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Ajustes Realizados
                </p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalVariance}
                  </p>
                )}
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ciclos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={v =>
                setStatusFilter(v as InventoryCycleStatus | 'all')
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSearch('');
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cycles List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCycles.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum ciclo encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasFilters
                ? 'Tente ajustar os filtros'
                : 'Crie seu primeiro ciclo de contagem'}
            </p>
            {!hasFilters && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Contagem
              </Button>
            )}
          </Card>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {filteredCycles.map(cycle => (
                <CycleCard
                  key={cycle.id}
                  cycle={cycle}
                  onStart={() => handleStartCycle(cycle.id)}
                  onView={() => handleViewCycle(cycle.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

// Helper Components

interface CycleCardProps {
  cycle: InventoryCycle;
  onStart: () => void;
  onView: () => void;
}

function CycleCard({ cycle, onStart, onView }: CycleCardProps) {
  const statusConfig = STATUS_CONFIG[cycle.status];
  const StatusIcon = statusConfig.icon;
  const progress =
    cycle.totalBins && cycle.totalBins > 0
      ? Math.round(((cycle.countedBins || 0) / cycle.totalBins) * 100)
      : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'p-3 rounded-lg',
                cycle.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : cycle.status === 'COMPLETED'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-muted'
              )}
            >
              <Target className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{cycle.name}</h3>
              {cycle.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {cycle.description}
                </p>
              )}
            </div>
          </div>
          <Badge className={statusConfig.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Progress (for in-progress cycles) */}
        {cycle.status === 'IN_PROGRESS' &&
          cycle.totalBins &&
          cycle.totalBins > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">
                  {cycle.countedBins || 0} / {cycle.totalBins} bins ({progress}
                  %)
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total de Bins</span>
            <p className="font-medium">{cycle.totalBins || 0}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Contados</span>
            <p className="font-medium">{cycle.countedBins || 0}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Ajustados</span>
            <p
              className={cn(
                'font-medium',
                cycle.adjustedBins &&
                  cycle.adjustedBins > 0 &&
                  'text-orange-600'
              )}
            >
              {cycle.adjustedBins || 0}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span>Criado: {formatDate(cycle.createdAt)}</span>
          {cycle.startedAt && (
            <span>Iniciado: {formatDateTime(cycle.startedAt)}</span>
          )}
          {cycle.completedAt && (
            <span>Concluído: {formatDateTime(cycle.completedAt)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {cycle.status === 'DRAFT' && (
            <Button size="sm" onClick={onStart}>
              <Play className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
          )}
          {cycle.status === 'IN_PROGRESS' && (
            <Button size="sm" onClick={onView}>
              <ClipboardCheck className="h-4 w-4 mr-1" />
              Continuar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onView}>
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
