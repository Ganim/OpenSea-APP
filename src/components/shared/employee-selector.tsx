'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { employeesService } from '@/services/hr/employees.service';
import type { Employee } from '@/types/hr';

interface EmployeeSelectorProps {
  value: string;
  onChange: (employeeId: string, employee?: Employee) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EmployeeSelector({
  value,
  onChange,
  placeholder = 'Selecionar funcionário...',
  disabled = false,
  className,
}: EmployeeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch employees with search
  const { data, isLoading } = useQuery({
    queryKey: ['employees', 'selector', debouncedSearch],
    queryFn: () =>
      employeesService.listEmployees({
        search: debouncedSearch || undefined,
        perPage: 20,
        status: 'ACTIVE',
      }),
    enabled: open,
    staleTime: 30_000,
  });

  const employees = data?.employees ?? [];

  // Fetch selected employee name when value is set but list doesn't contain it
  const { data: selectedData } = useQuery({
    queryKey: ['employees', 'selected', value],
    queryFn: () => employeesService.getEmployee(value),
    enabled: !!value && !employees.some(e => e.id === value),
    staleTime: 60_000,
  });

  const selectedEmployee =
    employees.find(e => e.id === value) ?? selectedData?.employee;

  const handleSelect = useCallback(
    (employeeId: string) => {
      const employee = employees.find(e => e.id === employeeId);
      onChange(employeeId === value ? '' : employeeId, employee);
      setOpen(false);
      setSearch('');
    },
    [employees, onChange, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 shrink-0 opacity-50" />
            {selectedEmployee ? (
              <span className="truncate">
                {selectedEmployee.fullName}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  #{selectedEmployee.registrationNumber}
                </span>
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar funcionário..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Buscando...
                </span>
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                <CommandGroup>
                  {employees.map(employee => (
                    <CommandItem
                      key={employee.id}
                      value={employee.id}
                      onSelect={handleSelect}
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate text-sm font-medium">
                          {employee.fullName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          #{employee.registrationNumber}
                          {employee.department?.name &&
                            ` · ${employee.department.name}`}
                          {employee.position?.name &&
                            ` · ${employee.position.name}`}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          'ml-2 h-4 w-4 shrink-0',
                          value === employee.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
