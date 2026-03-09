'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateWorkScheduleData } from '@/types/hr';
import { Clock, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { WEEK_DAYS, getDayLabel } from '../utils';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkScheduleData) => Promise<void>;
  isLoading?: boolean;
}

type DayKey = (typeof WEEK_DAYS)[number];

interface DaySchedule {
  start: string;
  end: string;
  enabled: boolean;
}

const DEFAULT_WEEKDAY: DaySchedule = { start: '08:00', end: '17:00', enabled: true };
const DEFAULT_WEEKEND: DaySchedule = { start: '', end: '', enabled: false };

function getDefaultDays(): Record<DayKey, DaySchedule> {
  return {
    monday: { ...DEFAULT_WEEKDAY },
    tuesday: { ...DEFAULT_WEEKDAY },
    wednesday: { ...DEFAULT_WEEKDAY },
    thursday: { ...DEFAULT_WEEKDAY },
    friday: { ...DEFAULT_WEEKDAY },
    saturday: { ...DEFAULT_WEEKEND },
    sunday: { ...DEFAULT_WEEKEND },
  };
}

export function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [breakDuration, setBreakDuration] = useState(60);
  const [days, setDays] = useState<Record<DayKey, DaySchedule>>(getDefaultDays);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setBreakDuration(60);
      setDays(getDefaultDays());
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function updateDay(day: DayKey, field: keyof DaySchedule, value: string | boolean) {
    setDays(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  async function handleSubmit() {
    const data: CreateWorkScheduleData = {
      name,
      description: description || undefined,
      breakDuration,
    };

    for (const day of WEEK_DAYS) {
      const d = days[day];
      if (d.enabled && d.start && d.end) {
        const startKey = `${day}Start` as keyof CreateWorkScheduleData;
        const endKey = `${day}End` as keyof CreateWorkScheduleData;
        (data as unknown as Record<string, unknown>)[startKey] = d.start;
        (data as unknown as Record<string, unknown>)[endKey] = d.end;
      }
    }

    await onSubmit(data);
  }

  const canSubmit = name.trim().length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-indigo-500 to-violet-600 p-2 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            Nova Escala de Trabalho
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ws-name"
                ref={nameRef}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Comercial, Administrativo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-break">Intervalo (minutos)</Label>
              <Input
                id="ws-break"
                type="number"
                min={0}
                max={480}
                value={breakDuration}
                onChange={e => setBreakDuration(Number(e.target.value))}
                placeholder="60"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ws-desc">Descrição</Label>
              <Textarea
                id="ws-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva a escala de trabalho"
                rows={2}
              />
            </div>
          </div>

          {/* Jornada semanal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Jornada Semanal</h4>
            <div className="space-y-2">
              {WEEK_DAYS.map(day => {
                const d = days[day];
                return (
                  <div
                    key={day}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg border ${
                      d.enabled
                        ? 'bg-background border-border'
                        : 'bg-muted/50 border-transparent'
                    }`}
                  >
                    <Switch
                      checked={d.enabled}
                      onCheckedChange={checked =>
                        updateDay(day, 'enabled', checked)
                      }
                    />
                    <span className="font-medium w-20 text-sm">
                      {getDayLabel(day)}
                    </span>
                    {d.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={d.start}
                          onChange={e =>
                            updateDay(day, 'start', e.target.value)
                          }
                          className="w-32 h-8 text-sm"
                        />
                        <span className="text-muted-foreground text-sm">
                          até
                        </span>
                        <Input
                          type="time"
                          value={d.end}
                          onChange={e => updateDay(day, 'end', e.target.value)}
                          className="w-32 h-8 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Folga
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Escala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
