/**
 * OpenSea OS - Country Select
 * Combobox de seleção de país com bandeiras circulares SVG e busca.
 * Usa Radix Popover (portal) para renderizar o dropdown flutuante.
 *
 * Uso:
 *   <CountrySelect value="BR" onValueChange={setCountry} />
 */

'use client';

import { cn } from '@/lib/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, Globe, Search } from 'lucide-react';
import { CircleFlag } from 'react-circle-flags';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// =============================================================================
// COUNTRY REGISTRY
// =============================================================================

export interface Country {
  code: string;
  name: string;
}

const COUNTRIES: Country[] = [
  // América do Sul
  { code: 'BR', name: 'Brasil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'PE', name: 'Peru' },
  { code: 'EC', name: 'Equador' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'SR', name: 'Suriname' },
  { code: 'GY', name: 'Guiana' },

  // América do Norte & Central
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'MX', name: 'México' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panamá' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'NI', name: 'Nicarágua' },

  // Europa
  { code: 'DE', name: 'Alemanha' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'FR', name: 'França' },
  { code: 'IT', name: 'Itália' },
  { code: 'ES', name: 'Espanha' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Países Baixos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'AT', name: 'Áustria' },
  { code: 'CH', name: 'Suíça' },
  { code: 'SE', name: 'Suécia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlândia' },
  { code: 'PL', name: 'Polônia' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'CZ', name: 'Tchéquia' },
  { code: 'RO', name: 'Romênia' },
  { code: 'HU', name: 'Hungria' },
  { code: 'GR', name: 'Grécia' },
  { code: 'HR', name: 'Croácia' },
  { code: 'UA', name: 'Ucrânia' },
  { code: 'RU', name: 'Rússia' },
  { code: 'TR', name: 'Turquia' },

  // Ásia
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japão' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'IN', name: 'Índia' },
  { code: 'ID', name: 'Indonésia' },
  { code: 'TH', name: 'Tailândia' },
  { code: 'VN', name: 'Vietnã' },
  { code: 'MY', name: 'Malásia' },
  { code: 'PH', name: 'Filipinas' },
  { code: 'SG', name: 'Singapura' },
  { code: 'PK', name: 'Paquistão' },
  { code: 'BD', name: 'Bangladesh' },

  // Oriente Médio
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'Emirados Árabes' },
  { code: 'SA', name: 'Arábia Saudita' },

  // África
  { code: 'ZA', name: 'África do Sul' },
  { code: 'EG', name: 'Egito' },
  { code: 'NG', name: 'Nigéria' },

  // Oceania
  { code: 'AU', name: 'Austrália' },
  { code: 'NZ', name: 'Nova Zelândia' },

  // Genérico
  { code: 'OTHER', name: 'Outro' },
];

/** Get a country by code */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/** Get the display name for a country code */
export function getCountryName(code: string): string {
  return getCountryByCode(code)?.name ?? code;
}

export { COUNTRIES };

// =============================================================================
// FLAG RENDERER
// =============================================================================

function CountryFlag({
  code,
  size,
  className,
}: {
  code: string;
  size: number;
  className?: string;
}) {
  if (code === 'OTHER' || !getCountryByCode(code)) {
    return (
      <Globe
        className={cn('text-muted-foreground', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <CircleFlag
      countryCode={code.toLowerCase()}
      height={size}
      width={size}
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}

// =============================================================================
// COUNTRY SELECT COMPONENT
// =============================================================================

export interface CountrySelectProps {
  value: string;
  onValueChange: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function CountrySelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = 'Selecione o país...',
  className,
  id,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = getCountryByCode(value);

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearch('');
    }
  }, [open]);

  const handleSelect = useCallback(
    (code: string) => {
      onValueChange(code);
      setOpen(false);
    },
    [onValueChange]
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          id={id}
          type="button"
          className={cn(
            'flex h-12 w-full items-center justify-between gap-2 rounded-(--input-radius) border border-[rgb(var(--color-border))] bg-(--input-bg) px-4 text-base',
            'transition-all duration-(--transition-normal)',
            'focus:outline-none focus:border-[rgb(var(--color-border-focus))] focus:ring-[3px] focus:ring-[rgb(var(--color-ring)/0.5)]',
            'disabled:pointer-events-none disabled:opacity-(--state-disabled-opacity) disabled:bg-[rgb(var(--color-background-muted))]',
            className
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2.5 truncate">
              <CountryFlag code={selected.code} size={20} />
              <span className="truncate">{selected.name}</span>
            </span>
          ) : (
            <span className="text-[rgb(var(--color-foreground-subtle))] truncate">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-[rgb(var(--color-foreground-subtle))] shrink-0" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 w-[--radix-popover-trigger-width] rounded-lg border border-border bg-popover shadow-md',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar país..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum país encontrado.
              </p>
            ) : (
              filtered.map(country => {
                const isSelected = country.code === value;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <CountryFlag code={country.code} size={18} />
                    <span className="flex-1 text-left truncate">
                      {country.name}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
