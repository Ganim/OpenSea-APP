'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, PackageMinus, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRegisterItemExit } from '@/hooks/stock/use-items';
import { scanSuccess, scanError } from '@/lib/scan-feedback';
import { cn } from '@/lib/utils';
import type { LookupResult } from '@/services/stock/lookup.service';
import type { ExitMovementType } from '@/types/stock';

// ============================================
// Types
// ============================================

interface ExitFlowProps {
  item: LookupResult;
  onClose: () => void;
  onSuccess: () => void;
}

const EXIT_TYPES: {
  type: ExitMovementType;
  label: string;
  description: string;
}[] = [
  { type: 'SALE', label: 'Venda', description: 'Saída por venda' },
  { type: 'PRODUCTION', label: 'Produção', description: 'Uso em produção' },
  { type: 'SAMPLE', label: 'Amostra', description: 'Envio de amostra' },
  { type: 'LOSS', label: 'Perda', description: 'Perda ou avaria' },
  {
    type: 'SUPPLIER_RETURN',
    label: 'Devolução',
    description: 'Devolução ao fornecedor',
  },
];

// ============================================
// Component
// ============================================

export function ExitFlow({ item, onClose, onSuccess }: ExitFlowProps) {
  const [exitType, setExitType] = useState<ExitMovementType>('SALE');
  const [notes, setNotes] = useState('');

  const exit = useRegisterItemExit();

  const e = item.entity;
  const itemName =
    (e.name as string) || (e.productName as string) || item.entityId;
  const currentQuantity = Number(e.quantity) || 0;
  const unitOfMeasure = (e.unitOfMeasure as string) || '';

  const canSubmit = currentQuantity > 0 && !exit.isPending;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;

    exit.mutate(
      {
        itemId: item.entityId,
        quantity: currentQuantity,
        movementType: exitType,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          scanSuccess();
          toast.success(
            `Baixa de ${currentQuantity} ${unitOfMeasure || 'un'} registrada`
          );
          onSuccess();
        },
        onError: (error: Error) => {
          scanError();
          toast.error(`Erro: ${error.message}`);
        },
      }
    );
  }, [
    canSubmit,
    exit,
    item.entityId,
    currentQuantity,
    exitType,
    notes,
    unitOfMeasure,
    onSuccess,
  ]);

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 active:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-slate-100">Dar Baixa</h2>
          <p className="truncate text-xs text-slate-500">{itemName}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
          <PackageMinus className="h-4 w-4" />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Current stock info */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-3">
          <p className="text-[11px] text-slate-500">Estoque atual</p>
          <p className="text-lg font-bold tabular-nums text-slate-100">
            {currentQuantity} {unitOfMeasure}
          </p>
        </div>

        {/* Exit type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tipo de Saída
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXIT_TYPES.map(opt => (
              <button
                key={opt.type}
                onClick={() => setExitType(opt.type)}
                className={cn(
                  'rounded-xl border p-3 text-left transition-colors',
                  exitType === opt.type
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : 'border-slate-700/50 bg-slate-800/40 active:bg-slate-700/60'
                )}
              >
                <p
                  className={cn(
                    'text-sm font-medium',
                    exitType === opt.type ? 'text-rose-400' : 'text-slate-300'
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-[10px] text-slate-500">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Observações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Motivo da baixa..."
            rows={2}
            disabled={exit.isPending}
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2.5 text-base text-slate-200 placeholder:text-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="border-t border-slate-800 bg-slate-900 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors',
            canSubmit
              ? 'bg-rose-500 text-white active:bg-rose-600'
              : 'bg-slate-800 text-slate-500'
          )}
        >
          {exit.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Confirmar Baixa
            </>
          )}
        </button>
      </div>
    </div>
  );
}
