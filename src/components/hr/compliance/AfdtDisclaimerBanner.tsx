/**
 * OpenSea OS - AFDT Disclaimer Banner (Phase 06 / Plan 06-06)
 *
 * D-05 (decisão CONTEXT): o AFDT é artefato proprietário de agregação
 * interna (batidas originais + correções aprovadas) gerado para facilitar
 * a conferência trabalhista. O artefato legal exigido pela Portaria MTP
 * 671/2021 é o AFD. RH deve sempre entregar o AFD em fiscalização.
 *
 * Este banner é renderizado:
 *   1. Na tab "AFDT" do dashboard /hr/compliance
 *   2. No topo do formulário /hr/compliance/afdt
 */

'use client';

import { Info } from 'lucide-react';

export function AfdtDisclaimerBanner() {
  return (
    <div
      role="note"
      data-testid="afdt-disclaimer-banner"
      className="my-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/10"
    >
      <Info className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="space-y-1">
        <p className="font-medium text-amber-900 dark:text-amber-200">
          AFDT é artefato proprietário de conferência
        </p>
        <p className="leading-relaxed text-amber-800 dark:text-amber-300">
          O AFDT é uma agregação interna das batidas originais e correções
          aprovadas, gerada para facilitar conferência trabalhista. O artefato
          legal exigido pela{' '}
          <strong className="font-semibold">Portaria MTP 671/2021</strong> é o{' '}
          <strong className="font-semibold">AFD</strong>. Para fins de
          fiscalização, entregue sempre o AFD oficial.
        </p>
      </div>
    </div>
  );
}
