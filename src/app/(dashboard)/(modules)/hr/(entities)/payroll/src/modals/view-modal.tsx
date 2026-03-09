'use client';

import { Badge } from '@/components/ui/badge';
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
import type { Payroll } from '@/types/hr';
import {
  CalendarDays,
  Calendar,
  RefreshCcwDot,
  X,
  User,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  getStatusLabel,
  getStatusColor,
} from '../utils';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: Payroll | null;
}

export function ViewModal({ isOpen, onClose, payroll }: ViewModalProps) {
  if (!payroll) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-sky-500 to-sky-600 p-2 rounded-lg">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">
                  Folha de Pagamento
                </span>
                {formatMonthYear(payroll.referenceMonth, payroll.referenceYear)}
              </div>
            </div>
          </DialogTitle>
          <div className="flex items-center">
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
          {/* Badge de status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusColor(payroll.status)}>
              {getStatusLabel(payroll.status)}
            </Badge>
          </div>

          {/* Informações */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Mês/Ano de Referência
                </p>
                <p className="text-base mt-1">
                  {formatMonthYear(
                    payroll.referenceMonth,
                    payroll.referenceYear
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-base mt-1">
                  {getStatusLabel(payroll.status)}
                </p>
              </div>
            </div>
          </Card>

          {/* Valores */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Valores</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bruto</p>
                <p className="text-base mt-1 font-semibold text-green-600">
                  {formatCurrency(payroll.totalGross)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deduções</p>
                <p className="text-base mt-1 font-semibold text-red-600">
                  {formatCurrency(payroll.totalDeductions)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Líquido</p>
                <p className="text-base mt-1 font-bold text-blue-600">
                  {formatCurrency(payroll.totalNet)}
                </p>
              </div>
            </div>
          </Card>

          {/* Processamento */}
          {(payroll.processedBy ||
            payroll.processedAt ||
            payroll.approvedBy ||
            payroll.approvedAt ||
            payroll.paidBy ||
            payroll.paidAt) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Processamento</h3>
              <div className="space-y-3">
                {payroll.processedBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-sky-500" />
                    <span className="text-gray-500">Processado por:</span>
                    <span className="font-medium font-mono text-xs">
                      {payroll.processedBy}
                    </span>
                  </div>
                )}
                {payroll.processedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-sky-500" />
                    <span className="text-gray-500">Processado em:</span>
                    <span className="font-medium">
                      {formatDate(payroll.processedAt)}
                    </span>
                  </div>
                )}
                {payroll.approvedBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-500">Aprovado por:</span>
                    <span className="font-medium font-mono text-xs">
                      {payroll.approvedBy}
                    </span>
                  </div>
                )}
                {payroll.approvedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-gray-500">Aprovado em:</span>
                    <span className="font-medium">
                      {formatDate(payroll.approvedAt)}
                    </span>
                  </div>
                )}
                {payroll.paidBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-gray-500">Pago por:</span>
                    <span className="font-medium font-mono text-xs">
                      {payroll.paidBy}
                    </span>
                  </div>
                )}
                {payroll.paidAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span className="text-gray-500">Pago em:</span>
                    <span className="font-medium">
                      {formatDate(payroll.paidAt)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Metadados */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metadados</h3>
            <div className="space-y-3">
              {payroll.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-500">Criado em:</span>
                  <span className="font-medium">
                    {formatDate(payroll.createdAt)}
                  </span>
                </div>
              )}
              {payroll.updatedAt && payroll.updatedAt !== payroll.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCcwDot className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-500">Atualizado em:</span>
                  <span className="font-medium">
                    {formatDate(payroll.updatedAt)}
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
