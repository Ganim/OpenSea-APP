'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBrasilApiBanks } from '@/hooks/finance';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface BankSelectProps {
  value?: string;
  onSelect: (bank: { bankCode: string; bankName: string }) => void;
  disabled?: boolean;
}

export function BankSelect({ value, onSelect, disabled }: BankSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: banks = [], isLoading } = useBrasilApiBanks();

  const selectedBank = banks.find(b => String(b.code) === value);

  const displayValue = selectedBank
    ? `${selectedBank.code} - ${selectedBank.fullName || selectedBank.name}`
    : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {isLoading
              ? 'Carregando bancos...'
              : displayValue || 'Selecione um banco'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar por nome ou código..." />
          <CommandList>
            <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
            <CommandGroup>
              {banks.map(bank => {
                const bankCode = String(bank.code);
                const bankLabel = `${bank.code} - ${bank.fullName || bank.name}`;

                return (
                  <CommandItem
                    key={bankCode}
                    value={`${bank.code} ${bank.name ?? ''} ${bank.fullName ?? ''}`}
                    onSelect={() => {
                      onSelect({
                        bankCode,
                        bankName: bank.fullName || bank.name || '',
                      });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === bankCode ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="truncate">{bankLabel}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
