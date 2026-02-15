'use client';

import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import {
  AlertCircle,
  ArrowLeft,
  Box,
  Check,
  FileText,
  Loader2,
  Lock,
  LockOpen,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Send,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import type { Volume, VolumeStatus } from '@/types/stock';

// ============================================================================
// MOCK DATA - Remover quando a API estiver implementada
// ============================================================================

interface MockVolumeItem {
  id: string;
  itemId: string;
  addedAt: Date;
  item?: {
    uniqueCode: string;
    productName?: string;
    variantName?: string;
  };
}

interface VolumeWithItems extends Omit<Volume, 'items'> {
  items?: MockVolumeItem[];
  closedAt?: Date;
  deliveredAt?: Date;
  returnedAt?: Date;
  destinationRef?: string;
}

interface RomaneioItem {
  item: { id: string; uniqueCode: string };
  product: { name: string };
  variant: { name: string };
}

interface Romaneio {
  volume: { name?: string; code: string; destinationRef?: string };
  generatedAt: Date;
  items: RomaneioItem[];
}

const MOCK_VOLUMES: Record<string, VolumeWithItems> = {
  'vol-001': {
    id: 'vol-001',
    code: 'VOL-2025-001',
    name: 'Volume Pedido #1234',
    status: 'OPEN',
    notes: 'Pedido urgente - Cliente VIP',
    itemCount: 3,
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-01-15T14:30:00'),
    destinationRef: 'Cliente ABC - São Paulo, SP',
    items: [
      {
        id: 'vi-001',
        itemId: 'item-001',
        addedAt: new Date('2025-01-15T10:05:00'),
        item: {
          uniqueCode: 'ITM-001-A',
          productName: 'Camiseta Polo',
          variantName: 'Azul M',
        },
      },
      {
        id: 'vi-002',
        itemId: 'item-002',
        addedAt: new Date('2025-01-15T10:10:00'),
        item: {
          uniqueCode: 'ITM-002-B',
          productName: 'Calça Jeans',
          variantName: 'Preta 42',
        },
      },
      {
        id: 'vi-003',
        itemId: 'item-003',
        addedAt: new Date('2025-01-15T10:15:00'),
        item: {
          uniqueCode: 'ITM-003-C',
          productName: 'Tênis Runner',
          variantName: 'Branco 40',
        },
      },
    ],
  },
  'vol-002': {
    id: 'vol-002',
    code: 'VOL-2025-002',
    name: 'Volume Pedido #1235',
    status: 'CLOSED',
    itemCount: 2,
    createdAt: new Date('2025-01-14T09:00:00'),
    updatedAt: new Date('2025-01-14T16:00:00'),
    closedAt: new Date('2025-01-14T16:00:00'),
    destinationRef: 'Cliente XYZ - Rio de Janeiro, RJ',
    items: [
      {
        id: 'vi-004',
        itemId: 'item-004',
        addedAt: new Date('2025-01-14T09:30:00'),
        item: {
          uniqueCode: 'ITM-004-D',
          productName: 'Jaqueta',
          variantName: 'Verde G',
        },
      },
      {
        id: 'vi-005',
        itemId: 'item-005',
        addedAt: new Date('2025-01-14T09:35:00'),
        item: {
          uniqueCode: 'ITM-005-E',
          productName: 'Moletom',
          variantName: 'Cinza GG',
        },
      },
    ],
  },
  'vol-003': {
    id: 'vol-003',
    code: 'VOL-2025-003',
    name: 'Volume Pedido #1236',
    status: 'DELIVERED',
    itemCount: 4,
    createdAt: new Date('2025-01-10T08:00:00'),
    updatedAt: new Date('2025-01-12T14:00:00'),
    closedAt: new Date('2025-01-10T17:00:00'),
    deliveredAt: new Date('2025-01-12T14:00:00'),
    destinationRef: 'Loja Filial Centro - Curitiba, PR',
    items: [
      {
        id: 'vi-006',
        itemId: 'item-006',
        addedAt: new Date('2025-01-10T08:15:00'),
        item: {
          uniqueCode: 'ITM-006-F',
          productName: 'Bermuda',
          variantName: 'Bege 38',
        },
      },
      {
        id: 'vi-007',
        itemId: 'item-007',
        addedAt: new Date('2025-01-10T08:20:00'),
        item: {
          uniqueCode: 'ITM-007-G',
          productName: 'Vestido',
          variantName: 'Rosa P',
        },
      },
      {
        id: 'vi-008',
        itemId: 'item-008',
        addedAt: new Date('2025-01-10T08:25:00'),
        item: {
          uniqueCode: 'ITM-008-H',
          productName: 'Saia',
          variantName: 'Preta M',
        },
      },
      {
        id: 'vi-009',
        itemId: 'item-009',
        addedAt: new Date('2025-01-10T08:30:00'),
        item: {
          uniqueCode: 'ITM-009-I',
          productName: 'Blusa',
          variantName: 'Branca G',
        },
      },
    ],
  },
  'vol-004': {
    id: 'vol-004',
    code: 'VOL-2025-004',
    name: 'Volume Retornado #1237',
    status: 'RETURNED',
    notes: 'Cliente recusou entrega - endereço incorreto',
    itemCount: 1,
    createdAt: new Date('2025-01-08T11:00:00'),
    updatedAt: new Date('2025-01-11T10:00:00'),
    closedAt: new Date('2025-01-08T15:00:00'),
    returnedAt: new Date('2025-01-11T10:00:00'),
    destinationRef: 'Cliente Desconhecido',
    items: [
      {
        id: 'vi-010',
        itemId: 'item-010',
        addedAt: new Date('2025-01-08T11:30:00'),
        item: {
          uniqueCode: 'ITM-010-J',
          productName: 'Casaco',
          variantName: 'Marrom M',
        },
      },
    ],
  },
};

const MOCK_ROMANEIOS: Record<string, Romaneio> = {
  'vol-002': {
    volume: {
      name: 'Volume Pedido #1235',
      code: 'VOL-2025-002',
      destinationRef: 'Cliente XYZ - Rio de Janeiro, RJ',
    },
    generatedAt: new Date('2025-01-14T16:00:00'),
    items: [
      {
        item: { id: 'item-004', uniqueCode: 'ITM-004-D' },
        product: { name: 'Jaqueta' },
        variant: { name: 'Verde G' },
      },
      {
        item: { id: 'item-005', uniqueCode: 'ITM-005-E' },
        product: { name: 'Moletom' },
        variant: { name: 'Cinza GG' },
      },
    ],
  },
  'vol-003': {
    volume: {
      name: 'Volume Pedido #1236',
      code: 'VOL-2025-003',
      destinationRef: 'Loja Filial Centro - Curitiba, PR',
    },
    generatedAt: new Date('2025-01-10T17:00:00'),
    items: [
      {
        item: { id: 'item-006', uniqueCode: 'ITM-006-F' },
        product: { name: 'Bermuda' },
        variant: { name: 'Bege 38' },
      },
      {
        item: { id: 'item-007', uniqueCode: 'ITM-007-G' },
        product: { name: 'Vestido' },
        variant: { name: 'Rosa P' },
      },
      {
        item: { id: 'item-008', uniqueCode: 'ITM-008-H' },
        product: { name: 'Saia' },
        variant: { name: 'Preta M' },
      },
      {
        item: { id: 'item-009', uniqueCode: 'ITM-009-I' },
        product: { name: 'Blusa' },
        variant: { name: 'Branca G' },
      },
    ],
  },
  'vol-004': {
    volume: {
      name: 'Volume Retornado #1237',
      code: 'VOL-2025-004',
      destinationRef: 'Cliente Desconhecido',
    },
    generatedAt: new Date('2025-01-08T15:00:00'),
    items: [
      {
        item: { id: 'item-010', uniqueCode: 'ITM-010-J' },
        product: { name: 'Casaco' },
        variant: { name: 'Marrom M' },
      },
    ],
  },
};

// ============================================================================

const STATUS_CONFIG: Record<
  VolumeStatus,
  { label: string; icon: typeof Box; className: string }
> = {
  OPEN: {
    label: 'Aberto',
    icon: LockOpen,
    className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  },
  CLOSED: {
    label: 'Fechado',
    icon: Lock,
    className: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  },
  DELIVERED: {
    label: 'Entregue',
    icon: Check,
    className: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
  RETURNED: {
    label: 'Retornado',
    icon: Undo2,
    className: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  },
};

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VolumeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // State
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [itemId, setItemId] = useState('');

  // ============================================================================
  // USANDO MOCK DATA - API não implementada
  // ============================================================================
  const volume = useMemo(() => MOCK_VOLUMES[id], [id]);
  const romaneio = useMemo(() => MOCK_ROMANEIOS[id], [id]);

  // Simular estados de loading/mutation para manter compatibilidade
  const isLoading = false;
  const error = !volume ? new Error('Volume não encontrado') : null;

  // ============================================================================
  // HANDLERS - Todas as ações mostram toast (funcionalidade em desenvolvimento)
  // ============================================================================
  const handleAddItem = useCallback(() => {
    if (!itemId.trim()) {
      toast.error('ID do item é obrigatório');
      return;
    }
    toast.info('Funcionalidade em desenvolvimento - API não implementada');
    setAddItemDialogOpen(false);
    setItemId('');
  }, [itemId]);

  const handleRemoveItem = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API não implementada');
  }, []);

  const handleClose = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API não implementada');
  }, []);

  const handleReopen = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API não implementada');
  }, []);

  const handleDeliver = useCallback(() => {
    toast.info('Funcionalidade em desenvolvimento - API não implementada');
  }, []);

  const handlePrintRomaneio = useCallback(() => {
    toast.info('Funcionalidade de impressão em desenvolvimento');
  }, []);

  const handleRefresh = useCallback(() => {
    toast.info('Usando dados mock - API não implementada');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error || !volume) {
    return (
      <div className="p-8 text-center">
        <div className="text-destructive mb-4">
          {error ? 'Erro ao carregar volume' : 'Volume não encontrado'}
        </div>
        <Button onClick={() => router.push('/stock/actions/volumes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[volume.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex w-full items-center justify-between">
        <PageBreadcrumb
          items={[
            { label: 'Estoque', href: '/stock' },
            { label: 'Volumes', href: '/stock/actions/volumes' },
            { label: volume.name || volume.code, href: `/stock/actions/volumes/${id}` },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            aria-label="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {volume.status === 'OPEN' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddItemDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
              <Button
                size="sm"
                onClick={handleClose}
                disabled={!volume.itemCount}
              >
                <Lock className="h-4 w-4 mr-2" />
                Fechar Volume
              </Button>
            </>
          )}
          {volume.status === 'CLOSED' && (
            <>
              <Button variant="outline" size="sm" onClick={handleReopen}>
                <LockOpen className="h-4 w-4 mr-2" />
                Reabrir
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintRomaneio}>
                <Printer className="h-4 w-4 mr-2" />
                Romaneio
              </Button>
              <Button size="sm" onClick={handleDeliver}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Volume Identity */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Package className="h-6 w-6" />
          {volume.name || volume.code}
          <Badge className={statusConfig.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </h1>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Módulo em desenvolvimento
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              O sistema de Volumes/Romaneio está sendo implementado. Esta página
              usa dados de demonstração.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">
            Itens ({volume.itemCount || 0})
          </TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          {volume.status !== 'OPEN' && (
            <TabsTrigger value="romaneio">Romaneio</TabsTrigger>
          )}
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Box className="h-4 w-4" />
                Itens do Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {volume.items && volume.items.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Item ID</TableHead>
                        <TableHead>Adicionado em</TableHead>
                        {volume.status === 'OPEN' && (
                          <TableHead className="w-16"></TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volume.items.map(volumeItem => (
                        <TableRow key={volumeItem.id}>
                          <TableCell className="font-mono text-sm">
                            {volumeItem.item?.uniqueCode ||
                              volumeItem.itemId.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {volumeItem.itemId.slice(0, 12)}...
                          </TableCell>
                          <TableCell>
                            {formatDateTime(volumeItem.addedAt)}
                          </TableCell>
                          {volume.status === 'OPEN' && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem()}
                                aria-label="Remover item do volume"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Box className="h-8 w-8 mb-2" />
                  <p>Nenhum item no volume</p>
                  {volume.status === 'OPEN' && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setAddItemDialogOpen(true)}
                      className="mt-2"
                    >
                      Adicionar primeiro item
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Nome</span>
                    <p className="font-medium">{volume.name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Código
                    </span>
                    <p className="font-medium font-mono">{volume.code}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <p>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Qtd. Itens
                    </span>
                    <p className="font-medium">{volume.itemCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Criado em
                    </span>
                    <p className="font-medium">
                      {formatDateTime(volume.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Atualizado em
                    </span>
                    <p className="font-medium">
                      {formatDateTime(volume.updatedAt)}
                    </p>
                  </div>
                </div>
                {volume.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Observações
                    </span>
                    <p className="text-sm">{volume.notes}</p>
                  </div>
                )}
                {volume.destinationRef && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Destino
                    </span>
                    <p className="text-sm">{volume.destinationRef}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TimelineItem
                    icon={Package}
                    title="Volume criado"
                    date={volume.createdAt}
                  />
                  {volume.closedAt && (
                    <TimelineItem
                      icon={Lock}
                      title="Volume fechado"
                      date={volume.closedAt}
                      iconClass="text-amber-600"
                    />
                  )}
                  {volume.deliveredAt && (
                    <TimelineItem
                      icon={Check}
                      title="Entregue"
                      date={volume.deliveredAt}
                      iconClass="text-green-600"
                    />
                  )}
                  {volume.returnedAt && (
                    <TimelineItem
                      icon={Undo2}
                      title="Retornado"
                      date={volume.returnedAt}
                      iconClass="text-red-600"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Romaneio Tab */}
        {volume.status !== 'OPEN' && (
          <TabsContent value="romaneio" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Romaneio de Entrega
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintRomaneio}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </CardHeader>
              <CardContent>
                {romaneio ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Volume
                        </span>
                        <p className="font-medium">
                          {romaneio.volume.name || romaneio.volume.code}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Data
                        </span>
                        <p className="font-medium">
                          {formatDate(romaneio.generatedAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Total de Itens
                        </span>
                        <p className="font-medium">
                          {romaneio.items?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Destino
                        </span>
                        <p className="font-medium">
                          {romaneio.volume.destinationRef || '-'}
                        </p>
                      </div>
                    </div>

                    {romaneio.items && romaneio.items.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Variante</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {romaneio.items.map((romaneioItem, index) => (
                            <TableRow key={romaneioItem.item.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {romaneioItem.item.uniqueCode}
                              </TableCell>
                              <TableCell>{romaneioItem.product.name}</TableCell>
                              <TableCell>{romaneioItem.variant.name}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p>Romaneio não disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
            <DialogDescription>
              Digite o ID do item para adicionar ao volume.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemId">ID do Item *</Label>
              <Input
                id="itemId"
                placeholder="Digite o ID do item..."
                value={itemId}
                onChange={e => setItemId(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddItemDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Timeline Item Component
interface TimelineItemProps {
  icon: typeof Package;
  title: string;
  date?: Date | string;
  iconClass?: string;
}

function TimelineItem({
  icon: Icon,
  title,
  date,
  iconClass,
}: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0',
          iconClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">
            {formatDateTime(date)}
          </span>
        </div>
      </div>
    </div>
  );
}
