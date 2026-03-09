'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCostCenters } from '@/hooks/finance';
import type { CostCenterAllocation } from '@/types/finance';
import { Plus, Trash2 } from 'lucide-react';
import { InlineCreateModal } from './inline-create-modal';
import { InlineCostCenterForm } from './inline-cost-center-form';
import { useState } from 'react';

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// ============================================================================
// PROPS
// ============================================================================

interface CostCenterAllocationProps {
  value: CostCenterAllocation[];
  onChange: (allocations: CostCenterAllocation[]) => void;
  totalAmount: number;
  useRateio: boolean;
  onToggleRateio: (useRateio: boolean) => void;
  costCenterId: string;
  costCenterName: string;
  onCostCenterChange: (id: string, name: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CostCenterAllocationComponent({
  value,
  onChange,
  totalAmount,
  useRateio,
  onToggleRateio,
  costCenterId,
  costCenterName,
  onCostCenterChange,
}: CostCenterAllocationProps) {
  const { data: costCentersData } = useCostCenters();
  const costCenters = costCentersData?.costCenters ?? [];

  const [showCreateCostCenter, setShowCreateCostCenter] = useState(false);

  const percentageSum = value.reduce((sum, a) => sum + a.percentage, 0);
  const isValid = Math.abs(percentageSum - 100) < 0.01;

  const handleAddRow = () => {
    onChange([
      ...value,
      { costCenterId: '', percentage: 0, costCenterName: '' },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (value.length <= 1) return;
    onChange(value.filter((_, i) => i !== index));
  };

  const handleRowChange = (
    index: number,
    field: 'costCenterId' | 'percentage',
    val: string | number
  ) => {
    const updated = [...value];
    if (field === 'costCenterId') {
      const selected = costCenters.find((cc) => cc.id === val);
      updated[index] = {
        ...updated[index],
        costCenterId: val as string,
        costCenterName: selected?.name ?? '',
      };
    } else {
      updated[index] = {
        ...updated[index],
        percentage: Number(val),
      };
    }
    onChange(updated);
  };

  const handleCostCenterCreated = (cc: { id: string; name: string }) => {
    setShowCreateCostCenter(false);
    if (!useRateio) {
      onCostCenterChange(cc.id, cc.name);
    }
  };

  // --------------------------------------------------------------------------
  // Render: single mode
  // --------------------------------------------------------------------------

  if (!useRateio) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Centro de Custo</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ratear</span>
            <Switch
              checked={useRateio}
              onCheckedChange={(checked) => {
                onToggleRateio(checked);
                if (checked && value.length === 0) {
                  // Initialize with current cost center or empty row
                  onChange(
                    costCenterId
                      ? [{ costCenterId, percentage: 100, costCenterName }]
                      : [{ costCenterId: '', percentage: 100, costCenterName: '' }]
                  );
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={costCenterId}
            onValueChange={(val) => {
              const selected = costCenters.find((cc) => cc.id === val);
              onCostCenterChange(val, selected?.name ?? '');
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um centro de custo" />
            </SelectTrigger>
            <SelectContent>
              {costCenters.map((cc) => (
                <SelectItem key={cc.id} value={cc.id}>
                  {cc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowCreateCostCenter(true)}
            title="Criar novo centro de custo"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <InlineCreateModal
          open={showCreateCostCenter}
          onOpenChange={setShowCreateCostCenter}
          title="Novo Centro de Custo"
        >
          <InlineCostCenterForm
            onCreated={handleCostCenterCreated}
            onCancel={() => setShowCreateCostCenter(false)}
          />
        </InlineCreateModal>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: rateio mode
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Centros de Custo (Rateio)</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ratear</span>
          <Switch checked={useRateio} onCheckedChange={onToggleRateio} />
        </div>
      </div>

      <div className="space-y-2">
        {value.map((alloc, index) => {
          const calcAmount =
            totalAmount > 0 ? (alloc.percentage / 100) * totalAmount : 0;

          return (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={alloc.costCenterId}
                onValueChange={(val) =>
                  handleRowChange(index, 'costCenterId', val)
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 w-28">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={alloc.percentage || ''}
                  onChange={(e) =>
                    handleRowChange(
                      index,
                      'percentage',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>

              <span className="text-xs text-muted-foreground w-24 text-right">
                {formatCurrency(calcAmount)}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => handleRemoveRow(index)}
                disabled={value.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="gap-1"
        >
          <Plus className="h-3 w-3" />
          Adicionar centro de custo
        </Button>

        <span
          className={`text-sm font-medium ${
            isValid ? 'text-green-600' : 'text-destructive'
          }`}
        >
          Total: {percentageSum.toFixed(2)}%
        </span>
      </div>

      {!isValid && (
        <p className="text-xs text-destructive">
          A soma das porcentagens deve ser igual a 100%.
        </p>
      )}

      <InlineCreateModal
        open={showCreateCostCenter}
        onOpenChange={setShowCreateCostCenter}
        title="Novo Centro de Custo"
      >
        <InlineCostCenterForm
          onCreated={(cc) => {
            setShowCreateCostCenter(false);
            // Add the new cost center to the last empty row
            const emptyIndex = value.findIndex((a) => !a.costCenterId);
            if (emptyIndex >= 0) {
              handleRowChange(emptyIndex, 'costCenterId', cc.id);
            }
          }}
          onCancel={() => setShowCreateCostCenter(false)}
        />
      </InlineCreateModal>
    </div>
  );
}
