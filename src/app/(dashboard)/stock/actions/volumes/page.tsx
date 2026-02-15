/**
 * OpenSea OS - Volumes Page
 * Listagem e gerenciamento de volumes de expedicao
 */

'use client';

import { Header } from '@/components/layout/header';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Volume, VolumeStatus } from '@/types/stock';
import {
  Box,
  Check,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Loader2,
  Lock,
  LockOpen,
  Package,
  Plus,
  RefreshCw,
  Search,
  Send,
  Undo2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { volumesConfig } from './src';

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<
  VolumeStatus,
  { label: string; icon: typeof Box; className: string; bgClass: string }
> = {
  OPEN: {
    label: 'Aberto',
    icon: LockOpen,
    className: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200',
  },
  CLOSED: {
    label: 'Fechado',
    icon: Lock,
    className: 'text-amber-600',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200',
  },
  DELIVERED: {
    label: 'Entregue',
    icon: Check,
    className: 'text-green-600',
    bgClass: 'bg-green-50 dark:bg-green-900/20 border-green-200',
  },
  RETURNED: {
    label: 'Retornado',
    icon: Undo2,
    className: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200',
  },
};

const STATUS_OPTIONS: { value: VolumeStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'OPEN', label: 'Aberto' },
  { value: 'CLOSED', label: 'Fechado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'RETURNED', label: 'Retornado' },
];

// Mock data until API is available
const MOCK_VOLUMES: Volume[] = [
  {
    id: 'vol-001',
    code: 'VOL-2025-001',
    name: 'Volume Pedido #1234',
    status: 'OPEN',
    notes: 'Pedido urgente - Cliente VIP',
    itemCount: 5,
    createdAt: new Date('2025-01-15T10:00:00'),
  },
  {
    id: 'vol-002',
    code: 'VOL-2025-002',
    name: 'Volume Pedido #1235',
    status: 'CLOSED',
    notes: 'Pronto para expedicao',
    itemCount: 12,
    createdAt: new Date('2025-01-14T14:30:00'),
    closedAt: new Date('2025-01-14T16:00:00'),
  },
  {
    id: 'vol-003',
    code: 'VOL-2025-003',
    name: 'Volume Lote Mensal',
    status: 'DELIVERED',
    notes: 'Entrega realizada com sucesso',
    itemCount: 45,
    createdAt: new Date('2025-01-10T09:00:00'),
    closedAt: new Date('2025-01-10T12:00:00'),
    deliveredAt: new Date('2025-01-12T10:00:00'),
    destinationRef: 'Filial Sao Paulo',
  },
  {
    id: 'vol-004',
    code: 'VOL-2025-004',
    name: 'Volume Devolucao',
    status: 'RETURNED',
    notes: 'Itens com defeito retornados',
    itemCount: 3,
    createdAt: new Date('2025-01-08T11:00:00'),
    closedAt: new Date('2025-01-08T14:00:00'),
    returnedAt: new Date('2025-01-13T09:00:00'),
  },
  {
    id: 'vol-005',
    code: 'VOL-2025-005',
    name: 'Volume Novo',
    status: 'OPEN',
    itemCount: 0,
    createdAt: new Date('2025-01-15T15:00:00'),
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toLocaleDateString('pt-BR');
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Package;
  className?: string;
  iconClass?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
  iconClass,
}: StatCardProps) {
  return (
    <Card className={cn('border', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={cn('h-8 w-8 opacity-50', iconClass)} />
        </div>
      </CardContent>
    </Card>
  );
}

interface VolumeRowProps {
  volume: Volume;
  onView: () => void;
  onClose: () => void;
  onReopen: () => void;
  onDeliver: () => void;
  onDelete: () => void;
}

function VolumeRow({
  volume,
  onView,
  onClose,
  onReopen,
  onDeliver,
  onDelete,
}: VolumeRowProps) {
  const statusConfig = STATUS_CONFIG[volume.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow',
        statusConfig.bgClass
      )}
      onClick={onView}
    >
      <div
        className={cn(
          'p-2 rounded-lg bg-white/50 dark:bg-black/20',
          statusConfig.className
        )}
      >
        <StatusIcon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{volume.name || volume.code}</span>
          <Badge variant="outline" className={statusConfig.className}>
            {statusConfig.label}
          </Badge>
        </div>
        {volume.notes && (
          <p className="text-sm text-muted-foreground truncate">
            {volume.notes}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Box className="h-3 w-3" />
            {volume.itemCount || 0} item(s)
          </span>
          <span>Criado: {formatDate(volume.createdAt)}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Ações do volume"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          {volume.status === 'OPEN' && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onClose();
              }}
            >
              <Lock className="h-4 w-4 mr-2" />
              Fechar
            </DropdownMenuItem>
          )}
          {volume.status === 'CLOSED' && (
            <>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onReopen();
                }}
              >
                <LockOpen className="h-4 w-4 mr-2" />
                Reabrir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onDeliver();
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar para Entrega
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          {volume.status === 'OPEN' &&
            (!volume.itemCount || volume.itemCount === 0) && (
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function VolumesPage() {
  const router = useRouter();

  // ============================================================================
  // CRUD SETUP (mock - API not yet implemented)
  // ============================================================================

  const [statusFilter, setStatusFilter] = useState<VolumeStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newVolumeName, setNewVolumeName] = useState('');
  const [newVolumeDescription, setNewVolumeDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // PAGE SETUP (mock filtered data)
  // ============================================================================

  const filteredVolumes = useMemo(() => {
    let filtered = MOCK_VOLUMES;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(volume => volume.status === statusFilter);
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        volume =>
          volume.name?.toLowerCase().includes(searchLower) ||
          volume.code.toLowerCase().includes(searchLower) ||
          volume.notes?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [statusFilter, searchQuery]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const volumeStats = useMemo(() => {
    const open = MOCK_VOLUMES.filter(volume => volume.status === 'OPEN').length;
    const closed = MOCK_VOLUMES.filter(
      volume => volume.status === 'CLOSED'
    ).length;
    const delivered = MOCK_VOLUMES.filter(
      volume => volume.status === 'DELIVERED'
    ).length;
    const returned = MOCK_VOLUMES.filter(
      volume => volume.status === 'RETURNED'
    ).length;
    const totalItems = MOCK_VOLUMES.reduce(
      (sum, volume) => sum + (volume.itemCount || 0),
      0
    );

    return { open, closed, delivered, returned, totalItems };
  }, []);

  const hasActiveFilters = statusFilter !== 'all' || searchQuery;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Volumes atualizados');
    }, 500);
  }, []);

  const handleResetFilters = useCallback(() => {
    setStatusFilter('all');
    setSearchQuery('');
  }, []);

  const handleCreateVolume = useCallback(() => {
    if (!newVolumeName.trim()) {
      toast.error('Nome do volume e obrigatorio');
      return;
    }

    toast.info('Funcionalidade em desenvolvimento - API nao disponivel');
    setCreateDialogOpen(false);
    setNewVolumeName('');
    setNewVolumeDescription('');
  }, [newVolumeName]);

  const handleCloseVolume = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API nao disponivel');
  }, []);

  const handleReopenVolume = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API nao disponivel');
  }, []);

  const handleDeliverVolume = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API nao disponivel');
  }, []);

  const handleDeleteVolume = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API nao disponivel');
  }, []);

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'refresh-volumes',
        title: 'Atualizar',
        icon: RefreshCw,
        onClick: handleRefresh,
        variant: 'outline' as const,
        disabled: isLoading,
      },
      {
        id: 'export-volumes',
        title: 'Exportar',
        icon: Download,
        onClick: () => {
          toast.info('Funcionalidade em desenvolvimento');
        },
        variant: 'outline' as const,
      },
      {
        id: 'create-volume',
        title: volumesConfig.display.labels.createButton ?? 'Novo Volume',
        icon: Plus,
        onClick: () => setCreateDialogOpen(true),
        variant: 'default' as const,
      },
    ],
    [handleRefresh, isLoading]
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderDevelopmentBanner = () => (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Modulo em desenvolvimento
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              A API de volumes ainda esta sendo implementada. Os dados exibidos
              sao demonstrativos.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStatsCards = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Abertos"
        value={volumeStats.open}
        icon={LockOpen}
        className="bg-blue-50 dark:bg-blue-900/20"
        iconClass="text-blue-600"
      />
      <StatCard
        label="Fechados"
        value={volumeStats.closed}
        icon={Lock}
        className="bg-amber-50 dark:bg-amber-900/20"
        iconClass="text-amber-600"
      />
      <StatCard
        label="Entregues"
        value={volumeStats.delivered}
        icon={Check}
        className="bg-green-50 dark:bg-green-900/20"
        iconClass="text-green-600"
      />
      <StatCard
        label="Retornados"
        value={volumeStats.returned}
        icon={Undo2}
        className="bg-red-50 dark:bg-red-900/20"
        iconClass="text-red-600"
      />
      <StatCard
        label="Total de Itens"
        value={volumeStats.totalItems}
        icon={Box}
        className="bg-muted/50"
      />
    </div>
  );

  const renderFilters = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={volumesConfig.display.labels.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={nextValue =>
              setStatusFilter(nextValue as VolumeStatus | 'all')
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderVolumesList = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Volumes
          <Badge variant="secondary" className="ml-2">
            {filteredVolumes.length} volume(s)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredVolumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Package className="h-12 w-12 mb-4" />
            <p>{volumesConfig.display.labels.emptyState}</p>
            {hasActiveFilters && (
              <Button
                variant="link"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {filteredVolumes.map(volume => (
                <VolumeRow
                  key={volume.id}
                  volume={volume}
                  onView={() => router.push(`/stock/actions/volumes/${volume.id}`)}
                  onClose={() => handleCloseVolume()}
                  onReopen={() => handleReopenVolume()}
                  onDeliver={() => handleDeliverVolume()}
                  onDelete={() => handleDeleteVolume()}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );

  const renderCreateDialog = () => (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Volume</DialogTitle>
          <DialogDescription>
            Crie um novo volume para agrupar itens para expedicao.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Volume 001 - Cliente ABC"
              value={newVolumeName}
              onChange={e => setNewVolumeName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              placeholder="Observacoes sobre o volume..."
              value={newVolumeDescription}
              onChange={e => setNewVolumeDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateVolume}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Volume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <div className="flex w-full items-center justify-between">
          <PageBreadcrumb
            items={[
              { label: 'Estoque', href: '/stock' },
              { label: 'Volumes', href: '/stock/actions/volumes' },
            ]}
          />
          <div className="flex items-center gap-2">
            {actionButtons.map(button => (
              <Button
                key={button.id}
                variant={button.variant || 'default'}
                size="sm"
                onClick={button.onClick}
                title={button.title}
              >
                {button.icon && <button.icon className="h-4 w-4" />}
                <span className="hidden lg:inline">{button.title}</span>
              </Button>
            ))}
          </div>
        </div>

        <Header
          title="Volumes"
          description="Gerencie volumes e expedicao de itens"
        />
      </PageHeader>

      <PageBody>
        {/* Development Banner */}
        {renderDevelopmentBanner()}

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Filters */}
        {renderFilters()}

        {/* Volumes List */}
        {renderVolumesList()}

        {/* Create Dialog */}
        {renderCreateDialog()}
      </PageBody>
    </PageLayout>
  );
}
