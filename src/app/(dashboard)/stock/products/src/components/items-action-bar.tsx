/**
 * ItemsActionBar - Floating action bar for selected items
 * Shows actions available for selected items
 */

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowRightLeft,
  Bookmark,
  FileText,
  LogOut,
  Printer,
  Wrench,
  X,
} from 'lucide-react';

export interface ItemsActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Callback when clear selection is clicked */
  onClearSelection: () => void;
  /** Callback when "Mudar Local" is clicked */
  onChangeLocation: () => void;
  /** Callback when "Enviar para OS" is clicked */
  onSendToServiceOrder: () => void;
  /** Callback when "Enviar para Orçamento" is clicked */
  onSendToQuote: () => void;
  /** Callback when "Reservar Item" is clicked */
  onReserveItem: () => void;
  /** Callback when "Imprimir Etiqueta" is clicked */
  onPrintLabel: () => void;
  /** Callback when "Dar Saída" is clicked */
  onExit: () => void;
  /** Optional className */
  className?: string;
}

export function ItemsActionBar({
  selectedCount,
  onClearSelection,
  onChangeLocation,
  onSendToServiceOrder,
  onSendToQuote,
  onReserveItem,
  onPrintLabel,
  onExit,
  className,
}: ItemsActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 p-2 rounded-xl',
        'bg-sky-600/95 dark:bg-sky-700/95 backdrop-blur-sm',
        'border border-sky-400/50 dark:border-sky-500/50',
        'shadow-[0_0_30px_rgba(14,165,233,0.4)] dark:shadow-[0_0_30px_rgba(14,165,233,0.3)]',
        'animate-in slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      {/* Selection Count & Clear */}
      <div className="flex items-center gap-2 px-3 border-r border-sky-400/30">
        <span className="text-sm font-medium text-white">
          {selectedCount} {selectedCount === 1 ? 'item' : 'itens'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sky-100 hover:text-white hover:bg-sky-500/50"
          onClick={onClearSelection}
          title="Limpar seleção"
          aria-label="Limpar seleção"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white hover:bg-sky-500/50 gap-1.5"
          onClick={onChangeLocation}
          title="Mudar Local (Transferência de Estoque)"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Mudar Local</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white hover:bg-sky-500/50 gap-1.5"
          onClick={onSendToServiceOrder}
          title="Enviar para Ordem de Serviço"
        >
          <Wrench className="h-4 w-4" />
          <span className="hidden sm:inline">Enviar para OS</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white hover:bg-sky-500/50 gap-1.5"
          onClick={onSendToQuote}
          title="Enviar para Orçamento"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Orçamento</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white hover:bg-sky-500/50 gap-1.5"
          onClick={onReserveItem}
          title="Reservar Item"
        >
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">Reservar</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white hover:bg-sky-500/50 gap-1.5"
          onClick={onPrintLabel}
          title="Imprimir Etiqueta"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Etiqueta</span>
        </Button>

        <div className="h-6 w-px bg-sky-400/30 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="text-red-200 hover:text-white hover:bg-red-500/50 gap-1.5"
          onClick={onExit}
          title="Dar Saída"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Dar Saída</span>
        </Button>
      </div>
    </div>
  );
}
