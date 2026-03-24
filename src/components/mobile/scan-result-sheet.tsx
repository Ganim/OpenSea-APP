'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  ArrowRightLeft,
  PackageMinus,
  Package,
  Loader2,
  MapPin,
  Layers,
  Hash,
  CheckCircle2,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { TransferFlow } from '@/components/mobile/transfer-flow';
import { ExitFlow } from '@/components/mobile/exit-flow';
import type { LookupResult } from '@/services/stock/lookup.service';

// ============================================
// Helpers
// ============================================

function get(result: LookupResult, key: string): string | undefined {
  const value = result.entity[key];
  if (value == null) return undefined;
  return String(value);
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  IN_TRANSIT: 'Em Trânsito',
  DAMAGED: 'Danificado',
  EXPIRED: 'Expirado',
  DISPOSED: 'Descartado',
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'text-emerald-400 bg-emerald-500/10',
  RESERVED: 'text-amber-400 bg-amber-500/10',
  IN_TRANSIT: 'text-sky-400 bg-sky-500/10',
  DAMAGED: 'text-rose-400 bg-rose-500/10',
  EXPIRED: 'text-rose-400 bg-rose-500/10',
  DISPOSED: 'text-slate-400 bg-slate-500/10',
};

// ============================================
// Color Swatch (inline — same pattern as variant selector)
// ============================================

function ColorSwatch({ result }: { result: LookupResult }) {
  const colorHex = get(result, 'colorHex');
  const secondaryColorHex = get(result, 'secondaryColorHex');
  const pattern = get(result, 'pattern') || 'SOLID';

  if (!colorHex) return null;

  const secondary = secondaryColorHex || colorHex;

  const bgStyle = (): React.CSSProperties => {
    switch (pattern) {
      case 'STRIPED':
        return {
          background: `repeating-linear-gradient(135deg, ${colorHex}, ${colorHex} 3px, ${secondary} 3px, ${secondary} 6px)`,
        };
      case 'PLAID':
        return {
          background: `repeating-linear-gradient(0deg, ${secondary}40 0px, ${secondary}40 2px, transparent 2px, transparent 6px), repeating-linear-gradient(90deg, ${secondary}40 0px, ${secondary}40 2px, transparent 2px, transparent 6px), ${colorHex}`,
        };
      case 'GRADIENT':
        return {
          background: `linear-gradient(135deg, ${colorHex}, ${secondary})`,
        };
      case 'PRINTED':
        return {
          background: `radial-gradient(circle at 25% 25%, ${secondary} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${secondary} 2px, transparent 2px), ${colorHex}`,
        };
      case 'JACQUARD':
        return {
          background: `repeating-conic-gradient(${colorHex} 0% 25%, ${secondary} 0% 50%) 50% / 8px 8px`,
        };
      default:
        if (secondaryColorHex && secondaryColorHex !== colorHex) {
          return {
            background: `linear-gradient(135deg, ${colorHex} 50%, ${secondaryColorHex} 50%)`,
          };
        }
        return { backgroundColor: colorHex };
    }
  };

  return (
    <div
      className="h-10 w-10 shrink-0 rounded-lg border border-white/15"
      style={bgStyle()}
    />
  );
}

// ============================================
// Action Button
// ============================================

function ActionButton({
  icon,
  label,
  colorClass,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 py-3 text-sm font-medium active:bg-slate-700/80',
        colorClass
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ============================================
// Detail Row
// ============================================

function DetailRow({
  icon,
  label,
  value,
  badge,
  badgeClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: boolean;
  badgeClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-500">{label}</p>
        {badge ? (
          <span
            className={cn(
              'inline-block rounded-md px-2 py-0.5 text-xs font-medium',
              badgeClass
            )}
          >
            {value}
          </span>
        ) : (
          <p className="truncate text-sm font-medium text-slate-200">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface ScanResultSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: LookupResult | null;
}

export function ScanResultSheet({
  open,
  onOpenChange,
  result,
}: ScanResultSheetProps) {
  const { hasPermission } = usePermissions();
  const [showTransfer, setShowTransfer] = useState(false);
  const [showExit, setShowExit] = useState(false);

  const handleClose = useCallback(() => {
    setShowTransfer(false);
    setShowExit(false);
  }, []);

  const handleSuccess = useCallback(() => {
    setShowTransfer(false);
    setShowExit(false);
    onOpenChange(false);
  }, [onOpenChange]);

  if (!result) return null;

  const e = result.entity;
  const productName = (e.productName as string) || '';
  const variantName = (e.variantName as string) || '';
  const name =
    [productName, variantName].filter(Boolean).join(' · ') ||
    (e.name as string) ||
    result.entityId;
  const manufacturerName = get(result, 'manufacturerName');
  const reference = get(result, 'reference');
  const subtitle = [manufacturerName, reference ? `Ref: ${reference}` : null]
    .filter(Boolean)
    .join(' · ');

  const templateName = get(result, 'templateName');
  const binLabel = get(result, 'binLabel') || get(result, 'location');
  const quantity = get(result, 'quantity');
  const unitOfMeasure = get(result, 'unitOfMeasure');
  const status = get(result, 'status') || '';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || 'text-slate-400 bg-slate-500/10';

  const canTransfer = hasPermission('stock.movements.register');
  const canExit = hasPermission('stock.movements.register');
  const isItem = result.entityType === 'ITEM';

  const isSubFlow = showTransfer || showExit;

  return (
    <Drawer
      open={open}
      onOpenChange={value => {
        if (!value) handleClose();
        onOpenChange(value);
      }}
      direction="bottom"
    >
      <DrawerContent
        className={cn(
          'bg-slate-900 border-slate-700',
          isSubFlow ? 'h-[95vh]' : 'max-h-[85vh]'
        )}
      >
        {showTransfer && isItem ? (
          <TransferFlow
            item={result}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        ) : showExit && isItem ? (
          <ExitFlow
            item={result}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        ) : (
          <>
            {/* Header: icon + name + subtitle | color swatch */}
            <div className="flex items-center gap-3 px-4 pt-6 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-slate-100">
                  {name}
                </p>
                {subtitle && (
                  <p className="truncate text-xs text-slate-500">{subtitle}</p>
                )}
              </div>
              <ColorSwatch result={result} />
            </div>

            {/* Details */}
            <div className="space-y-0 px-4 pb-3">
              {templateName && (
                <DetailRow
                  icon={<Layers className="h-3.5 w-3.5" />}
                  label="Template"
                  value={templateName}
                />
              )}
              {binLabel && (
                <DetailRow
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Localização"
                  value={binLabel}
                />
              )}
              {quantity != null && (
                <DetailRow
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label="Quantidade"
                  value={
                    unitOfMeasure
                      ? `${quantity} ${unitOfMeasure}`
                      : String(quantity)
                  }
                />
              )}
              {status && (
                <DetailRow
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="Status"
                  value={statusLabel}
                  badge
                  badgeClass={statusColor}
                />
              )}
            </div>

            {/* Action buttons — with safe area padding */}
            {isItem && (
              <DrawerFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="flex gap-2">
                  {canTransfer && (
                    <ActionButton
                      icon={<ArrowRightLeft className="h-4 w-4" />}
                      label="Transferir"
                      colorClass="text-sky-400"
                      onClick={() => setShowTransfer(true)}
                    />
                  )}
                  {canExit && (
                    <ActionButton
                      icon={<PackageMinus className="h-4 w-4" />}
                      label="Dar Baixa"
                      colorClass="text-rose-400"
                      onClick={() => setShowExit(true)}
                    />
                  )}
                </div>
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
