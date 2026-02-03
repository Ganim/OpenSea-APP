'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Variant } from '@/types/stock';
import {
  AlertTriangle,
  ClockAlert,
  Edit2,
  LockKeyhole,
  Palette,
  Plus,
  Slash,
  Trash2,
} from 'lucide-react';
import { memo } from 'react';

interface VariantListProps {
  variants: Variant[];
  onEdit: (variant: Variant) => void;
  onDelete: (variantId: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

/**
 * Lista de variantes em formato tabular com ações
 */
export const VariantList = memo(function VariantList({
  variants,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
}: VariantListProps) {
  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma variante cadastrada
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Comece criando a primeira variante do produto
          </p>
        </div>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Primeira Variante
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 ">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-900/50 h-12 ">
              <TableHead className="font-semibold w-12">Cor</TableHead>
              <TableHead className="font-semibold">Variante</TableHead>
              <TableHead className="text-right font-semibold">
                Est. Mín.
              </TableHead>
              <TableHead className="text-right font-semibold">
                Est. Máx.
              </TableHead>
              <TableHead className="text-right font-semibold">
                Custo / Margem
              </TableHead>
              <TableHead className="text-right font-semibold">Preço</TableHead>
              <TableHead className="w-24 text-center font-semibold">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, idx) => (
              <TableRow
                key={variant.id}
                className={
                  idx % 2 === 0
                    ? 'bg-white dark:bg-slate-900/30'
                    : 'bg-gray-50/50 dark:bg-slate-900/10'
                }
              >
                <TableCell className="text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    {variant.colorHex ? (
                      <div
                        className="h-4 w-8 rounded border border-gray-200 dark:border-slate-700"
                        style={{ backgroundColor: variant.colorHex }}
                        title={variant.colorHex}
                      />
                    ) : (
                      <div
                        className="flex items-center gap-1 text-muted-foreground"
                        title="Cor não definida"
                      >
                        <Palette className="h-4 w-4" />
                        <Slash className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {variant.name}
                      {variant.reference && (
                        <span className="ml-1 text-sm text-muted-foreground">
                          - {variant.reference}
                        </span>
                      )}
                    </span>
                    {/* Ícones de status */}
                    <TooltipProvider>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {variant.outOfLine && (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <ClockAlert className="h-4 w-4 text-amber-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Fora de linha</TooltipContent>
                          </Tooltip>
                        )}
                        {variant.isActive === false && (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <LockKeyhole className="h-4 w-4 text-slate-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Desativado</TooltipContent>
                          </Tooltip>
                        )}
                        {(variant.minStock !== undefined ||
                          variant.maxStock !== undefined ||
                          variant.reorderPoint !== undefined ||
                          variant.reorderQuantity !== undefined) && (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-4 w-4 text-yellow-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Alertas de estoque/reposição configurados
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="text-right text-gray-700 dark:text-gray-300">
                  {variant.minStock ?? '—'}
                </TableCell>
                <TableCell className="text-right text-gray-700 dark:text-gray-300">
                  {variant.maxStock ?? '—'}
                </TableCell>
                <TableCell className="text-right text-gray-700 dark:text-gray-300">
                  {variant.costPrice !== undefined ||
                  variant.profitMargin !== undefined ? (
                    <div className="flex flex-col items-end">
                      <span>
                        {variant.costPrice !== undefined
                          ? `R$ ${variant.costPrice.toFixed(2)}`
                          : '—'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {variant.profitMargin !== undefined
                          ? `${variant.profitMargin.toFixed(1)}%`
                          : '—'}
                      </span>
                    </div>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right text-gray-700 dark:text-gray-300">
                  {variant.price !== undefined
                    ? `R$ ${variant.price.toFixed(2)}`
                    : '—'}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(variant)}
                            disabled={isLoading}
                          >
                            <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(variant.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

VariantList.displayName = 'VariantList';
