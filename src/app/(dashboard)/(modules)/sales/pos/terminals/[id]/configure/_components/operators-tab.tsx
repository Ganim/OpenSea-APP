'use client';

import { useState } from 'react';
import { Loader2, Plus, Users, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GridError } from '@/components/handlers/grid-error';
import {
  usePosTerminalOperators,
  useRevokeTerminalOperator,
} from '@/hooks/sales/use-pos-terminal-operators';
import { formatDate } from '@/lib/utils';
import { OperatorSelector } from './operator-selector';

/**
 * "Operadores" tab of the POS Terminal configure page (Emporion Fase 1).
 *
 * Lists Employees authorized to operate sales on the terminal (using their
 * `shortId`) and offers a search dialog to authorize new operators.
 */
export function OperatorsTab({ terminalId }: { terminalId: string }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { data, isLoading, error, refetch } = usePosTerminalOperators(
    terminalId,
    { page: 1, limit: 100, isActive: 'true' }
  );
  const revoke = useRevokeTerminalOperator(terminalId);

  if (error) {
    return (
      <GridError
        title="Erro ao carregar operadores"
        message={
          error instanceof Error
            ? error.message
            : 'Não foi possível buscar os operadores deste terminal.'
        }
        action={{
          label: 'Tentar novamente',
          onClick: () => {
            void refetch();
          },
        }}
      />
    );
  }

  const operators = data?.data ?? [];
  const existingIds = operators.map(o => o.employeeId);

  return (
    <div className="space-y-4" data-testid="operators-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold">Operadores autorizados</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Apenas funcionários listados aqui podem operar vendas neste
            terminal, identificando-se com o código curto. Revogações são
            registradas em auditoria e tomam efeito imediatamente.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          data-testid="operators-tab-add"
        >
          <Plus className="h-4 w-4" />
          Adicionar operador
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : operators.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Nenhum operador autorizado. Adicione pelo menos um funcionário antes
          de abrir vendas.
        </div>
      ) : (
        <ul className="space-y-2" data-testid="operators-list">
          {operators.map(op => (
            <li
              key={op.operatorId}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-3 dark:bg-white/5"
              data-testid={`operator-row-${op.employeeId}`}
            >
              <div className="flex-1 min-w-[14rem]">
                <p className="font-medium">{op.employeeName}</p>
                <p className="text-sm text-muted-foreground">
                  Código curto{' '}
                  <span className="font-mono tracking-widest">
                    {op.employeeShortId}
                  </span>
                  <span className="mx-2">·</span>
                  Autorizado em {formatDate(op.assignedAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => revoke.mutate(op.employeeId)}
                disabled={revoke.isPending}
                data-testid={`operator-row-${op.employeeId}-revoke`}
              >
                <UserMinus className="h-4 w-4" />
                Revogar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <OperatorSelector
        terminalId={terminalId}
        existingEmployeeIds={existingIds}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />
    </div>
  );
}
