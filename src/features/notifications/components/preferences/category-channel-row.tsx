'use client';

import {
  Bell,
  Check,
  Mail,
  MessageCircle,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { memo } from 'react';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import {
  NotificationChannel,
  NotificationFrequency,
  type NotificationCategoryManifest,
  type NotificationPreferenceRow,
} from '../../types';
import { FrequencyPicker } from './frequency-picker';

export const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; icon: typeof Bell }
> = {
  [NotificationChannel.IN_APP]: { label: 'No app', icon: Bell },
  [NotificationChannel.EMAIL]: { label: 'E-mail', icon: Mail },
  [NotificationChannel.PUSH]: { label: 'Push', icon: Monitor },
  [NotificationChannel.SMS]: { label: 'SMS', icon: Smartphone },
  [NotificationChannel.WHATSAPP]: { label: 'WhatsApp', icon: MessageCircle },
};

const DEFAULT_CHANNELS: NotificationChannel[] = [
  NotificationChannel.IN_APP,
  NotificationChannel.EMAIL,
  NotificationChannel.PUSH,
  NotificationChannel.SMS,
];

interface Props {
  category: NotificationCategoryManifest;
  moduleEnabled: boolean;
  prefsByChannel: Partial<
    Record<NotificationChannel, NotificationPreferenceRow>
  >;
  onChange: (rows: NotificationPreferenceRow[]) => void;
}

function rowFrequency(
  prefs: Partial<Record<NotificationChannel, NotificationPreferenceRow>>
): NotificationFrequency {
  const first = Object.values(prefs).find(Boolean);
  return first?.frequency ?? NotificationFrequency.INSTANT;
}

function channelEnabled(
  pref: NotificationPreferenceRow | undefined,
  channel: NotificationChannel,
  defaults: string[]
): boolean {
  if (pref) return pref.isEnabled;
  return defaults.includes(channel);
}

function CategoryChannelRowBase({
  category,
  moduleEnabled,
  prefsByChannel,
  onChange,
}: Props) {
  const frequency = rowFrequency(prefsByChannel);
  const disabled = !moduleEnabled || category.mandatory;

  const handleChannelToggle = (
    channel: NotificationChannel,
    nextEnabled: boolean
  ) => {
    onChange([
      {
        categoryCode: category.code,
        channel,
        isEnabled: nextEnabled,
        frequency,
      },
    ]);
  };

  const handleFrequencyChange = (nextFrequency: NotificationFrequency) => {
    const rows: NotificationPreferenceRow[] = DEFAULT_CHANNELS.map(ch => ({
      categoryCode: category.code,
      channel: ch,
      isEnabled: channelEnabled(
        prefsByChannel[ch],
        ch,
        category.defaultChannels
      ),
      frequency: nextFrequency,
    }));
    onChange(rows);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2.5 px-1',
        disabled && 'opacity-60'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {category.name}
          {category.mandatory && (
            <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
              obrigatório
            </span>
          )}
        </p>
        {category.description && (
          <p className="text-xs text-gray-500 dark:text-white/50 truncate">
            {category.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <FrequencyPicker
          value={frequency}
          digestSupported={category.digestSupported}
          disabled={disabled}
          onChange={handleFrequencyChange}
        />

        <div className="flex items-center gap-1.5">
          {DEFAULT_CHANNELS.map(channel => {
            const meta = CHANNEL_META[channel];
            const Icon = meta.icon;
            const enabled = channelEnabled(
              prefsByChannel[channel],
              channel,
              category.defaultChannels
            );
            return (
              <button
                key={channel}
                type="button"
                disabled={disabled}
                onClick={() => handleChannelToggle(channel, !enabled)}
                aria-label={`${meta.label} — ${enabled ? 'ativo' : 'inativo'}`}
                aria-pressed={enabled}
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
                  enabled
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30',
                  !disabled && 'hover:bg-gray-50 dark:hover:bg-white/5',
                  disabled && 'cursor-not-allowed'
                )}
              >
                <Icon className="w-4 h-4" />
                {enabled && (
                  <Check className="absolute -right-1 -top-1 w-3 h-3 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Memoize so flipping one channel doesn't re-render sibling categories.
export const CategoryChannelRow = memo(CategoryChannelRowBase);

// Re-export for convenience
export { Switch };
