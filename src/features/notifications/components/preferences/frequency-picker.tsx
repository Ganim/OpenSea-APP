'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { NotificationFrequency } from '../../types';

export const FREQUENCY_LABELS: Record<NotificationFrequency, string> = {
  [NotificationFrequency.INSTANT]: 'Instantâneo',
  [NotificationFrequency.HOURLY_DIGEST]: 'Resumo por hora',
  [NotificationFrequency.DAILY_DIGEST]: 'Resumo diário',
  [NotificationFrequency.WEEKLY_DIGEST]: 'Resumo semanal',
  [NotificationFrequency.DISABLED]: 'Desativado',
};

interface Props {
  value: NotificationFrequency;
  digestSupported: boolean;
  disabled?: boolean;
  onChange: (value: NotificationFrequency) => void;
}

export function FrequencyPicker({
  value,
  digestSupported,
  disabled,
  onChange,
}: Props) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={v => onChange(v as NotificationFrequency)}
    >
      <SelectTrigger
        className="h-8 w-[150px] text-xs"
        aria-label="Frequência de notificação"
      >
        <SelectValue placeholder="Frequência" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NotificationFrequency.INSTANT}>
          {FREQUENCY_LABELS[NotificationFrequency.INSTANT]}
        </SelectItem>
        {digestSupported && (
          <>
            <SelectItem value={NotificationFrequency.HOURLY_DIGEST}>
              {FREQUENCY_LABELS[NotificationFrequency.HOURLY_DIGEST]}
            </SelectItem>
            <SelectItem value={NotificationFrequency.DAILY_DIGEST}>
              {FREQUENCY_LABELS[NotificationFrequency.DAILY_DIGEST]}
            </SelectItem>
            <SelectItem value={NotificationFrequency.WEEKLY_DIGEST}>
              {FREQUENCY_LABELS[NotificationFrequency.WEEKLY_DIGEST]}
            </SelectItem>
          </>
        )}
        <SelectItem value={NotificationFrequency.DISABLED}>
          {FREQUENCY_LABELS[NotificationFrequency.DISABLED]}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
