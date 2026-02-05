'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpFromLine,
  Box,
  Calendar,
  Clock,
  Hash,
  Loader2,
  MapPin,
  MapPinOff,
  MoreVertical,
  Package,
  Printer,
  QrCode,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { PermissionGate } from '@/components/auth/permission-gate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { useItem, useItemMovements } from '@/hooks/stock/use-items';
import { itemsService } from '@/services/stock';
import type { ItemMovement, ItemStatus, MovementType } from '@/types/stock';

const STATUS_CONFIG: Record<ItemStatus, { label: string; className: string }> =
  {
    AVAILABLE: {
      label: 'Disponível',
      className: 'bg-green-500/20 text-green-700 dark:text-green-400',
    },
    RESERVED: {
      label: 'Reservado',
      className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    },
    SOLD: {
      label: 'Vendido',
      className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    },
    DAMAGED: {
      label: 'Danificado',
      className: 'bg-red-500/20 text-red-700 dark:text-red-400',
    },
  };

const MOVEMENT_CONFIG: Record<
  MovementType,
  { label: string; icon: typeof ArrowDownToLine; className: string }
> = {
  ENTRY: {
    label: 'Entrada',
    icon: ArrowDownToLine,
    className: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  EXIT: {
    label: 'Saída',
    icon: ArrowUpFromLine,
    className: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  },
  TRANSFER: {
    label: 'Transferência',
    icon: ArrowRightLeft,
    className: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  ADJUSTMENT: {
    label: 'Ajuste',
    icon: Box,
    className: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  },
  ZONE_RECONFIGURE: {
    label: 'Reconfiguração',
    icon: RefreshCw,
    className: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
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

export default function ItemDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: itemData, isLoading, error, refetch } = useItem(id);
  const { data: movementsData, isLoading: isLoadingMovements } =
    useItemMovements({
      itemId: id,
    });

  const item = itemData?.item;
  const movements = movementsData?.movements || [];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await itemsService.deleteItem(id);
      toast.success('Item excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      router.push('/stock/items');
    } catch (err) {
      toast.error('Erro ao excluir item');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-8 text-center">
        <div className="text-destructive mb-4">Erro ao carregar item</div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[item.status];
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
  const isExpiringSoon =
    item.expiryDate &&
    new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const quantityPercentage = Math.round(
    (item.currentQuantity / item.initialQuantity) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-mono">
                  {item.uniqueCode}
                </h1>
                <Badge className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
                {isExpired && <Badge variant="destructive">Vencido</Badge>}
                {!isExpired && isExpiringSoon && (
                  <Badge variant="outline" className="text-orange-600">
                    Vence em breve
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {item.batchNumber && `Lote: ${item.batchNumber} • `}
                Entrada: {formatDate(item.entryDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <QrCode className="h-4 w-4 mr-2" />
                Gerar Etiqueta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <PermissionGate permission="items.update">
                <DropdownMenuItem>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transferir
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Registrar Saída
                </DropdownMenuItem>
              </PermissionGate>
              <DropdownMenuSeparator />
              <PermissionGate permission="items.delete">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="movements">
                Movimentações
                {movements.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {movements.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="attributes">Atributos</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Info Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={Hash}
                  label="Código Único"
                  value={item.uniqueCode || '-'}
                  mono
                />
                <InfoCard
                  icon={Hash}
                  label="Lote"
                  value={item.batchNumber || 'Não informado'}
                />
                <InfoCard
                  icon={item.bin ? MapPin : MapPinOff}
                  label="Localização"
                  value={
                    item.bin
                      ? item.bin.address
                      : item.lastKnownAddress
                        ? `${item.lastKnownAddress} (desassociado)`
                        : 'Não informada'
                  }
                />
                <InfoCard
                  icon={Calendar}
                  label="Data de Entrada"
                  value={formatDate(item.entryDate)}
                />
                <InfoCard
                  icon={Calendar}
                  label="Fabricação"
                  value={formatDate(item.manufacturingDate)}
                />
                <InfoCard
                  icon={Calendar}
                  label="Validade"
                  value={formatDate(item.expiryDate)}
                  className={cn(
                    isExpired && 'text-red-600',
                    isExpiringSoon && !isExpired && 'text-orange-600'
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="movements" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Histórico de Movimentações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {isLoadingMovements ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : movements.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Clock className="h-8 w-8 mb-2" />
                        <p>Nenhuma movimentação registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {movements.map(movement => (
                          <MovementCard key={movement.id} movement={movement} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attributes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Atributos Personalizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(item.attributes || {}).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Box className="h-8 w-8 mb-2" />
                      <p>Nenhum atributo definido</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(item.attributes || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <span className="font-medium">{key}</span>
                            <span className="text-muted-foreground">
                              {String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quantity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quantidade em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold">{item.currentQuantity}</div>
                <div className="text-sm text-muted-foreground mb-4">
                  de {item.initialQuantity} unidades
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={cn(
                      'h-full transition-all',
                      quantityPercentage > 50
                        ? 'bg-green-500'
                        : quantityPercentage > 20
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    )}
                    style={{ width: `${quantityPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {quantityPercentage}% disponível
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <PermissionGate permission="items.update">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowRightLeft className="h-4 w-4 mr-2 text-blue-600" />
                  Transferir
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-600" />
                  Registrar Saída
                </Button>
              </PermissionGate>
              <Button variant="outline" className="w-full justify-start">
                <QrCode className="h-4 w-4 mr-2" />
                Gerar Etiqueta
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Detalhes
              </Button>
            </CardContent>
          </Card>

          {/* Variant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Variante
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground">ID: {item.variantId}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item{' '}
              <strong>{item.uniqueCode}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper Components

interface InfoCardProps {
  icon: typeof Box;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}

function InfoCard({
  icon: Icon,
  label,
  value,
  mono,
  className,
}: InfoCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={cn('font-medium', mono && 'font-mono', className)}>
              {value}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MovementCardProps {
  movement: ItemMovement;
}

function MovementCard({ movement }: MovementCardProps) {
  const config = MOVEMENT_CONFIG[movement.movementType];
  const Icon = config.icon;

  return (
    <div className={cn('p-3 rounded-lg', config.className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{config.label}</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(movement.createdAt)}
            </span>
          </div>
          <div className="text-sm mt-1">
            <span className="font-medium">
              {movement.movementType === 'EXIT' ? '-' : '+'}
              {movement.quantity}
            </span>
            {movement.quantityBefore !== null &&
              movement.quantityAfter !== null && (
                <span className="text-muted-foreground ml-2">
                  ({movement.quantityBefore} → {movement.quantityAfter})
                </span>
              )}
          </div>
          {movement.notes && (
            <p className="text-xs text-muted-foreground mt-1">
              {movement.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
