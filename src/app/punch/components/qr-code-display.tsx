'use client';

import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QrCodeDisplayProps {
  /** The URL or data to encode in the QR code */
  value: string;
  /** Display label above the QR code */
  label?: string;
  /** Size of the QR code in pixels */
  size?: number;
  /** Whether to show the raw URL below */
  showUrl?: boolean;
}

export function QrCodeDisplay({
  value,
  label,
  size = 200,
  showUrl = true,
}: QrCodeDisplayProps) {
  const qrValue = useMemo(() => value, [value]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(value).then(
      () => toast.success('Link copiado!'),
      () => toast.error('Erro ao copiar link.')
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {label && (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <QrCode className="size-4" />
          <span>{label}</span>
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <QRCodeSVG
          value={qrValue}
          size={size}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="M"
          includeMargin={false}
        />
      </div>

      {showUrl && (
        <button
          type="button"
          onClick={handleCopyUrl}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2',
            'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700',
            'text-xs text-slate-600 dark:text-slate-400 font-mono',
            'transition-colors max-w-full'
          )}
        >
          <Copy className="size-3.5 shrink-0" />
          <span className="truncate">{value}</span>
        </button>
      )}
    </div>
  );
}

/**
 * Helper to generate punch page URL for an employee
 */
export function generateEmployeePunchUrl(
  baseUrl: string,
  employeeId: string,
  employeeName: string
): string {
  const params = new URLSearchParams({
    employeeId,
    name: employeeName,
  });
  return `${baseUrl}/punch?${params.toString()}`;
}

/**
 * Helper to generate kiosk mode URL
 */
export function generateKioskPunchUrl(
  baseUrl: string,
  tenantId: string
): string {
  const params = new URLSearchParams({
    mode: 'kiosk',
    tenantId,
  });
  return `${baseUrl}/punch?${params.toString()}`;
}
