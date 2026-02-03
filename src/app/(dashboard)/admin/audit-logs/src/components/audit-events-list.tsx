'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import type { AuditLog } from '../types';
import { AuditEventCard } from './audit-event-card';

interface AuditEventsListProps {
  logs: AuditLog[];
  isLoading?: boolean;
  onSelectLog?: (log: AuditLog) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const AuditEventsList: React.FC<AuditEventsListProps> = ({
  logs,
  isLoading = false,
  onSelectLog,
  onLoadMore,
  hasMore = false,
}) => {
  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4 space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (!isLoading && logs.length === 0) {
    return (
      <Card className="p-10 text-center border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
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
    <div className="space-y-3">
      {logs.map(log => (
        <AuditEventCard key={log.id} log={log} onSelect={onSelectLog} />
      ))}

      {hasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
};
