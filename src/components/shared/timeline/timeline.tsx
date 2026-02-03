/**
 * Timeline Component
 * Componente reutilizável para exibir eventos em formato de linha do tempo
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Circle, Clock } from 'lucide-react';
import React from 'react';

// ============================================
// TYPES
// ============================================

export interface TimelineItemData {
  id: string;
  type?:
    | 'create'
    | 'update'
    | 'delete'
    | 'restore'
    | 'info'
    | 'warning'
    | 'error'
    | 'success';
  title: string;
  description?: string;
  timestamp: string | Date;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: React.ReactNode;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
    label?: string;
  }>;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: React.ReactNode;
  onClick?: () => void;
}

export interface TimelineGroupData {
  date: string;
  items: TimelineItemData[];
}

interface TimelineProps {
  items: TimelineItemData[];
  grouped?: boolean;
  showConnector?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

// ============================================
// HELPERS
// ============================================

const getTypeConfig = (type?: TimelineItemData['type']) => {
  const configs = {
    create: {
      icon: Circle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    update: {
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    delete: {
      icon: Circle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    restore: {
      icon: Circle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    success: {
      icon: Check,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    info: {
      icon: Circle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    warning: {
      icon: Circle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    error: {
      icon: Circle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
  };

  return configs[type || 'info'];
};

const formatTimestamp = (timestamp: string | Date) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDate = (timestamp: string | Date) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const groupItemsByDate = (items: TimelineItemData[]): TimelineGroupData[] => {
  const grouped: Record<string, TimelineItemData[]> = {};

  items.forEach(item => {
    const date = formatDate(item.timestamp);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });

  return Object.entries(grouped).map(([date, items]) => ({
    date,
    items,
  }));
};

// ============================================
// COMPONENTS
// ============================================

const TimelineItem: React.FC<{
  item: TimelineItemData;
  showConnector?: boolean;
  isLast?: boolean;
  variant?: 'default' | 'compact';
}> = ({ item, showConnector = true, isLast = false, variant = 'default' }) => {
  const config = getTypeConfig(item.type);
  const Icon = item.icon || config.icon;

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center rounded-full border-2',
            config.borderColor,
            config.bgColor,
            variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10',
            item.onClick &&
              'group-hover:scale-110 transition-transform cursor-pointer'
          )}
        >
          <Icon
            className={cn(
              config.color,
              variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'
            )}
          />
        </div>
        {showConnector && !isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 bg-linear-to-b from-gray-300 to-transparent dark:from-gray-700',
              variant === 'compact' ? 'min-h-8' : 'min-h-12'
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <Card
          className={cn(
            'p-4 backdrop-blur-xl bg-white/80 dark:bg-white/5 border-gray-200/50 dark:border-white/10',
            'hover:shadow-md transition-all duration-200',
            item.onClick &&
              'cursor-pointer hover:border-gray-300 dark:hover:border-white/20'
          )}
          onClick={item.onClick}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.description}
                </p>
              )}
            </div>
            {item.badge && (
              <Badge variant={item.badge.variant || 'default'}>
                {item.badge.label}
              </Badge>
            )}
          </div>

          {/* Changes */}
          {item.changes && item.changes.length > 0 && (
            <div className="mt-3 space-y-2">
              {item.changes.map((change, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-white/5 rounded p-2"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {change.label || change.field}:
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 line-through">
                    {String(change.oldValue)}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">→</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {String(change.newValue)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
          {item.metadata && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {item.metadata}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50 dark:border-white/10">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {item.user && (
                <>
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-[10px] font-semibold">
                      {item.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{item.user.name}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                </>
              )}
              <span>{formatTimestamp(item.timestamp)}</span>
            </div>
            {item.action && <div>{item.action}</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const Timeline: React.FC<TimelineProps> = ({
  items,
  grouped = false,
  showConnector = true,
  className,
  variant = 'default',
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum evento para exibir
        </p>
      </div>
    );
  }

  if (grouped) {
    const groups = groupItemsByDate(items);

    return (
      <div className={cn('space-y-8', className)}>
        {groups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {group.date}
            </h3>
            <div className="space-y-0">
              {group.items.map((item, itemIdx) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  showConnector={showConnector}
                  isLast={itemIdx === group.items.length - 1}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, idx) => (
        <TimelineItem
          key={item.id}
          item={item}
          showConnector={showConnector}
          isLast={idx === items.length - 1}
          variant={variant}
        />
      ))}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================
