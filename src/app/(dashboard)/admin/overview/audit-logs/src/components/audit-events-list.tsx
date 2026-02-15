'use client';

import { Card } from '@/components/ui/card';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FileText, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import type { AuditLog } from '../types';
import { AuditEventCard } from './audit-event-card';

interface AuditEventsListProps {
  logs: AuditLog[];
  onSelectLog?: (log: AuditLog) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const AuditEventsList: React.FC<AuditEventsListProps> = ({
  logs,
  onSelectLog,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 10,
  });

  // Scroll ao topo quando os logs mudam por filtro (não por paginação)
  const prevLogsLengthRef = useRef(logs.length);
  useEffect(() => {
    // Se o comprimento diminuiu, é um filtro novo → scroll ao topo
    if (logs.length < prevLogsLengthRef.current) {
      scrollRef.current?.scrollTo({ top: 0 });
    }
    prevLogsLengthRef.current = logs.length;
  }, [logs.length]);

  // Detecção de rolagem infinita
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore || isLoadingMore || !onLoadMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    // Carrega mais quando falta 300px para o fim
    if (distanceToBottom < 300) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (logs.length === 0) {
    return (
      <Card className="p-10 text-center border-dashed border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5">
        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 dark:text-gray-200 font-medium">
          Nenhum log encontrado
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tente ajustar os filtros ou aguarde novas atividades.
        </p>
      </Card>
    );
  }

  return (
    <div ref={scrollRef} className="overflow-auto flex-1 min-h-0">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <div className="pb-2">
              <AuditEventCard
                log={logs[virtualItem.index]}
                onSelect={onSelectLog}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de carregamento no final */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Carregando mais logs...
          </span>
        </div>
      )}
    </div>
  );
};
