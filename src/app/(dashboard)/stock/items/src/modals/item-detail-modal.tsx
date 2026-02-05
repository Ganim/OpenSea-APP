'use client';

import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Box,
  Calendar,
  Clock,
  Hash,
  Loader2,
  MapPin,
  MapPinOff,
  Package,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { useItemMovements } from '@/hooks/stock/use-items';
import type {
  ItemExtended,
  ItemMovement,
  ItemStatus,
  MovementType,
} from '@/types/stock';

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
    icon: RotateCcw,
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

interface ItemDetailModalProps {
  item: ItemExtended | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDetailModal({
  item,
  open,
  onOpenChange,
}: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');

  // Fetch movements for this item
  const { data: movementsData, isLoading: isLoadingMovements } =
    useItemMovements(item ? { itemId: item.id } : undefined);

  const movements = movementsData?.movements || [];

  if (!item) return null;

  const statusConfig = STATUS_CONFIG[item.status];
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
  const isExpiringSoon =
    item.expiryDate &&
    new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono">{item.uniqueCode}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {item.variant?.name || 'Variante não informada'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="movements">
              Movimentações
              {movements.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {movements.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attributes">Atributos</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Status and Quantity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              <div className="text-right">
                <div className="text-2xl font-bold">{item.currentQuantity}</div>
                <div className="text-xs text-muted-foreground">
                  de {item.initialQuantity} un
                </div>
              </div>
            </div>

            <Separator />

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField
                icon={Hash}
                label="Código"
                value={item.uniqueCode || '-'}
                mono
              />
              <InfoField
                icon={Package}
                label="Variante"
                value={item.variant?.name || '-'}
              />
              <InfoField
                icon={QrCode}
                label="SKU"
                value={item.variant?.sku || '-'}
                mono
              />
              <InfoField
                icon={Hash}
                label="Lote"
                value={item.batchNumber || '-'}
              />
              <InfoField
                icon={item.bin ? MapPin : MapPinOff}
                label="Localização"
                value={
                  item.bin
                    ? item.bin.address
                    : item.lastKnownAddress
                      ? `${item.lastKnownAddress} (desassociado)`
                      : 'Sem localização'
                }
                className={
                  !item.bin && item.lastKnownAddress
                    ? 'text-amber-500'
                    : !item.bin
                      ? 'text-muted-foreground/50'
                      : undefined
                }
              />
              <InfoField
                icon={Calendar}
                label="Data de Entrada"
                value={formatDate(item.entryDate)}
              />
              <InfoField
                icon={Calendar}
                label="Fabricação"
                value={formatDate(item.manufacturingDate)}
              />
              <InfoField
                icon={Calendar}
                label="Validade"
                value={formatDate(item.expiryDate)}
                className={cn(
                  isExpired && 'text-red-600',
                  isExpiringSoon && !isExpired && 'text-orange-600'
                )}
              />
            </div>

            {/* Variant Details */}
            {item.variant && (
              <>
                <Separator />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Informações da Variante
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Preço: </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.variant.price)}
                        </span>
                      </div>
                      {item.variant.costPrice && (
                        <div>
                          <span className="text-muted-foreground">Custo: </span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(item.variant.costPrice)}
                          </span>
                        </div>
                      )}
                      {item.variant.barcode && (
                        <div>
                          <span className="text-muted-foreground">
                            Código de Barras:{' '}
                          </span>
                          <span className="font-mono">
                            {item.variant.barcode}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Movements Tab */}
          <TabsContent value="movements" className="mt-4">
            <ScrollArea className="h-[400px]">
              {isLoadingMovements ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2" />
                  <p>Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {movements.map(movement => (
                    <MovementCard key={movement.id} movement={movement} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Attributes Tab */}
          <TabsContent value="attributes" className="mt-4">
            <ScrollArea className="h-[400px]">
              {Object.keys(item.attributes || {}).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Box className="h-8 w-8 mb-2" />
                  <p>Nenhum atributo definido</p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {Object.entries(item.attributes || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">{key}</span>
                      <span className="text-sm text-muted-foreground">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-1" />
            Etiqueta
          </Button>
          <Button variant="outline" size="sm">
            <ArrowRightLeft className="h-4 w-4 mr-1" />
            Transferir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components

interface InfoFieldProps {
  icon: typeof Box;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}

function InfoField({
  icon: Icon,
  label,
  value,
  mono,
  className,
}: InfoFieldProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn('text-sm', mono && 'font-mono', className)}>
          {value}
        </div>
      </div>
    </div>
  );
}

interface MovementCardProps {
  movement: ItemMovement;
}

function MovementCard({ movement }: MovementCardProps) {
  const config = MOVEMENT_CONFIG[movement.movementType];
  const Icon = config.icon;

  return (
    <Card className={cn('p-3', config.className)}>
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
          {(movement.originRef || movement.destinationRef) && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {movement.originRef && <span>{movement.originRef}</span>}
              {movement.originRef && movement.destinationRef && <span>→</span>}
              {movement.destinationRef && <span>{movement.destinationRef}</span>}
            </div>
          )}
          {movement.notes && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {movement.notes}
            </p>
          )}
          {movement.batchNumber && (
            <p className="text-xs text-muted-foreground mt-1">
              Lote: {movement.batchNumber}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
