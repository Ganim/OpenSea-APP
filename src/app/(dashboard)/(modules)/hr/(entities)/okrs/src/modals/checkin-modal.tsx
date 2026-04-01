/**
 * Check-in Modal
 * Modal para registrar check-in em um resultado-chave
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CheckInConfidence, OKRKeyResult } from '@/types/hr';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useCheckInKeyResult } from '../api';
import { getConfidenceColor } from '../utils';
import { cn } from '@/lib/utils';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyResult: OKRKeyResult | null;
}

const CONFIDENCE_OPTIONS: {
  value: CheckInConfidence;
  label: string;
  description: string;
}[] = [
  {
    value: 'LOW',
    label: 'Baixa',
    description: 'Pouca confiança no atingimento',
  },
  {
    value: 'MEDIUM',
    label: 'Média',
    description: 'Confiança moderada',
  },
  {
    value: 'HIGH',
    label: 'Alta',
    description: 'Alta confiança no atingimento',
  },
];

export function CheckInModal({
  isOpen,
  onClose,
  keyResult,
}: CheckInModalProps) {
  const checkIn = useCheckInKeyResult();

  const [newValue, setNewValue] = useState('');
  const [note, setNote] = useState('');
  const [confidence, setConfidence] = useState<CheckInConfidence>('MEDIUM');

  useEffect(() => {
    if (isOpen && keyResult) {
      setNewValue(String(keyResult.currentValue));
      setNote('');
      setConfidence('MEDIUM');
    }
  }, [isOpen, keyResult]);

  const handleSubmit = useCallback(() => {
    if (!keyResult) return;

    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) return;

    checkIn.mutate(
      {
        keyResultId: keyResult.id,
        data: {
          newValue: numValue,
          note: note.trim() || undefined,
          confidence,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }, [keyResult, newValue, note, confidence, checkIn, onClose]);

  if (!keyResult) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Check-in</DialogTitle>
          <DialogDescription>
            Atualizar progresso de &quot;{keyResult.title}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Progress */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor atual</span>
              <span className="font-medium">
                {keyResult.currentValue}
                {keyResult.unit ? ` ${keyResult.unit}` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Meta</span>
              <span className="font-medium">
                {keyResult.targetValue}
                {keyResult.unit ? ` ${keyResult.unit}` : ''}
              </span>
            </div>
          </div>

          {/* New Value */}
          <div className="space-y-2">
            <Label htmlFor="new-value">Novo Valor</Label>
            <Input
              id="new-value"
              type="number"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="Digite o novo valor"
            />
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <Label>Confiança</Label>
            <div className="grid grid-cols-3 gap-2">
              {CONFIDENCE_OPTIONS.map(option => {
                const color = getConfidenceColor(option.value);
                const isSelected = confidence === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setConfidence(option.value)}
                    className={cn(
                      'rounded-lg border p-2 text-center text-xs transition-colors',
                      isSelected
                        ? color === 'rose'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/8 dark:text-rose-300'
                          : color === 'amber'
                            ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/8 dark:text-amber-300'
                            : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/8 dark:text-emerald-300'
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Observação</Label>
            <Textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Observação sobre o progresso (opcional)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
            className="h-9 px-2.5"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={checkIn.isPending || !newValue}
            size="sm"
            className="h-9 px-2.5"
          >
            {checkIn.isPending && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
