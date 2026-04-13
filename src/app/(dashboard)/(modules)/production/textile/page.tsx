/**
 * Textile Page — Confecção
 * Plano de corte e tickets de pacote para produção têxtil.
 */

'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Scissors,
  Search,
  Layers,
  Ruler,
  Package,
  Loader2,
  Printer,
} from 'lucide-react';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import { usePermissions } from '@/hooks/use-permissions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { PRODUCTION_PERMISSIONS } from '@/config/rbac/permission-codes';
import { textileService } from '@/services/production';
import type {
  CutPlanResult,
  BundleTicket,
} from '@/services/production/textile.service';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TextilePage() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('cut-plan');

  // Cut Plan state
  const [cutOrderId, setCutOrderId] = useState('');
  const [fabricWidth, setFabricWidth] = useState('');
  const [wastagePercent, setWastagePercent] = useState('');

  // Bundle Tickets state
  const [bundleOrderId, setBundleOrderId] = useState('');
  const [bundleSize, setBundleSize] = useState('');

  const canAccess = hasPermission(PRODUCTION_PERMISSIONS.SHOPFLOOR.ACCESS);

  // ---- Mutations ------------------------------------------------------------

  const cutPlanMutation = useMutation({
    mutationFn: () =>
      textileService.generateCutPlan({
        productionOrderId: cutOrderId.trim(),
        fabricWidth: fabricWidth ? Number(fabricWidth) : undefined,
        wastagePercent: wastagePercent ? Number(wastagePercent) : undefined,
      }),
    onSuccess: () => {
      toast.success('Plano de corte gerado com sucesso');
    },
    onError: () => toast.error('Erro ao gerar plano de corte'),
  });

  const bundleTicketsMutation = useMutation({
    mutationFn: () =>
      textileService.generateBundleTickets({
        productionOrderId: bundleOrderId.trim(),
        bundleSize: bundleSize ? Number(bundleSize) : undefined,
      }),
    onSuccess: () => {
      toast.success('Tickets de pacote gerados com sucesso');
    },
    onError: () => toast.error('Erro ao gerar tickets de pacote'),
  });

  // ---- Handlers -------------------------------------------------------------

  function handleGenerateCutPlan() {
    if (!cutOrderId.trim()) {
      toast.error('Informe o ID da ordem de produção');
      return;
    }
    cutPlanMutation.mutate();
  }

  function handleGenerateBundleTickets() {
    if (!bundleOrderId.trim()) {
      toast.error('Informe o ID da ordem de produção');
      return;
    }
    bundleTicketsMutation.mutate();
  }

  // ---- Data -----------------------------------------------------------------

  const cutPlan: CutPlanResult | null = cutPlanMutation.data ?? null;
  const bundleTickets: BundleTicket[] =
    bundleTicketsMutation.data?.tickets ?? [];

  // ---- Render ---------------------------------------------------------------

  if (!canAccess) return null;

  return (
    <div className="space-y-6" data-testid="production-textile-page">
      <PageActionBar
        breadcrumbItems={[
          { label: 'Produção', href: '/production' },
          { label: 'Confecção', href: '/production/textile' },
        ]}
      />

      <PageHeroBanner
        title="Confecção"
        description="Plano de corte e tickets de pacote para produção têxtil"
        icon={Scissors}
        iconGradient="from-pink-500 to-pink-600"
        buttons={[]}
        hasPermission={hasPermission}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-12 mb-4">
          <TabsTrigger value="cut-plan" className="gap-2">
            <Scissors className="h-4 w-4" />
            Plano de Corte
          </TabsTrigger>
          <TabsTrigger value="bundle-tickets" className="gap-2">
            <Package className="h-4 w-4" />
            Tickets de Pacote
          </TabsTrigger>
        </TabsList>

        {/* --- Plano de Corte tab --- */}
        <TabsContent value="cut-plan" className="space-y-4">
          <Card className="p-4 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ID da Ordem de Produção"
                    value={cutOrderId}
                    onChange={(e) => setCutOrderId(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleGenerateCutPlan()
                    }
                    className="pl-10"
                    data-testid="textile-cut-order-input"
                  />
                </div>
                <Button
                  size="sm"
                  className="h-9 px-2.5 gap-1"
                  onClick={handleGenerateCutPlan}
                  disabled={cutPlanMutation.isPending}
                >
                  {cutPlanMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Scissors className="h-4 w-4" />
                  )}
                  Gerar Plano de Corte
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="Largura do tecido (cm)"
                    value={fabricWidth}
                    onChange={(e) => setFabricWidth(e.target.value)}
                    className="pl-10"
                    data-testid="textile-fabric-width-input"
                  />
                </div>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="Desperdício (%)"
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(e.target.value)}
                    data-testid="textile-wastage-input"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Cut Plan Results */}
          {cutPlan && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Camadas"
                  value={String(cutPlan.layers)}
                  icon={Layers}
                  from="from-violet-500"
                  to="to-violet-600"
                />
                <StatCard
                  label="Peças por Camada"
                  value={String(cutPlan.piecesPerLayer)}
                  icon={Package}
                  from="from-sky-500"
                  to="to-sky-600"
                />
                <StatCard
                  label="Comprimento Total"
                  value={`${cutPlan.totalFabricLength.toFixed(2)} m`}
                  icon={Ruler}
                  from="from-emerald-500"
                  to="to-emerald-600"
                />
                <StatCard
                  label="Desperdício"
                  value={`${cutPlan.wastePercent.toFixed(1)}%`}
                  icon={Scissors}
                  from="from-rose-500"
                  to="to-rose-600"
                />
              </div>

              {/* Pieces breakdown */}
              {cutPlan.pieces.length > 0 && (
                <Card className="bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-white/10">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Distribuição por Tamanho
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10">
                          <th className="text-left p-4 font-medium text-gray-500 dark:text-white/60">
                            Tamanho
                          </th>
                          <th className="text-right p-4 font-medium text-gray-500 dark:text-white/60">
                            Quantidade
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cutPlan.pieces.map((piece) => (
                          <tr
                            key={piece.size}
                            className="border-b border-gray-100 dark:border-white/5 last:border-0"
                          >
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              <Badge
                                variant="outline"
                                className="border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/8 dark:text-violet-300"
                              >
                                {piece.size}
                              </Badge>
                            </td>
                            <td className="p-4 text-right text-gray-900 dark:text-white">
                              {piece.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}

          {cutPlanMutation.isError && (
            <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Erro ao gerar plano de corte. Verifique o ID da ordem.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* --- Tickets de Pacote tab --- */}
        <TabsContent value="bundle-tickets" className="space-y-4">
          <Card className="p-4 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ID da Ordem de Produção"
                  value={bundleOrderId}
                  onChange={(e) => setBundleOrderId(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleGenerateBundleTickets()
                  }
                  className="pl-10"
                  data-testid="textile-bundle-order-input"
                />
              </div>
              <div className="w-40">
                <Input
                  type="number"
                  placeholder="Tam. pacote"
                  value={bundleSize}
                  onChange={(e) => setBundleSize(e.target.value)}
                  data-testid="textile-bundle-size-input"
                />
              </div>
              <Button
                size="sm"
                className="h-9 px-2.5 gap-1"
                onClick={handleGenerateBundleTickets}
                disabled={bundleTicketsMutation.isPending}
              >
                {bundleTicketsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                Gerar Tickets
              </Button>
            </div>
          </Card>

          {/* Bundle Tickets Results */}
          {bundleTickets.length > 0 && (
            <Card className="bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Tickets Gerados ({bundleTickets.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {bundleTickets.map((ticket) => (
                  <BundleTicketCard key={ticket.bundleNumber} ticket={ticket} />
                ))}
              </div>
            </Card>
          )}

          {bundleTicketsMutation.isError && (
            <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Erro ao gerar tickets de pacote. Verifique o ID da ordem.
              </p>
            </Card>
          )}

          {bundleTicketsMutation.isSuccess && bundleTickets.length === 0 && (
            <Card className="p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-white/60">
                Nenhum ticket gerado para esta ordem.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  from,
  to,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  from: string;
  to: string;
}) {
  return (
    <Card className="p-4 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-linear-to-br ${from} ${to} flex items-center justify-center`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-white/60">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

function BundleTicketCard({ ticket }: { ticket: BundleTicket }) {
  return (
    <Card className="p-4 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-gray-400 dark:text-white/40">
          {ticket.bundleNumber}
        </p>
        <Badge
          variant="outline"
          className="border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-500/20 dark:bg-pink-500/8 dark:text-pink-300"
        >
          {ticket.size}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500 dark:text-white/50">Quantidade</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {ticket.quantity}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-white/50">Cor</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {ticket.color}
          </p>
        </div>
      </div>
      <div className="text-xs">
        <p className="text-gray-500 dark:text-white/50">Camada</p>
        <p className="font-semibold text-gray-900 dark:text-white">
          {ticket.layer}
        </p>
      </div>
    </Card>
  );
}
