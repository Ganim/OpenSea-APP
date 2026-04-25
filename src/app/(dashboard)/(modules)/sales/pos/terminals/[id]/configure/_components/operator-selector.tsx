'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useAssignTerminalOperator } from '@/hooks/sales/use-pos-terminal-operators';
import { employeesService } from '@/services/hr/employees.service';

interface OperatorSelectorProps {
  terminalId: string;
  existingEmployeeIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog that searches active Employees and authorizes them as operators of
 * a POS Terminal (Emporion Fase 1). Filters out employees already linked.
 */
export function OperatorSelector({
  terminalId,
  existingEmployeeIds,
  open,
  onOpenChange,
}: OperatorSelectorProps) {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const assign = useAssignTerminalOperator(terminalId);

  const { data, isLoading } = useQuery({
    queryKey: ['pos-operator-search', debounced],
    queryFn: () =>
      employeesService.listEmployees({
        perPage: 20,
        status: 'ACTIVE',
        search: debounced || undefined,
      }),
    enabled: open,
  });

  const candidates = useMemo(() => {
    const all = data?.employees ?? [];
    const linked = new Set(existingEmployeeIds);
    return all.filter(emp => !linked.has(emp.id));
  }, [data, existingEmployeeIds]);

  const handleAssign = (employeeId: string) => {
    assign.mutate(employeeId, {
      onSuccess: () => {
        onOpenChange(false);
        setSearch('');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        data-testid="operator-selector-dialog"
      >
        <DialogHeader>
          <DialogTitle>Adicionar operador</DialogTitle>
          <DialogDescription>
            Busque pelo nome ou matrícula do funcionário para autorizá-lo neste
            terminal. O funcionário usará seu código curto para identificar-se
            no POS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar funcionário…"
              className="pl-9"
              data-testid="operator-selector-search"
            />
          </div>

          <div className="max-h-72 overflow-y-auto rounded-md border border-border">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum funcionário disponível para esta busca.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {candidates.map(emp => (
                  <li
                    key={emp.id}
                    className="flex items-center justify-between gap-3 p-3"
                    data-testid={`operator-candidate-${emp.id}`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{emp.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        Matrícula{' '}
                        <span className="font-mono">
                          {emp.registrationNumber}
                        </span>
                        {emp.shortId && (
                          <>
                            {' · Código curto '}
                            <span className="font-mono tracking-widest">
                              {emp.shortId}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAssign(emp.id)}
                      disabled={assign.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                      Autorizar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
