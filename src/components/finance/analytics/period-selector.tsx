'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface PeriodSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

const PRESETS: { label: string; getRange: () => DateRange }[] = [
  {
    label: 'Hoje',
    getRange: () => {
      const today = toISO(new Date());
      return { startDate: today, endDate: today };
    },
  },
  {
    label: '7 dias',
    getRange: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      return { startDate: toISO(start), endDate: toISO(end) };
    },
  },
  {
    label: '30 dias',
    getRange: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 30);
      return { startDate: toISO(start), endDate: toISO(end) };
    },
  },
  {
    label: '90 dias',
    getRange: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 90);
      return { startDate: toISO(start), endDate: toISO(end) };
    },
  },
  {
    label: 'Este mes',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: toISO(start), endDate: toISO(end) };
    },
  },
  {
    label: 'Este ano',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { startDate: toISO(start), endDate: toISO(end) };
    },
  },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(preset => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => {
              setShowCustom(false);
              onChange(preset.getRange());
            }}
          >
            {preset.label}
          </Button>
        ))}
        <Button
          variant={showCustom ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
        >
          Personalizado
        </Button>
      </div>

      {showCustom && (
        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="custom-start">Inicio</Label>
            <Input
              id="custom-start"
              type="date"
              value={value.startDate}
              onChange={e => onChange({ ...value, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="custom-end">Fim</Label>
            <Input
              id="custom-end"
              type="date"
              value={value.endDate}
              onChange={e => onChange({ ...value, endDate: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
