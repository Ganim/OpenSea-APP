'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiInsightsService, aiCampaignsService } from '@/services/ai';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  ShieldAlert,
  LineChart,
  ThumbsUp,
  Bell,
  PartyPopper,
  Eye,
  X,
  ExternalLink,
  Loader2,
  Rocket,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  AiInsight,
  AiInsightType,
  AiInsightPriority,
  CampaignSuggestion,
} from '@/types/ai';

const INSIGHT_TYPE_CONFIG: Record<
  AiInsightType,
  { label: string; icon: React.ElementType; color: string }
> = {
  TREND: { label: 'Tendencia', icon: TrendingUp, color: 'text-blue-500' },
  ANOMALY: { label: 'Anomalia', icon: AlertTriangle, color: 'text-amber-500' },
  OPPORTUNITY: {
    label: 'Oportunidade',
    icon: Target,
    color: 'text-emerald-500',
  },
  RISK: { label: 'Risco', icon: ShieldAlert, color: 'text-rose-500' },
  PREDICTION: { label: 'Previsao', icon: LineChart, color: 'text-violet-500' },
  RECOMMENDATION: {
    label: 'Recomendacao',
    icon: ThumbsUp,
    color: 'text-sky-500',
  },
  ALERT: { label: 'Alerta', icon: Bell, color: 'text-orange-500' },
  CELEBRATION: {
    label: 'Conquista',
    icon: PartyPopper,
    color: 'text-pink-500',
  },
};

const PRIORITY_CONFIG: Record<
  AiInsightPriority,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  LOW: { label: 'Baixa', variant: 'secondary' },
  MEDIUM: { label: 'Media', variant: 'default' },
  HIGH: { label: 'Alta', variant: 'destructive' },
  URGENT: { label: 'Urgente', variant: 'destructive' },
};

function CampaignCard({
  insight,
  onApply,
  isApplying,
}: {
  insight: AiInsight;
  onApply: (insightId: string) => void;
  isApplying: boolean;
}) {
  const campaignData =
    insight.renderData as unknown as CampaignSuggestion | null;
  if (!campaignData) return null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
      {/* Target products */}
      {campaignData.targetProducts &&
        campaignData.targetProducts.length > 0 && (
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
              <ShoppingCart className="h-3 w-3" />
              Produtos Alvo
            </p>
            <div className="flex flex-wrap gap-1">
              {campaignData.targetProducts.map(p => (
                <Badge key={p.id} variant="outline" className="text-[10px]">
                  {p.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

      {/* Discount & Impact */}
      <div className="flex items-center gap-4 text-xs">
        {campaignData.suggestedDiscount != null && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-3 w-3" />
            <span className="font-medium">
              {campaignData.suggestedDiscount}% desconto
            </span>
          </div>
        )}
        {campaignData.estimatedImpact && (
          <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
            <TrendingUp className="h-3 w-3" />
            <span className="font-medium">
              +
              {campaignData.estimatedImpact.revenueIncrease.toLocaleString(
                'pt-BR',
                { style: 'currency', currency: 'BRL' }
              )}
            </span>
          </div>
        )}
      </div>

      {/* Apply button */}
      <Button
        size="sm"
        onClick={() => onApply(insight.id)}
        disabled={isApplying}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
      >
        {isApplying ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
        ) : (
          <Rocket className="h-3.5 w-3.5 mr-1" />
        )}
        Aplicar Campanha
      </Button>
    </div>
  );
}

export function AiInsightsView() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('NEW');

  const { data, isLoading } = useQuery({
    queryKey: ['ai', 'insights', statusFilter],
    queryFn: async () => {
      const response = await aiInsightsService.list({
        status: statusFilter || undefined,
        limit: 50,
      });
      return response.insights;
    },
  });

  const viewMutation = useMutation({
    mutationFn: aiInsightsService.markViewed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'insights'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: aiInsightsService.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'insights'] });
    },
  });

  const applyCampaignMutation = useMutation({
    mutationFn: aiCampaignsService.applyCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'insights'] });
      toast.success('Campanha aplicada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao aplicar campanha.');
    },
  });

  const insights = data ?? [];

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['NEW', 'VIEWED', 'ACTED_ON', 'DISMISSED'].map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setStatusFilter(statusFilter === status ? '' : status)
            }
          >
            {status === 'NEW' && 'Novos'}
            {status === 'VIEWED' && 'Visualizados'}
            {status === 'ACTED_ON' && 'Atuados'}
            {status === 'DISMISSED' && 'Descartados'}
          </Button>
        ))}
      </div>

      {/* Insights grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">
            Nenhum insight encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Os insights proativos aparecerao aqui conforme a IA analisa seus
            dados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight: AiInsight) => {
            const typeConfig = INSIGHT_TYPE_CONFIG[insight.type];
            const priorityConfig = PRIORITY_CONFIG[insight.priority];
            const TypeIcon = typeConfig.icon;

            return (
              <Card key={insight.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <TypeIcon className={cn('h-5 w-5', typeConfig.color)} />
                    <Badge variant={priorityConfig.variant} className="text-xs">
                      {priorityConfig.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {insight.module}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm leading-tight">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                    {insight.content}
                  </p>
                </div>

                {insight.suggestedAction && (
                  <div className="text-xs bg-primary/5 rounded-md px-3 py-2 text-primary">
                    Sugestao: {insight.suggestedAction}
                  </div>
                )}

                {(insight.type === 'OPPORTUNITY' ||
                  insight.type === 'RECOMMENDATION') &&
                  insight.renderData && (
                    <CampaignCard
                      insight={insight}
                      onApply={id => applyCampaignMutation.mutate(id)}
                      isApplying={applyCampaignMutation.isPending}
                    />
                  )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(insight.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                  <div className="flex gap-1">
                    {insight.actionUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={insight.actionUrl}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    {insight.status === 'NEW' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewMutation.mutate(insight.id)}
                        disabled={viewMutation.isPending}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {insight.status !== 'DISMISSED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissMutation.mutate(insight.id)}
                        disabled={dismissMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
