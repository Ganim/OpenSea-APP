/**
 * OpenSea OS - Purchase Orders Page
 * Página de gerenciamento de ordens de compra usando o novo sistema OpenSea OS
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { Header } from '@/components/layout/header';
import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import {
  usePurchaseOrders,
  useCancelPurchaseOrder,
  useUpdatePurchaseOrderStatus,
} from '@/hooks/stock/use-purchase-orders';
import { useSuppliers } from '@/hooks/stock/use-stock-other';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/stock';
import { Pagination } from '@/app/(dashboard)/stock/_shared/components/pagination';
import { Button } from '@/components/ui/button';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CancelOrderDialog,
  PurchaseOrdersFilters,
  PurchaseOrdersList,
  PurchaseOrdersStats,
} from './src';

export default function PurchaseOrdersPage() {
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'all'>(
    'all'
  );
  const [supplierIdFilter, setSupplierIdFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<PurchaseOrder | null>(
    null
  );

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const purchaseOrdersQuery = useMemo(
    () => ({
      page: currentPage,
      limit: pageLimit,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(supplierIdFilter && { supplierId: supplierIdFilter }),
      ...(searchQuery && { search: searchQuery }),
    }),
    [currentPage, pageLimit, statusFilter, supplierIdFilter, searchQuery]
  );

  const {
    data: purchaseOrdersData,
    isLoading,
    error,
    refetch,
  } = usePurchaseOrders(purchaseOrdersQuery);
  const { data: suppliersData } = useSuppliers();
  const cancelMutation = useCancelPurchaseOrder();
  const updateStatusMutation = useUpdatePurchaseOrderStatus();

  const purchaseOrders = purchaseOrdersData?.purchaseOrders || [];
  const pagination = purchaseOrdersData?.pagination;
  const suppliers = suppliersData?.suppliers || [];

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const orderStats = useMemo(() => {
    const pendingCount = purchaseOrders.filter(
      po => po.status === 'PENDING'
    ).length;
    const confirmedCount = purchaseOrders.filter(
      po => po.status === 'CONFIRMED'
    ).length;
    const receivedCount = purchaseOrders.filter(
      po => po.status === 'RECEIVED'
    ).length;
    const totalValue = purchaseOrders.reduce(
      (sum, po) => sum + (po.totalCost || 0),
      0
    );

    return { pendingCount, confirmedCount, receivedCount, totalValue };
  }, [purchaseOrders]);

  const hasActiveFilters =
    statusFilter !== 'all' || !!supplierIdFilter || !!searchQuery;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success('Ordens de compra atualizadas');
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    setStatusFilter('all');
    setSupplierIdFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback(
    (value: PurchaseOrderStatus | 'all') => {
      setStatusFilter(value);
      setCurrentPage(1);
    },
    []
  );

  const handleSupplierChange = useCallback((value: string) => {
    setSupplierIdFilter(value);
    setCurrentPage(1);
  }, []);

  const handleCancelOrder = useCallback(() => {
    if (!orderToCancel) return;

    cancelMutation.mutate(orderToCancel.id, {
      onSuccess: () => {
        toast.success('Ordem de compra cancelada');
        setCancelDialogOpen(false);
        setOrderToCancel(null);
        refetch();
      },
      onError: () => {
        toast.error('Erro ao cancelar ordem de compra');
      },
    });
  }, [orderToCancel, cancelMutation, refetch]);

  const handleConfirmOrder = useCallback(
    (order: PurchaseOrder) => {
      updateStatusMutation.mutate(
        { id: order.id, status: 'CONFIRMED' },
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
    },
    [updateStatusMutation, refetch]
  );

  const handleReceiveOrder = useCallback(
    (order: PurchaseOrder) => {
      router.push(`/stock/requests/purchase-orders/${order.id}/receive`);
    },
    [router]
  );

  const handleViewOrder = useCallback(
    (order: PurchaseOrder) => {
      router.push(`/stock/requests/purchase-orders/${order.id}`);
    },
    [router]
  );

  const handleOpenCancelDialog = useCallback((order: PurchaseOrder) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  }, []);

  // ============================================================================
  // HEADER BUTTONS CONFIGURATION
  // ============================================================================

  const actionButtons: HeaderButton[] = useMemo(
    () => [
      {
        id: 'refresh-orders',
        title: 'Atualizar',
        icon: RefreshCw,
        onClick: handleRefresh,
        variant: 'outline',
      },
      {
        id: 'export-orders',
        title: 'Exportar',
        icon: Download,
        onClick: () => {},
        variant: 'outline',
      },
      {
        id: 'create-order',
        title: 'Nova Ordem',
        icon: Plus,
        onClick: () => router.push('/stock/requests/purchase-orders/new'),
        variant: 'default',
      },
    ],
    [handleRefresh, router]
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
              {
                label: 'Ordens de Compra',
                href: '/stock/requests/purchase-orders',
              },
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
          title="Ordens de Compra"
          description="Gerencie pedidos de compra de fornecedores"
        />
      </PageHeader>

      <PageBody>
        {/* Stats Cards */}
        <PurchaseOrdersStats
          pendingCount={orderStats.pendingCount}
          confirmedCount={orderStats.confirmedCount}
          receivedCount={orderStats.receivedCount}
          totalValue={orderStats.totalValue}
        />

        {/* Filters */}
        <PurchaseOrdersFilters
          search={searchQuery}
          onSearchChange={handleSearchChange}
          status={statusFilter}
          onStatusChange={handleStatusChange}
          supplierId={supplierIdFilter}
          onSupplierChange={handleSupplierChange}
          suppliers={suppliers}
          hasFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Purchase Orders List */}
        {error ? (
          <GridError
            type="server"
            title="Erro ao carregar ordens de compra"
            message="Ocorreu um erro ao tentar carregar as ordens de compra. Por favor, tente novamente."
            action={{
              label: 'Tentar Novamente',
              onClick: () => void refetch(),
            }}
          />
        ) : (
          <PurchaseOrdersList
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            totalCount={pagination?.total || purchaseOrders.length}
            isLoading={isLoading}
            hasFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onView={handleViewOrder}
            onConfirm={handleConfirmOrder}
            onReceive={handleReceiveOrder}
            onCancel={handleOpenCancelDialog}
          />
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={setCurrentPage}
            onLimitChange={(size: number) => {
              setPageLimit(size);
              setCurrentPage(1);
            }}
          />
        )}

        {/* Cancel Confirmation Dialog */}
        <CancelOrderDialog
          isOpen={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          orderToCancel={orderToCancel}
          onConfirmCancel={handleCancelOrder}
          isCancelling={cancelMutation.isPending}
        />
      </PageBody>
    </PageLayout>
  );
}
