'use client';

/**
 * `PrintablePunchPwaCartaz` — A4 print-only poster.
 *
 * Hidden on screen (`hidden print:block`) and visible only when the user
 * triggers `window.print()` from the discovery page. RH cola próximo ao
 * relógio físico para que colaboradores escaneiem o QR e instalem a PWA.
 *
 * Always uses light tokens (`bg-white text-slate-900`) — paper is always
 * white. The CLAUDE.md dual-theme rule does NOT apply to print-only pages.
 */

import { Smartphone } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface PrintablePunchPwaCartazProps {
  qrValue: string;
  tenantName?: string | null;
}

export function PrintablePunchPwaCartaz({
  qrValue,
  tenantName,
}: PrintablePunchPwaCartazProps) {
  return (
    <div
      data-testid="punch-pwa-cartaz"
      className="hidden print:block w-[210mm] h-[297mm] mx-auto p-12 bg-white text-slate-900"
      style={{ pageBreakAfter: 'always' }}
    >
      <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
        <Smartphone className="w-20 h-20 text-violet-600" />

        <h1 className="text-5xl font-bold leading-tight">
          Bata seu ponto pelo celular
        </h1>

        <p className="text-2xl text-slate-700 max-w-2xl">
          Aponte a câmera do seu celular para o QR code abaixo e instale o app
          de ponto na tela de início.
        </p>

        <div className="bg-white p-4 border-4 border-violet-600 rounded-2xl">
          <QRCodeCanvas value={qrValue} size={400} level="M" />
        </div>

        <p className="text-lg text-slate-600 font-semibold">
          {tenantName ?? 'OpenSea ERP'}
        </p>

        <ol className="text-base text-slate-700 space-y-2 text-left max-w-md">
          <li>
            <strong>1.</strong> Aponte a câmera do celular para o QR code.
          </li>
          <li>
            <strong>2.</strong> Toque no link que aparecer.
          </li>
          <li>
            <strong>3.</strong> No navegador, escolha{' '}
            <em>Adicionar à Tela de Início</em> ou <em>Instalar app</em>.
          </li>
          <li>
            <strong>4.</strong> Pronto! Bata o ponto pelo celular onde estiver.
          </li>
        </ol>
      </div>
    </div>
  );
}
