/**
 * OpenSea OS - Review Radar Chart
 *
 * Radar chart comparativo Auto-avaliacao vs Gestor por competencia.
 * Inspirado no padrao Lattice/15Five.
 *
 * - Eixo: nome de cada competencia
 * - Series: 2 (selfScore rose-500, managerScore violet-500)
 * - Empty state: ilustracao + CTA opcional "Restaurar padroes"
 * - Dark mode aware (usa tokens CSS do tema)
 */

'use client';

import { Button } from '@/components/ui/button';
import type { CompetencyRadarPoint, ReviewCompetency } from '@/types/hr';
import { Sparkles, Target } from 'lucide-react';
import { useMemo } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// ============================================================================
// COLORS (mesmas usadas em chips dual-theme)
// ============================================================================

const SELF_COLOR = 'oklch(0.65 0.21 16)'; // rose-500
const MANAGER_COLOR = 'oklch(0.61 0.22 293)'; // violet-500
const GRID_COLOR = 'rgba(148, 163, 184, 0.4)'; // slate-400/40
const AXIS_COLOR = 'rgba(100, 116, 139, 0.9)'; // slate-500/90

// ============================================================================
// COMPONENT
// ============================================================================

export interface ReviewRadarChartProps {
  /** Lista de competencias com scores (null = ainda nao avaliado, tratado como 0). */
  competencies: ReviewCompetency[] | CompetencyRadarPoint[];
  /** Altura do grafico em px. Padrao: 320. */
  height?: number;
  /** Callback opcional para o CTA "Restaurar padroes" no empty state. */
  onSeedDefaults?: () => void;
  /** Indica que onSeedDefaults esta em andamento (desabilita botao). */
  isSeeding?: boolean;
  /** Esconde a legenda. */
  hideLegend?: boolean;
}

export function ReviewRadarChart({
  competencies,
  height = 320,
  onSeedDefaults,
  isSeeding = false,
  hideLegend = false,
}: ReviewRadarChartProps) {
  // Normaliza para CompetencyRadarPoint[] (aceita ambos os shapes)
  const radarData = useMemo<CompetencyRadarPoint[]>(() => {
    return competencies.map(competency => ({
      name: competency.name,
      selfScore: competency.selfScore ?? 0,
      managerScore: competency.managerScore ?? 0,
    }));
  }, [competencies]);

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================

  if (radarData.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center py-10 px-4"
        style={{ minHeight: height }}
        data-testid="review-radar-empty"
      >
        <div className="h-14 w-14 rounded-full bg-violet-50 dark:bg-violet-500/8 flex items-center justify-center mb-3">
          <Target className="h-7 w-7 text-violet-500" />
        </div>
        <p className="text-sm font-medium mb-1">
          Nenhuma competencia cadastrada
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mb-4">
          Adicione competencias para visualizar o radar comparativo entre
          auto-avaliacao e avaliacao do gestor.
        </p>
        {onSeedDefaults && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-2.5 rounded-lg text-sm"
            onClick={onSeedDefaults}
            disabled={isSeeding}
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-violet-500" />
            Restaurar padroes
          </Button>
        )}
      </div>
    );
  }

  // ==========================================================================
  // CHART
  // ==========================================================================

  return (
    <div className="w-full" style={{ height }} data-testid="review-radar-chart">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={radarData}
          margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
        >
          <PolarGrid stroke={GRID_COLOR} />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 5]}
            tick={{ fill: AXIS_COLOR, fontSize: 10 }}
            tickCount={6}
            stroke={GRID_COLOR}
            angle={90}
          />
          <Radar
            name="Auto-avaliacao"
            dataKey="selfScore"
            stroke={SELF_COLOR}
            fill={SELF_COLOR}
            fillOpacity={0.18}
            strokeWidth={2}
            isAnimationActive
          />
          <Radar
            name="Gestor"
            dataKey="managerScore"
            stroke={MANAGER_COLOR}
            fill={MANAGER_COLOR}
            fillOpacity={0.18}
            strokeWidth={2}
            isAnimationActive
          />
          <Tooltip
            cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }}
            formatter={(rawValue: unknown) => {
              const numericValue = Number(rawValue);
              if (!Number.isFinite(numericValue) || numericValue === 0) {
                return ['—', ''];
              }
              return [numericValue.toFixed(1).replace('.', ','), ''];
            }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid rgba(148,163,184,0.3)',
              fontSize: 12,
              padding: '6px 10px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              color: 'white',
            }}
            labelStyle={{
              color: 'rgba(226, 232, 240, 0.85)',
              fontWeight: 500,
              marginBottom: 2,
            }}
            itemStyle={{ color: 'white' }}
          />
          {!hideLegend && (
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 6 }}
              iconType="circle"
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
