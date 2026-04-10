'use client';

import { cn } from '@/lib/utils';
import { Printer, Wifi, WifiOff } from 'lucide-react';
import { useRemotePrinters } from '../hooks/use-remote-printers';
import type { RemotePrinter, PrinterStatus } from '@/types/sales';

interface RemotePrinterSelectorProps {
  selectedPrinterId: string | null;
  onSelect: (printer: RemotePrinter) => void;
}

const STATUS_CONFIG: Record<PrinterStatus, { color: string; label: string }> = {
  ONLINE: { color: 'bg-green-500', label: 'Online' },
  OFFLINE: { color: 'bg-gray-400', label: 'Offline' },
  BUSY: { color: 'bg-amber-500', label: 'Ocupada' },
  ERROR: { color: 'bg-rose-500', label: 'Erro' },
  UNKNOWN: { color: 'bg-gray-300', label: 'Desconhecido' },
};

export function RemotePrinterSelector({
  selectedPrinterId,
  onSelect,
}: RemotePrinterSelectorProps) {
  const { printers, isLoading, hasOnlinePrinter } = useRemotePrinters();

  // Group by agentName
  const grouped = printers.reduce<Record<string, RemotePrinter[]>>((acc, p) => {
    const key = p.agentName || 'Sem agente';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        <Printer className="w-4 h-4 mr-2 animate-pulse" />
        Buscando impressoras...
      </div>
    );
  }

  if (printers.length === 0 || !hasOnlinePrinter) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
        <WifiOff className="w-8 h-8 mb-2 opacity-40" />
        <p className="font-medium">Nenhuma impressora disponivel</p>
        <p className="text-xs mt-1">Verifique se o agente esta conectado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([agentName, agentPrinters]) => (
        <div key={agentName}>
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {agentName}
            </span>
          </div>
          <div className="space-y-1">
            {agentPrinters.map(printer => {
              const config = STATUS_CONFIG[printer.status];
              const isOnline = printer.status === 'ONLINE';
              const isSelected = selectedPrinterId === printer.id;

              return (
                <button
                  key={printer.id}
                  onClick={() => isOnline && onSelect(printer)}
                  disabled={!isOnline}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                      : 'border-border hover:border-blue-300 dark:hover:border-blue-500/30',
                    !isOnline && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      config.color
                    )}
                  />
                  <span className="flex-1 text-sm font-medium truncate">
                    {printer.name}
                  </span>
                  {printer.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 font-medium">
                      padrao
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
