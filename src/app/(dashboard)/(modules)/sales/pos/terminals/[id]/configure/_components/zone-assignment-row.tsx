'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import {
  useAssignTerminalZone,
  useRemoveTerminalZone,
} from '@/hooks/sales/use-pos-terminal-zones';
import type { PosTerminalZoneWithZone } from '@/types/sales';

interface ZoneAssignmentRowProps {
  terminalId: string;
  assignment: PosTerminalZoneWithZone;
}

export function ZoneAssignmentRow({
  terminalId,
  assignment,
}: ZoneAssignmentRowProps) {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const assign = useAssignTerminalZone(terminalId);
  const remove = useRemoveTerminalZone(terminalId);

  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-white p-3 dark:bg-white/5"
      data-testid={`zone-assignment-row-${assignment.zone.id}`}
    >
      <div className="flex-1 min-w-[12rem]">
        <div className="font-medium">{assignment.zone.name}</div>
        <div className="text-sm text-muted-foreground">
          {assignment.zone.warehouseName ?? 'Armazém'} · código{' '}
          <span className="font-mono">{assignment.zone.code}</span>
        </div>
      </div>

      {assignment.zone.allowsFractionalSale && (
        <Badge
          variant="outline"
          className="border-emerald-600/25 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          Venda fracionada
        </Badge>
      )}

      <RadioGroup
        value={assignment.tier}
        onValueChange={tier =>
          assign.mutate({
            zoneId: assignment.zoneId,
            tier: tier as 'PRIMARY' | 'SECONDARY',
          })
        }
        className="flex gap-3"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem
            value="PRIMARY"
            id={`${assignment.id}-primary`}
            data-testid={`zone-row-${assignment.zone.id}-primary`}
          />
          <Label htmlFor={`${assignment.id}-primary`}>Primária</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem
            value="SECONDARY"
            id={`${assignment.id}-secondary`}
            data-testid={`zone-row-${assignment.zone.id}-secondary`}
          />
          <Label htmlFor={`${assignment.id}-secondary`}>Secundária</Label>
        </div>
      </RadioGroup>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setPinModalOpen(true)}
        disabled={remove.isPending}
        aria-label="Remover zona do terminal"
        data-testid={`zone-row-${assignment.zone.id}-remove`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <VerifyActionPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={() => remove.mutate(assignment.zoneId)}
        title="Remover zona do terminal"
        description={`Digite seu PIN de Ação para remover a zona ${assignment.zone.name} deste terminal. Esta ação fica registrada na auditoria.`}
      />
    </div>
  );
}
