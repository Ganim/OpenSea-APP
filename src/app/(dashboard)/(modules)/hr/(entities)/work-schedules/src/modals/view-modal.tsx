'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { WorkSchedule } from '@/types/hr';
import { Calendar, Clock, Edit, RefreshCcwDot, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  WEEK_DAYS,
  getDayLabel,
  getDaySchedule,
  formatDayRange,
  formatWeeklyHours,
} from '../utils';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workSchedule: WorkSchedule | null;
}

export function ViewModal({ isOpen, onClose, workSchedule }: ViewModalProps) {
  const router = useRouter();

  if (!workSchedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-indigo-500 to-violet-600 p-2 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">
                  Escala de Trabalho
                </span>
                {workSchedule.name.length > 32
                  ? `${workSchedule.name.substring(0, 32)}...`
                  : workSchedule.name}
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
                    router.push(`/hr/work-schedules/${workSchedule.id}`);
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
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
          {/* Dados Básicos */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados da Escala</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-base mt-1">{workSchedule.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas Semanais</p>
                <p className="text-base mt-1">
                  {formatWeeklyHours(workSchedule.weeklyHours)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Intervalo (min)
                </p>
                <p className="text-base mt-1">
                  {workSchedule.breakDuration} minutos
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-base mt-1">
                  {workSchedule.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Inativo
                    </span>
                  )}
                </p>
              </div>
              {workSchedule.description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-base mt-1">{workSchedule.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Horários por dia */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Jornada Semanal</h3>
            <div className="space-y-2">
              {WEEK_DAYS.map(day => {
                const { start, end } = getDaySchedule(workSchedule, day);
                const isOff = !start || !end;
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      isOff
                        ? 'bg-muted/50 text-muted-foreground'
                        : 'bg-primary/5'
                    }`}
                  >
                    <span className="font-medium w-24">
                      {getDayLabel(day)}
                    </span>
                    <span className={isOff ? 'italic' : ''}>
                      {formatDayRange(start, end)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Metadados */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metadados</h3>
            <div className="space-y-3">
              {workSchedule.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-500">Criado em:</span>
                  <span className="font-medium">
                    {new Date(workSchedule.createdAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </div>
              )}
              {workSchedule.updatedAt &&
                workSchedule.updatedAt !== workSchedule.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCcwDot className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-500">Atualizado em:</span>
                    <span className="font-medium">
                      {new Date(workSchedule.updatedAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
