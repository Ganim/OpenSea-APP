'use client';

import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import {
  NotificationChannel,
  type NotificationModuleManifest,
  type NotificationPreferenceRow,
  type NotificationPreferencesBundle,
} from '../../types';
import { CategoryChannelRow } from './category-channel-row';

interface Props {
  modules: NotificationModuleManifest[];
  preferences: NotificationPreferencesBundle;
  onModuleToggle: (moduleCode: string, enabled: boolean) => void;
  onPreferencesChange: (rows: NotificationPreferenceRow[]) => void;
}

/**
 * Builds a lookup so a category can quickly fetch its current preference
 * per channel: `prefsByCategory.get(categoryCode)?.[channel]`.
 */
function indexPreferences(
  prefs: NotificationPreferenceRow[]
): Map<
  string,
  Partial<Record<NotificationChannel, NotificationPreferenceRow>>
> {
  const map = new Map<
    string,
    Partial<Record<NotificationChannel, NotificationPreferenceRow>>
  >();
  for (const row of prefs) {
    const bucket = map.get(row.categoryCode) ?? {};
    bucket[row.channel] = row;
    map.set(row.categoryCode, bucket);
  }
  return map;
}

export function ModulePreferencesGrid({
  modules,
  preferences,
  onModuleToggle,
  onPreferencesChange,
}: Props) {
  const [openModule, setOpenModule] = useState<string | null>(null);

  const moduleEnabledMap = useMemo(() => {
    const m = new Map<string, boolean>();
    preferences.modules.forEach(mod => m.set(mod.code, mod.isEnabled));
    return m;
  }, [preferences.modules]);

  const prefsIndex = useMemo(
    () => indexPreferences(preferences.preferences),
    [preferences.preferences]
  );

  if (modules.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-white/50 py-4 text-center">
        Nenhum módulo disponível.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-white/5">
      {modules.map(mod => {
        const moduleEnabled = moduleEnabledMap.get(mod.code) ?? true;
        const isOpen = openModule === mod.code;

        return (
          <Collapsible
            key={mod.code}
            open={isOpen}
            onOpenChange={next => setOpenModule(next ? mod.code : null)}
            className="py-2"
          >
            <div className="flex items-center justify-between gap-4">
              <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left group">
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-400 dark:text-white/40 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {mod.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50">
                    {mod.categories.length}{' '}
                    {mod.categories.length === 1 ? 'categoria' : 'categorias'}
                    {!moduleEnabled && ' · desativado'}
                  </p>
                </div>
              </CollapsibleTrigger>
              <Switch
                checked={moduleEnabled}
                onCheckedChange={v => onModuleToggle(mod.code, v)}
                aria-label={`Receber notificações de ${mod.displayName}`}
              />
            </div>

            <CollapsibleContent>
              <div className="pl-7 mt-2 border-l border-gray-100 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5">
                {mod.categories.map(category => (
                  <CategoryChannelRow
                    key={category.code}
                    category={category}
                    moduleEnabled={moduleEnabled}
                    prefsByChannel={prefsIndex.get(category.code) ?? {}}
                    onChange={onPreferencesChange}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
