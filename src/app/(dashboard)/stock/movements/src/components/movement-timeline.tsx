'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ItemMovement } from '@/types/stock';
import { Calendar, History, Loader2 } from 'lucide-react';
import { MovementRow } from './movement-row';

interface MovementTimelineProps {
  groupedMovements: Record<string, ItemMovement[]>;
  filteredMovementsCount: number;
  isLoading: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function MovementTimeline({
  groupedMovements,
  filteredMovementsCount,
  isLoading,
  hasFilters,
  onResetFilters,
}: MovementTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Historico
          <Badge variant="secondary" className="ml-2">
            {filteredMovementsCount} movimentacao(oes)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMovementsCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <History className="h-12 w-12 mb-4" />
            <p>Nenhuma movimentacao encontrada</p>
            {hasFilters && (
              <Button
                variant="link"
                size="sm"
                onClick={onResetFilters}
                className="mt-2"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedMovements).map(([date, dayMovements]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {date}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {dayMovements.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {dayMovements.map(movement => (
                      <MovementRow key={movement.id} movement={movement} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
