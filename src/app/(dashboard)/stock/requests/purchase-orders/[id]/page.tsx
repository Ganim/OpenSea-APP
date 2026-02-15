'use client';

import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import {
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useMemo } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import {
  useCancelPurchaseOrder,
  usePurchaseOrder,
  useUpdatePurchaseOrderStatus,
} from '@/hooks/stock/use-purchase-orders';
import { useSuppliers } from '@/hooks/stock/use-stock-other';
import { useVariants } from '@/hooks/stock/use-variants';
import type { PurchaseOrderStatus } from '@/types/stock';

// Purchase Order status config
const STATUS_CONFIG: Record<
  PurchaseOrderStatus,
  { label: string; className: string; bgClass: string }
> = {
  PENDING: {
    label: 'Pendente',
    className: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
  },
  CONFIRMED: {
    label: 'Confirmado',
    className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
  },
  RECEIVED: {
    label: 'Recebido',
    className: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    bgClass: 'bg-green-50 dark:bg-green-900/20',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch data
  const { data, isLoading, error, refetch } = usePurchaseOrder(id);
  const { data: suppliersData } = useSuppliers();
  const { data: variantsData } = useVariants();

  const cancelMutation = useCancelPurchaseOrder();
  const updateStatusMutation = useUpdatePurchaseOrderStatus();

  const purchaseOrder = data?.purchaseOrder;
  const suppliers = suppliersData?.suppliers || [];
  const variants = variantsData?.variants || [];

  // Find supplier
  const supplier = useMemo(() => {
    if (!purchaseOrder) return null;
    return suppliers.find(s => s.id === purchaseOrder.supplierId);
  }, [purchaseOrder, suppliers]);

  // Handle actions
  const handleConfirm = () => {
    if (!purchaseOrder) return;
    updateStatusMutation.mutate(
      { id: purchaseOrder.id, status: 'CONFIRMED' },
      {
        onSuccess: () => {
          toast.success('Ordem de compra confirmada');
          refetch();
        },
        onError: () => {
          toast.error('Erro ao confirmar ordem de compra');
        },
      }
    );
  };

  const handleReceive = () => {
    router.push(`/stock/requests/purchase-orders/${id}/receive`);
  };

  const handleCancel = () => {
    if (!purchaseOrder) return;
    cancelMutation.mutate(purchaseOrder.id, {
      onSuccess: () => {
        toast.success('Ordem de compra cancelada');
        refetch();
      },
      onError: () => {
        toast.error('Erro ao cancelar ordem de compra');
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error || !purchaseOrder) {
    return (
      <div className="p-8 text-center">
        <div className="text-destructive mb-4">
          {error
            ? 'Erro ao carregar ordem de compra'
            : 'Ordem de compra não encontrada'}
        </div>
        <Button onClick={() => router.push('/stock/requests/purchase-orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[purchaseOrder.status];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex w-full items-center justify-between">
        <PageBreadcrumb
          items={[
            { label: 'Estoque', href: '/stock' },
            {
              label: 'Ordens de Compra',
              href: '/stock/requests/purchase-orders',
            },
            {
              label: purchaseOrder.orderNumber,
              href: `/stock/requests/purchase-orders/${id}`,
            },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            aria-label="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {purchaseOrder.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={updateStatusMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </>
          )}
          {purchaseOrder.status === 'CONFIRMED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleReceive}>
                <Package className="h-4 w-4 mr-2" />
                Receber Items
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Order Identity */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <ShoppingCart className="h-6 w-6" />
          {purchaseOrder.orderNumber}
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
        </h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="items">
            Items ({purchaseOrder.items?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informações da Ordem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Número
                    </span>
                    <p className="font-medium">{purchaseOrder.orderNumber}</p>
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
                      Criado em
                    </span>
                    <p className="font-medium">
                      {formatDateTime(purchaseOrder.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Atualizado em
                    </span>
                    <p className="font-medium">
                      {formatDateTime(purchaseOrder.updatedAt)}
                    </p>
                  </div>
                </div>
                {purchaseOrder.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Observações
                    </span>
                    <p className="text-sm">{purchaseOrder.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supplier Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier ? (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Nome
                      </span>
                      <p className="font-medium">{supplier.name}</p>
                    </div>
                    {supplier.cnpj && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          CNPJ
                        </span>
                        <p className="font-medium">{supplier.cnpj}</p>
                      </div>
                    )}
                    {supplier.email && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          E-mail
                        </span>
                        <p className="font-medium">{supplier.email}</p>
                      </div>
                    )}
                    {supplier.phone && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Telefone
                        </span>
                        <p className="font-medium">{supplier.phone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Fornecedor não encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className={cn('border-2', statusConfig.bgClass)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Valor Total
                  </span>
                  <p className="text-3xl font-bold">
                    {formatCurrency(purchaseOrder.totalCost || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">
                    Qtd. Items
                  </span>
                  <p className="text-3xl font-bold">
                    {purchaseOrder.items?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items da Ordem
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variante</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.items.map(item => {
                      const variant = variants.find(
                        v => v.id === item.variantId
                      );
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium">
                                {variant?.name || 'Variante não encontrada'}
                              </span>
                              {variant?.sku && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({variant.sku})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitCost)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>Nenhum item na ordem</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  icon={FileText}
                  title="Ordem criada"
                  date={purchaseOrder.createdAt}
                  description={`Ordem ${purchaseOrder.orderNumber} criada`}
                />
                {purchaseOrder.status === 'CONFIRMED' && (
                  <TimelineItem
                    icon={Check}
                    title="Ordem confirmada"
                    date={purchaseOrder.updatedAt}
                    description="Aguardando recebimento dos items"
                    iconClass="text-blue-600"
                  />
                )}
                {purchaseOrder.status === 'RECEIVED' && (
                  <TimelineItem
                    icon={Package}
                    title="Items recebidos"
                    date={purchaseOrder.updatedAt}
                    description="Todos os items foram recebidos"
                    iconClass="text-green-600"
                  />
                )}
                {purchaseOrder.status === 'CANCELLED' && (
                  <TimelineItem
                    icon={XCircle}
                    title="Ordem cancelada"
                    date={purchaseOrder.updatedAt}
                    description="Ordem de compra cancelada"
                    iconClass="text-red-600"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Timeline Item Component
interface TimelineItemProps {
  icon: typeof FileText;
  title: string;
  date?: Date | string;
  description?: string;
  iconClass?: string;
}

function TimelineItem({
  icon: Icon,
  title,
  date,
  description,
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
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
