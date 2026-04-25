'use client';

import { useMemo, useState } from 'react';
import { Loader2, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GridError } from '@/components/handlers/grid-error';
import { useAllZones } from '@/app/(dashboard)/(modules)/stock/(entities)/locations/src/api';
import { usePosTerminalZones } from '@/hooks/sales/use-pos-terminal-zones';
import { AddZoneDialog } from './add-zone-dialog';
import { ZoneAssignmentRow } from './zone-assignment-row';

/**
 * "Zonas" tab of the POS Terminal configure page (Emporion Fase 1).
 *
 * Lists the Zones currently linked to the terminal with their tier
 * (PRIMARY/SECONDARY) and the venda-fracionada flag, plus an "Adicionar
 * zona" CTA that opens a dialog with the unassigned zones.
 */
export function ZonesTab({ terminalId }: { terminalId: string }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const {
    data: assignedResponse,
    isLoading: isLoadingAssigned,
    error: assignedError,
    refetch: refetchAssigned,
  } = usePosTerminalZones(terminalId);

  const { data: allZones, isLoading: isLoadingAllZones } = useAllZones();

  const assignedZones = assignedResponse?.zones ?? [];

  const unassigned = useMemo(() => {
    if (!allZones) return [];
    const linkedIds = new Set(assignedZones.map(z => z.zoneId));
    return allZones.filter(z => z.isActive && !linkedIds.has(z.id));
  }, [allZones, assignedZones]);

  if (assignedError) {
    return (
      <GridError
        title="Erro ao carregar zonas vinculadas"
        message={
          assignedError instanceof Error
            ? assignedError.message
            : 'Não foi possível buscar as zonas deste terminal.'
        }
        action={{
          label: 'Tentar novamente',
          onClick: () => {
            void refetchAssigned();
          },
        }}
      />
    );
  }

  return (
    <div className="space-y-4" data-testid="zones-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold">Zonas do terminal</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Zonas <strong>primárias</strong> aparecem em destaque no POS. Zonas{' '}
            <strong>secundárias</strong> ficam disponíveis para consulta e venda
            sob demanda. Pelo menos uma zona primária é obrigatória para abrir
            vendas.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          disabled={isLoadingAllZones || unassigned.length === 0}
          data-testid="zones-tab-add"
        >
          <Plus className="h-4 w-4" />
          Adicionar zona
        </Button>
      </div>

      {isLoadingAssigned ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : assignedZones.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Nenhuma zona vinculada. O terminal não poderá vender enquanto não
          houver ao menos uma zona primária.
        </div>
      ) : (
        <div className="space-y-2">
          {assignedZones.map(z => (
            <ZoneAssignmentRow
              key={z.id}
              terminalId={terminalId}
              assignment={z}
            />
          ))}
        </div>
      )}

      <AddZoneDialog
        terminalId={terminalId}
        availableZones={unassigned}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />
    </div>
  );
}
