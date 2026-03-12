'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { TimeEntry } from '@/types/hr';
import { Timer } from 'lucide-react';
import { formatDateTime, getEntryTypeColor, getEntryTypeLabel } from '../utils';

interface ViewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimeEntry | null;
}

export function ViewEntryModal({
  isOpen,
  onClose,
  entry,
}: ViewEntryModalProps) {
  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-cyan-500 to-cyan-600 p-2 rounded-lg">
              <Timer className="h-5 w-5" />
            </div>
            Registro de Ponto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24">Tipo:</span>
            <Badge className={getEntryTypeColor(entry.entryType)}>
              {getEntryTypeLabel(entry.entryType)}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24">Horário:</span>
            <span className="font-medium">
              {formatDateTime(entry.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24">
              Funcionário:
            </span>
            <span className="text-sm font-mono">{entry.employeeId}</span>
          </div>
          {entry.latitude != null && entry.longitude != null && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">
                Localização:
              </span>
              <span className="text-sm">
                {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
              </span>
            </div>
          )}
          {entry.ipAddress && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">IP:</span>
              <span className="text-sm font-mono">{entry.ipAddress}</span>
            </div>
          )}
          {entry.notes && (
            <div className="flex items-start gap-3">
              <span className="text-sm text-muted-foreground w-24">Notas:</span>
              <span className="text-sm">{entry.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24">
              Registrado em:
            </span>
            <span className="text-sm">{formatDateTime(entry.createdAt)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
