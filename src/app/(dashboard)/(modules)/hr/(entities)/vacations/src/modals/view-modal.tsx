'use client';

/**
 * OpenSea OS - View Vacation Period Modal (HR)
 *
 * Modal de visualização detalhada de um período de férias.
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VacationPeriod } from '@/types/hr';
import {
  Calendar,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  Palmtree,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate, getStatusLabel, getStatusColor } from '../utils';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacation: VacationPeriod | null;
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ViewModal({ isOpen, onClose, vacation }: ViewModalProps) {
  const router = useRouter();

  if (!vacation) return null;

  const usedPercent =
    vacation.totalDays > 0
      ? Math.round(
          ((vacation.usedDays + vacation.soldDays) / vacation.totalDays) * 100
        )
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Palmtree className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">Férias</span>
                {getStatusLabel(vacation.status)}
              </div>
            </div>
          </DialogTitle>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(`/hr/vacations/${vacation.id}`);
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver Detalhes</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClose()}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fechar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusColor(vacation.status)}>
              {getStatusLabel(vacation.status)}
            </Badge>
          </div>

          {/* Período Aquisitivo */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período Aquisitivo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p className="text-base mt-1">
                  {formatDate(vacation.acquisitionStart)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fim</p>
                <p className="text-base mt-1">
                  {formatDate(vacation.acquisitionEnd)}
                </p>
              </div>
            </div>
          </Card>

          {/* Período Concessivo */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Período Concessivo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p className="text-base mt-1">
                  {formatDate(vacation.concessionStart)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fim</p>
                <p className="text-base mt-1">
                  {formatDate(vacation.concessionEnd)}
                </p>
              </div>
            </div>
          </Card>

          {/* Dias */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Dias
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold mt-1">
                  {vacation.totalDays}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usados</p>
                <p className="text-lg font-semibold mt-1 text-blue-600">
                  {vacation.usedDays}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendidos</p>
                <p className="text-lg font-semibold mt-1 text-amber-600">
                  {vacation.soldDays}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Restantes</p>
                <p className="text-lg font-semibold mt-1 text-green-600">
                  {vacation.remainingDays}
                </p>
              </div>
            </div>
            <Progress value={usedPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {usedPercent}% utilizado ({vacation.usedDays} usados +{' '}
              {vacation.soldDays} vendidos)
            </p>
          </Card>

          {/* Agendamento (if scheduled) */}
          {(vacation.scheduledStart || vacation.scheduledEnd) && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Agendamento
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Início Agendado
                  </p>
                  <p className="text-base mt-1">
                    {formatDate(vacation.scheduledStart)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fim Agendado</p>
                  <p className="text-base mt-1">
                    {formatDate(vacation.scheduledEnd)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Notas */}
          {vacation.notes && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observações
              </h3>
              <p className="text-sm">{vacation.notes}</p>
            </Card>
          )}

          {/* Metadados */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Criado em: {formatDateTime(vacation.createdAt)}</span>
            <span>Atualizado em: {formatDateTime(vacation.updatedAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewModal;
