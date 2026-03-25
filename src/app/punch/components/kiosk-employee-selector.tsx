'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { employeesService } from '@/services/hr';
import type { Employee } from '@/types/hr';

interface KioskEmployeeSelectorProps {
  onSelect: (employee: { id: string; name: string; photoUrl?: string }) => void;
  selectedEmployee: { id: string; name: string; photoUrl?: string } | null;
  onClear: () => void;
}

export function KioskEmployeeSelector({
  onSelect,
  selectedEmployee,
  onClear,
}: KioskEmployeeSelectorProps) {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEmployees = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const response = await employeesService.listEmployees({
        search: query,
        status: 'ACTIVE',
        perPage: 10,
      });
      setEmployees(response.employees);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEmployee) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchEmployees(search);
      }, 300);
    } else {
      setEmployees([]);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchEmployees, selectedEmployee]);

  if (selectedEmployee) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-4 py-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20 shrink-0">
          {selectedEmployee.photoUrl ? (
            <img
              src={selectedEmployee.photoUrl}
              alt={selectedEmployee.name}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <User className="size-5 text-violet-600 dark:text-violet-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-violet-800 dark:text-violet-200 truncate">
            {selectedEmployee.name}
          </p>
          <p className="text-xs text-violet-600/70 dark:text-violet-400/70">
            Colaborador selecionado
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex size-8 items-center justify-center rounded-lg text-violet-500 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar colaborador por nome ou matrícula..."
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-slate-800 pl-9 pr-4 py-3',
            'border-slate-200 dark:border-slate-700',
            'text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400',
            'transition-colors'
          )}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="size-5 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
        </div>
      )}

      {!loading && employees.length > 0 && (
        <div className="space-y-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5">
          {employees.map(emp => (
            <button
              key={emp.id}
              type="button"
              onClick={() =>
                onSelect({
                  id: emp.id,
                  name: emp.fullName,
                  photoUrl: emp.photoUrl ?? undefined,
                })
              }
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5',
                'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                'active:bg-slate-100 dark:active:bg-slate-700',
                'transition-colors text-left'
              )}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 shrink-0">
                {emp.photoUrl ? (
                  <img
                    src={emp.photoUrl}
                    alt={emp.fullName}
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  <User className="size-4 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {emp.fullName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Matrícula: {emp.registrationNumber}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && search.length >= 2 && employees.length === 0 && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
          Nenhum colaborador encontrado.
        </p>
      )}

      {search.length < 2 && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
          Digite ao menos 2 caracteres para buscar.
        </p>
      )}
    </div>
  );
}
