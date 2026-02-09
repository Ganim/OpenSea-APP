'use client';

import { logger } from '@/lib/logger';
import {
  AlertCircle,
  ArrowRightLeft,
  Boxes,
  Camera,
  ClipboardList,
  Info,
  Keyboard,
  MapPin,
  Package,
  PackageMinus,
  PackagePlus,
  ScanLine,
  Tag,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { useScanMode } from '@/hooks/stock';
import type { ScanEntityType, ScanResult } from '@/types/stock';

// ============================================
// SCAN MODE SELECTOR
// ============================================

type ScanContext = 'INFO' | 'ENTRY' | 'EXIT' | 'TRANSFER' | 'INVENTORY';

const scanContextConfig: Record<
  ScanContext,
  { label: string; icon: React.ElementType; color: string }
> = {
  INFO: { label: 'Consultar', icon: Info, color: 'bg-gray-500' },
  ENTRY: { label: 'Entrada', icon: PackagePlus, color: 'bg-green-500' },
  EXIT: { label: 'Saída', icon: PackageMinus, color: 'bg-red-500' },
  TRANSFER: { label: 'Transferir', icon: ArrowRightLeft, color: 'bg-blue-500' },
  INVENTORY: {
    label: 'Inventário',
    icon: ClipboardList,
    color: 'bg-orange-500',
  },
};

interface ScanModeSelectorProps {
  value: ScanContext;
  onChange: (value: ScanContext) => void;
}

function ScanModeSelector({ value, onChange }: ScanModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(scanContextConfig).map(([key, config]) => {
        const Icon = config.icon;
        const isActive = value === key;
        return (
          <Button
            key={key}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={cn(isActive && config.color)}
            onClick={() => onChange(key as ScanContext)}
          >
            <Icon className="h-4 w-4 mr-1" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}

// ============================================
// SCAN RESULT CARD
// ============================================

const entityTypeIcons: Record<ScanEntityType, React.ElementType> = {
  ITEM: Package,
  VARIANT: Tag,
  PRODUCT: Boxes,
  LOCATION: MapPin,
  VOLUME: Package,
  LABEL: Tag,
};

const entityTypeLabels: Record<ScanEntityType, string> = {
  ITEM: 'Item',
  VARIANT: 'Variante',
  PRODUCT: 'Produto',
  LOCATION: 'Localização',
  VOLUME: 'Volume',
  LABEL: 'Etiqueta',
};

interface ScanResultCardProps {
  result: ScanResult;
  onAction?: (action: string) => void;
  onRemove?: () => void;
}

function ScanResultCard({ result, onAction, onRemove }: ScanResultCardProps) {
  const Icon = entityTypeIcons[result.entityType];

  // Get display info based on entity type
  const getEntityInfo = () => {
    const entity = result.entity as unknown as Record<string, unknown>;
    switch (result.entityType) {
      case 'ITEM':
        return {
          title: (entity.uniqueCode as string) || 'Item',
          subtitle: `Qtd: ${entity.currentQuantity || 0}`,
        };
      case 'VARIANT':
        return {
          title:
            (entity.name as string) || (entity.sku as string) || 'Variante',
          subtitle: (entity.sku as string) || '',
        };
      case 'PRODUCT':
        return {
          title: (entity.name as string) || 'Produto',
          subtitle: (entity.code as string) || '',
        };
      case 'LOCATION':
        return {
          title: (entity.code as string) || 'Localização',
          subtitle: (entity.name as string) || '',
        };
      case 'VOLUME':
        return {
          title: (entity.code as string) || 'Volume',
          subtitle: `${entity.itemCount || 0} itens`,
        };
      default:
        return {
          title: 'Entidade',
          subtitle: result.entityId,
        };
    }
  };

  const info = getEntityInfo();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {entityTypeLabels[result.entityType]}
              </Badge>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto"
                  onClick={onRemove}
                  aria-label="Remover resultado"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="font-medium mt-1">{info.title}</p>
            {info.subtitle && (
              <p className="text-sm text-muted-foreground">{info.subtitle}</p>
            )}
          </div>
        </div>

        {result.suggestions && result.suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Ações disponíveis:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onAction?.(suggestion.action)}
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// MANUAL INPUT
// ============================================

interface ManualInputProps {
  onSubmit: (code: string) => void;
  isLoading?: boolean;
}

function ManualInput({ onSubmit, isLoading }: ManualInputProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
      setCode('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Digite ou escaneie o código..."
        value={code}
        onChange={e => setCode(e.target.value)}
        autoFocus
        className="flex-1"
      />
      <Button type="submit" disabled={!code.trim() || isLoading}>
        <ScanLine className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </form>
  );
}

// ============================================
// CAMERA SCANNER (Placeholder - needs library)
// ============================================

interface CameraScannerProps {
  onScan: (code: string) => void;
  isActive: boolean;
}

function CameraScanner({ onScan, isActive }: CameraScannerProps) {
  // TODO: Integrate with html5-qrcode or @zxing/browser
  return (
    <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {isActive
            ? 'Câmera ativa - Aponte para o código'
            : 'Câmera desativada'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          (Integração com biblioteca de scanner pendente)
        </p>
      </div>
    </div>
  );
}

// ============================================
// SCAN QUEUE
// ============================================

interface ScanQueueProps {
  items: Array<{ code: string; result: ScanResult }>;
  onRemove: (code: string) => void;
  onClear: () => void;
}

function ScanQueue({ items, onRemove, onClear }: ScanQueueProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Itens escaneados ({items.length})</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar tudo
        </Button>
      </div>
      <div className="space-y-2">
        {items.map(({ code, result }) => (
          <ScanResultCard
            key={code}
            result={result}
            onRemove={() => onRemove(code)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function QuickScanPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('manual');

  const {
    scan,
    context,
    setContext,
    lastResult,
    history,
    clearHistory,
    isScanning,
    error,
  } = useScanMode('INFO');

  const handleScan = useCallback(
    async (code: string) => {
      try {
        await scan(code);
      } catch (err) {
        logger.error('Scan error', err instanceof Error ? err : undefined);
      }
    },
    [scan]
  );

  const handleAction = useCallback(
    (action: string) => {
      if (!lastResult) return;

      // Navigate to appropriate page based on action
      const entityId = lastResult.entityId;
      switch (action) {
        case 'view':
          router.push(`/stock/items/${entityId}`);
          break;
        case 'entry':
          router.push(`/stock/items?action=entry&id=${entityId}`);
          break;
        case 'exit':
          router.push(`/stock/items?action=exit&id=${entityId}`);
          break;
        case 'transfer':
          router.push(`/stock/items?action=transfer&id=${entityId}`);
          break;
        default:
          break;
      }
    },
    [lastResult, router]
  );

  const handleRemoveFromHistory = useCallback(
    (code: string) => {
      // History is managed internally by useScanMode
      // For now, just clear all
      clearHistory();
    },
    [clearHistory]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modo Scanner</h1>
        <p className="text-muted-foreground">
          Escaneie ou digite códigos para operações rápidas
        </p>
      </div>

      {/* Mode Selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Modo de operação:</h2>
        <ScanModeSelector
          value={context as ScanContext}
          onChange={value => setContext(value)}
        />
      </div>

      {/* Input Mode Tabs */}
      <Tabs
        value={inputMode}
        onValueChange={v => setInputMode(v as 'camera' | 'manual')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="gap-2">
            <Keyboard className="h-4 w-4" />
            Digitação
          </TabsTrigger>
          <TabsTrigger value="camera" className="gap-2">
            <Camera className="h-4 w-4" />
            Câmera
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <ManualInput onSubmit={handleScan} isLoading={isScanning} />
        </TabsContent>

        <TabsContent value="camera" className="mt-4">
          <CameraScanner
            onScan={handleScan}
            isActive={inputMode === 'camera'}
          />
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {error instanceof Error
              ? error.message
              : 'Erro ao processar código'}
          </p>
        </div>
      )}

      {/* Last Result */}
      {lastResult && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Resultado:</h2>
          <ScanResultCard result={lastResult} onAction={handleAction} />
        </div>
      )}

      {/* Scan History */}
      {history.length > 1 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Histórico da sessão:</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {history
              .slice(0, -1)
              .reverse()
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {entityTypeLabels[item.result.entityType]}
                    </Badge>
                    <span className="text-sm font-mono">{item.code}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ))}
          </div>
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            Limpar histórico
          </Button>
        </div>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Dicas:</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Use um leitor de código de barras USB para leitura rápida</p>
          <p>
            • O sistema reconhece automaticamente: QR Codes, códigos de barras,
            SKUs
          </p>
          <p>• Selecione o modo antes de escanear para ações automáticas</p>
        </CardContent>
      </Card>
    </div>
  );
}
