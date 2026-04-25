'use client';

import type { PosTerminal } from '@/types/sales';

/**
 * Placeholder for the Fiscal & Advanced tab — fully implemented in Task 9.
 */
export function FiscalAdvancedTab({
  terminal: _terminal,
}: {
  terminal: PosTerminal;
}) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
      Em construção. Carregando configuração avançada…
    </div>
  );
}
