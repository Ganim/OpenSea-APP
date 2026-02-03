'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ACTION_STYLES, MODULE_COLORS, MODULE_LABELS } from '../constants';
import type { AuditModule } from '../types';

export const AuditLegend: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="col-span-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
          Ações e ícones
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ACTION_STYLES).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <Badge
                key={key}
                variant="outline"
                className={cn('gap-2 border', meta.bg, meta.border, meta.text)}
              >
                <Icon className="w-3 h-3" />
                <span className="text-xs capitalize">
                  {key.replace(/_/g, ' ').toLowerCase()}
                </span>
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
          Módulos
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MODULE_LABELS) as AuditModule[]).map(module => (
            <Badge
              key={module}
              variant="outline"
              className={cn(
                'text-xs border',
                MODULE_COLORS[module]?.bg,
                MODULE_COLORS[module]?.text,
                MODULE_COLORS[module]?.border
              )}
            >
              {MODULE_LABELS[module]}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="lg:col-span-3" />
    </div>
  );
};
