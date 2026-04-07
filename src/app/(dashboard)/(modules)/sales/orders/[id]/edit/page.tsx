/**
 * OpenSea OS - Edit Order Page
 * Follows the standard edit page pattern: PageLayout > PageHeader > PageBody
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useOrder,
  useUpdateOrder,
  useDeleteOrder,
} from '@/hooks/sales/use-orders';
import { usePermissions } from '@/hooks/use-permissions';
import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { logger } from '@/lib/logger';
import type { DeliveryMethod, UpdateOrderRequest } from '@/types/sales';
import { useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  FileText,
  Loader2,
  NotebookText,
  Package,
  Save,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// CONSTANTS
// =============================================================================

const ORDER_TYPE_LABELS: Record<string, string> = {
  QUOTE: 'Orçamento',
  ORDER: 'Pedido',
};

const CHANNEL_LABELS: Record<string, string> = {
  PDV: 'PDV',
  WEB: 'Web',
  WHATSAPP: 'WhatsApp',
  MARKETPLACE: 'Marketplace',
  BID: 'Licitação',
  MANUAL: 'Manual',
  API: 'API',
};

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  PICKUP: 'Retirada',
  OWN_FLEET: 'Frota Própria',
  CARRIER: 'Transportadora',
  PARTIAL: 'Parcial',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-foreground" />
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="border-b border-border" />
    </div>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const orderId = params.id as string;

  const canDelete = hasPermission(SALES_PERMISSIONS.ORDERS.REMOVE);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data, isLoading, error } = useOrder(orderId);

  const order = data?.order;
  const items = data?.items ?? [];

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  // ============================================================================
  // STATE
  // ============================================================================

  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Editable fields (from UpdateOrderRequest)
  const [deliveryMethod, setDeliveryMethod] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [tags, setTags] = useState('');
  const [discountTotal, setDiscountTotal] = useState('');
  const [taxTotal, setTaxTotal] = useState('');
  const [shippingTotal, setShippingTotal] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const isConfirmed = !!order?.confirmedAt;
  const isCancelled = !!order?.cancelledAt;
  const isLocked = isConfirmed || isCancelled;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (order) {
      setDeliveryMethod(order.deliveryMethod ?? '');
      setNotes(order.notes ?? '');
      setInternalNotes(order.internalNotes ?? '');
      setTags(order.tags?.join(', ') ?? '');
      setDiscountTotal(String(order.discountTotal ?? 0));
      setTaxTotal(String(order.taxTotal ?? 0));
      setShippingTotal(String(order.shippingTotal ?? 0));
      setExpiresAt(
        order.expiresAt
          ? new Date(order.expiresAt).toISOString().slice(0, 16)
          : ''
      );
    }
  }, [order]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    if (isLocked) {
      toast.error('Não é possível editar um pedido confirmado ou cancelado.');
      return;
    }

    try {
      setIsSaving(true);

      const payload: UpdateOrderRequest = {};

      // Only include changed fields
      if (deliveryMethod && deliveryMethod !== (order?.deliveryMethod ?? '')) {
        payload.deliveryMethod = deliveryMethod as DeliveryMethod;
      }

      const trimmedNotes = notes.trim();
      if (trimmedNotes !== (order?.notes ?? '')) {
        payload.notes = trimmedNotes || undefined;
      }

      const trimmedInternalNotes = internalNotes.trim();
      if (trimmedInternalNotes !== (order?.internalNotes ?? '')) {
        payload.internalNotes = trimmedInternalNotes || undefined;
      }

      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const currentTags = order?.tags ?? [];
      if (JSON.stringify(parsedTags) !== JSON.stringify(currentTags)) {
        payload.tags = parsedTags;
      }

      const parsedDiscount = parseFloat(discountTotal) || 0;
      if (parsedDiscount !== (order?.discountTotal ?? 0)) {
        payload.discountTotal = parsedDiscount;
      }

      const parsedTax = parseFloat(taxTotal) || 0;
      if (parsedTax !== (order?.taxTotal ?? 0)) {
        payload.taxTotal = parsedTax;
      }

      const parsedShipping = parseFloat(shippingTotal) || 0;
      if (parsedShipping !== (order?.shippingTotal ?? 0)) {
        payload.shippingTotal = parsedShipping;
      }

      if (expiresAt) {
        const newExpires = new Date(expiresAt).toISOString();
        if (newExpires !== order?.expiresAt) {
          payload.expiresAt = newExpires;
        }
      } else if (order?.expiresAt) {
        payload.expiresAt = null;
      }

      // Only submit if there are changes
      if (Object.keys(payload).length === 0) {
        toast.info('Nenhuma alteração detectada.');
        return;
      }

      await updateMutation.mutateAsync({ id: orderId, data: payload });

      toast.success('Pedido atualizado com sucesso!');
      await queryClient.invalidateQueries({
        queryKey: ['orders', 'detail', orderId],
      });
      router.push(`/sales/orders/${orderId}`);
    } catch (err) {
      logger.error(
        'Erro ao atualizar pedido',
        err instanceof Error ? err : undefined
      );
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar pedido', { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(orderId);
      toast.success('Pedido excluído com sucesso!');
      router.push('/sales/orders');
    } catch (err) {
      logger.error(
        'Erro ao excluir pedido',
        err instanceof Error ? err : undefined
      );
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao excluir pedido', { description: message });
    }
  };

  // ============================================================================
  // ACTION BUTTONS
  // ============================================================================

  const actionButtons: HeaderButton[] = [
    ...(canDelete
      ? [
          {
            id: 'delete',
            title: 'Excluir',
            icon: Trash2,
            onClick: () => setDeleteModalOpen(true),
            variant: 'default' as const,
            className:
              'bg-slate-200 text-slate-700 border-transparent hover:bg-rose-600 hover:text-white dark:bg-[#334155] dark:text-white dark:hover:bg-rose-600',
          },
        ]
      : []),
    ...(!isLocked
      ? [
          {
            id: 'save',
            title: isSaving ? 'Salvando...' : 'Salvar',
            icon: isSaving ? Loader2 : Save,
            onClick: handleSubmit,
            variant: 'default' as const,
            disabled: isSaving,
          },
        ]
      : []),
  ];

  // ============================================================================
  // LOADING / ERROR
  // ============================================================================

  const breadcrumbItems = [
    { label: 'Vendas', href: '/sales' },
    { label: 'Pedidos', href: '/sales/orders' },
    {
      label: order?.orderNumber || '...',
      href: `/sales/orders/${orderId}`,
    },
    { label: 'Editar' },
  ];

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !order) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Pedido não encontrado"
            message="O pedido solicitado não foi encontrado."
            action={{
              label: 'Voltar para Pedidos',
              onClick: () => router.push('/sales/orders'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={breadcrumbItems}
          buttons={actionButtons}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg bg-linear-to-br from-blue-500 to-indigo-600">
              {order.type === 'QUOTE' ? (
                <FileText className="h-7 w-7 text-white" />
              ) : (
                <ShoppingCart className="h-7 w-7 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                Editando {ORDER_TYPE_LABELS[order.type]?.toLowerCase()}
              </p>
              <h1 className="text-xl font-bold truncate">
                {order.orderNumber}
              </h1>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{ORDER_TYPE_LABELS[order.type]}</Badge>
                <Badge variant="secondary">
                  {CHANNEL_LABELS[order.channel]}
                </Badge>
                {isConfirmed && (
                  <Badge className="bg-green-500/10 text-green-500">
                    Confirmado
                  </Badge>
                )}
                {isCancelled && <Badge variant="destructive">Cancelado</Badge>}
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-2xl font-bold">
                {formatCurrency(order.grandTotal)}
              </p>
              <p className="text-xs text-muted-foreground">
                Criado em {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        {/* Locked Warning */}
        {isLocked && (
          <Card className="border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Este pedido está {isConfirmed ? 'confirmado' : 'cancelado'} e não
              pode ser editado. Apenas a exclusão é permitida.
            </p>
          </Card>
        )}

        {/* Items Table (Read-Only) */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-5">
            <SectionHeader
              icon={Package}
              title={`Itens (${items.length})`}
              subtitle="Itens do pedido (somente leitura)"
            />
            <div className="w-full rounded-xl border border-border bg-white dark:bg-slate-800/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-slate-800/40 text-muted-foreground text-xs">
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">Produto</th>
                      <th className="text-left py-3 px-4">SKU</th>
                      <th className="text-right py-3 px-4">Qtd</th>
                      <th className="text-right py-3 px-4">Preço Unit.</th>
                      <th className="text-right py-3 px-4">Desconto</th>
                      <th className="text-right py-3 px-4">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhum item neste pedido.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        >
                          <td className="py-3 px-4 text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {item.sku ?? '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right text-green-500">
                            {item.discountValue > 0
                              ? `-${formatCurrency(item.discountValue)}`
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Summary */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-5">
            <SectionHeader
              icon={DollarSign}
              title="Valores"
              subtitle="Descontos, impostos e frete do pedido"
            />
            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discountTotal">Desconto Total (R$)</Label>
                  <Input
                    id="discountTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountTotal}
                    onChange={e => setDiscountTotal(e.target.value)}
                    placeholder="0.00"
                    disabled={isLocked}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="taxTotal">Impostos (R$)</Label>
                  <Input
                    id="taxTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={taxTotal}
                    onChange={e => setTaxTotal(e.target.value)}
                    placeholder="0.00"
                    disabled={isLocked}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shippingTotal">Frete (R$)</Label>
                  <Input
                    id="shippingTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingTotal}
                    onChange={e => setShippingTotal(e.target.value)}
                    placeholder="0.00"
                    disabled={isLocked}
                  />
                </div>
              </div>

              {/* Read-only summary */}
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <p className="font-medium">
                      {formatCurrency(order.subtotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pago</p>
                    <p className="font-medium text-green-500">
                      {formatCurrency(order.paidAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Crédito Utilizado
                    </p>
                    <p className="font-medium">
                      {formatCurrency(order.creditUsed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Restante</p>
                    <p className="font-bold text-amber-500">
                      {formatCurrency(order.remainingAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Delivery */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-5">
            <SectionHeader
              icon={Truck}
              title="Entrega"
              subtitle="Método de entrega e validade do pedido"
            />
            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deliveryMethod">Método de Entrega</Label>
                  <Select
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                    disabled={isLocked}
                  >
                    <SelectTrigger id="deliveryMethod">
                      <SelectValue placeholder="Selecione o método..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DELIVERY_METHOD_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expiresAt">Data de Validade</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    disabled={isLocked}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tags */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-5">
            <SectionHeader
              icon={Tag}
              title="Tags"
              subtitle="Etiquetas para organizar pedidos"
            />
            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60">
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="urgente, varejo, especial (separadas por vírgula)"
                  disabled={isLocked}
                />
                <p className="text-xs text-muted-foreground">
                  Separe as tags por vírgula
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-5">
            <SectionHeader
              icon={NotebookText}
              title="Observações"
              subtitle="Notas públicas e internas do pedido"
            />
            <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas Públicas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observações visíveis ao cliente..."
                  rows={3}
                  disabled={isLocked}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="internalNotes">Notas Internas</Label>
                <Textarea
                  id="internalNotes"
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  placeholder="Observações internas da equipe..."
                  rows={3}
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>
        </Card>
      </PageBody>

      {/* Delete PIN Modal */}
      <VerifyActionPinModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteConfirm}
        title="Excluir Pedido"
        description={`Digite seu PIN de ação para excluir o pedido "${order.orderNumber}". Esta ação não pode ser desfeita.`}
      />
    </PageLayout>
  );
}
