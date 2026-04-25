'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignTerminalZone } from '@/hooks/sales/use-pos-terminal-zones';
import type { PosZoneTier } from '@/types/sales';
import type { Zone } from '@/types/stock';

interface AddZoneDialogProps {
  terminalId: string;
  availableZones: Zone[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddZoneDialog({
  terminalId,
  availableZones,
  open,
  onOpenChange,
}: AddZoneDialogProps) {
  const [zoneId, setZoneId] = useState<string>('');
  const [tier, setTier] = useState<PosZoneTier>('PRIMARY');
  const assign = useAssignTerminalZone(terminalId);

  const handleConfirm = () => {
    if (!zoneId) return;
    assign.mutate(
      { zoneId, tier },
      {
        onSuccess: () => {
          setZoneId('');
          setTier('PRIMARY');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="add-zone-dialog">
        <DialogHeader>
          <DialogTitle>Adicionar zona ao terminal</DialogTitle>
          <DialogDescription>
            Escolha a zona que será atendida por este terminal e o tipo de
            vínculo. Apenas zonas primárias aparecem em destaque na tela do POS;
            secundárias ficam disponíveis sob demanda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="zone-select">Zona</Label>
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger id="zone-select" data-testid="add-zone-select">
                <SelectValue placeholder="Selecione uma zona disponível" />
              </SelectTrigger>
              <SelectContent>
                {availableZones.map(zone => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}{' '}
                    <span className="text-muted-foreground">({zone.code})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableZones.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Todas as zonas disponíveis já estão vinculadas.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de vínculo</Label>
            <RadioGroup
              value={tier}
              onValueChange={value => setTier(value as PosZoneTier)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="PRIMARY"
                  id="add-zone-primary"
                  data-testid="add-zone-primary"
                />
                <Label htmlFor="add-zone-primary">Primária</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="SECONDARY"
                  id="add-zone-secondary"
                  data-testid="add-zone-secondary"
                />
                <Label htmlFor="add-zone-secondary">Secundária</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!zoneId || assign.isPending}
            data-testid="add-zone-confirm"
          >
            {assign.isPending ? 'Salvando…' : 'Vincular zona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
