'use client';

/**
 * PunchRequestLinkCombobox — autocomplete that lists APPROVED EmployeeRequest
 * inside a ±7 day window of the punch exception (Phase 7 / Plan 07-06 / Task 2).
 *
 * Selecting one returns the requestId to the parent so the batch-resolve
 * call can send it as `requestId` (Plan 07-03 — links the approval to the
 * justifying employee request).
 *
 * Reuses the existing GET /v1/hr/employee-requests endpoint (Phase 3).
 *
 * data-testid: punch-request-link-combobox.
 */

import { useEffect, useState } from 'react';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

interface EmployeeRequestSummary {
  id: string;
  type: string;
  status: string;
  data?: { startDate?: string; endDate?: string } | null;
}

interface EmployeeRequestsResponse {
  items?: EmployeeRequestSummary[];
  data?: EmployeeRequestSummary[];
}

interface PunchRequestLinkComboboxProps {
  employeeId: string;
  /** Reference date (YYYY-MM-DD) used to build the ±7-day window. */
  referenceDate: string;
  value?: string | null;
  onChange: (requestId: string | null) => void;
  disabled?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  VACATION: 'Férias',
  ABSENCE: 'Ausência',
  ATTESTATION: 'Atestado',
  OVERTIME: 'Horas extras',
  TIME_BANK: 'Banco de horas',
};

function shiftDate(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function PunchRequestLinkCombobox({
  employeeId,
  referenceDate,
  value,
  onChange,
  disabled,
}: PunchRequestLinkComboboxProps) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!employeeId || !referenceDate) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const startDate = shiftDate(referenceDate, -7);
    const endDate = shiftDate(referenceDate, 7);

    apiClient
      .get<EmployeeRequestsResponse>(
        `/v1/hr/employee-requests?employeeId=${encodeURIComponent(
          employeeId
        )}&status=APPROVED&startDate=${startDate}&endDate=${endDate}`
      )
      .then(resp => {
        if (cancelled) return;
        const items = resp.items ?? resp.data ?? [];
        setOptions(
          items.map(item => ({
            value: item.id,
            label: `${TYPE_LABEL[item.type] ?? item.type} · ${
              item.data?.startDate ?? ''
            }${item.data?.endDate ? ` → ${item.data.endDate}` : ''}`,
          }))
        );
      })
      .catch(() => {
        // No silent fallback for downstream consumers — but a combobox
        // failing to populate must NOT break the form. Leave options empty;
        // user sees the empty state.
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId, referenceDate]);

  return (
    <div data-testid="punch-request-link-combobox" className="space-y-1">
      <Label>Solicitação relacionada (opcional)</Label>
      <Combobox
        options={options}
        value={value ?? undefined}
        onValueChange={selected => onChange(selected || null)}
        placeholder={
          loading ? 'Carregando solicitações...' : 'Sem solicitação vinculada'
        }
        searchPlaceholder="Buscar por tipo ou período..."
        emptyText="Nenhuma solicitação aprovada na janela ±7 dias"
        disabled={disabled || loading}
      />
    </div>
  );
}
