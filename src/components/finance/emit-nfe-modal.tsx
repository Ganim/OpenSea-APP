'use client';

import { translateError } from '@/lib/error-messages';
import {
  NavigationWizardDialog,
  type NavigationSection,
} from '@/components/ui/navigation-wizard-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEmitNfeFromEntry } from '@/hooks/finance';
import type {
  EmitNfeFromEntryItem,
  FiscalDocumentEmissionType,
  FinanceEntry,
} from '@/types/finance';
import {
  CheckCircle2,
  FileCheck,
  FileText,
  ListOrdered,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface EmitNfeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: FinanceEntry;
  onSuccess?: () => void;
}

interface NfeItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  ncm: string;
  cfop: string;
  issRate: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

let itemIdCounter = 0;

function createDefaultItem(entry: FinanceEntry): NfeItem {
  itemIdCounter += 1;
  return {
    id: `item-${itemIdCounter}`,
    description: entry.description,
    quantity: 1,
    unitPrice: entry.expectedAmount,
    ncm: '',
    cfop: '',
    issRate: 0,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmitNfeModal({
  open,
  onOpenChange,
  entry,
  onSuccess,
}: EmitNfeModalProps) {
  const emitMutation = useEmitNfeFromEntry();

  // State
  const [activeSection, setActiveSection] = useState('doc-type');
  const [documentType, setDocumentType] =
    useState<FiscalDocumentEmissionType>('NFE');
  const [items, setItems] = useState<NfeItem[]>(() => [
    createDefaultItem(entry),
  ]);
  const [notes, setNotes] = useState('');
  const [emissionResult, setEmissionResult] = useState<{
    id: string;
    number: number;
    accessKey?: string;
    status: string;
    danfePdfUrl?: string;
    totalValue: number;
  } | null>(null);

  // Computed
  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );

  const hasValidItems = useMemo(
    () =>
      items.length > 0 &&
      items.every(
        item =>
          item.description.trim().length > 0 &&
          item.quantity > 0 &&
          item.unitPrice > 0
      ),
    [items]
  );

  // Sections
  const sections: NavigationSection[] = useMemo(
    () => [
      {
        id: 'doc-type',
        label: 'Tipo de Documento',
        icon: <FileText className="h-4 w-4" />,
        description: 'NF-e ou NFS-e',
      },
      {
        id: 'items',
        label: 'Itens',
        icon: <ListOrdered className="h-4 w-4" />,
        description: 'Produtos ou serviços',
      },
      {
        id: 'confirm',
        label: 'Confirmação',
        icon: <CheckCircle2 className="h-4 w-4" />,
        description: 'Revisão e emissão',
      },
    ],
    []
  );

  // Handlers
  const handleAddItem = useCallback(() => {
    itemIdCounter += 1;
    setItems(prev => [
      ...prev,
      {
        id: `item-${itemIdCounter}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        ncm: '',
        cfop: '',
        issRate: 0,
      },
    ]);
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const handleUpdateItem = useCallback(
    (itemId: string, field: keyof NfeItem, value: string | number) => {
      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const handleEmit = useCallback(async () => {
    if (!hasValidItems) {
      toast.error('Preencha todos os campos obrigatórios dos itens.');
      return;
    }

    try {
      const emitItems: EmitNfeFromEntryItem[] = items.map(item => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ...(item.ncm && { ncm: item.ncm }),
        ...(item.cfop && { cfop: item.cfop }),
        ...(documentType === 'NFSE' && item.issRate > 0
          ? { issRate: item.issRate }
          : {}),
      }));

      const result = await emitMutation.mutateAsync({
        entryId: entry.id,
        data: {
          documentType,
          items: emitItems,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      });

      setEmissionResult(result.fiscalDocument);
      toast.success('Documento fiscal emitido com sucesso!');
      onSuccess?.();
    } catch (err) {
      toast.error(translateError(err));
    }
  }, [
    hasValidItems,
    items,
    documentType,
    notes,
    entry.id,
    emitMutation,
    onSuccess,
  ]);

  const handleClose = useCallback(() => {
    if (!emitMutation.isPending) {
      setEmissionResult(null);
      setActiveSection('doc-type');
      onOpenChange(false);
    }
  }, [emitMutation.isPending, onOpenChange]);

  // Footer
  const footer = useMemo(() => {
    if (emissionResult) {
      return (
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button onClick={handleClose}>Fechar</Button>
        </div>
      );
    }

    return (
      <div className="flex justify-between px-6 py-4 border-t">
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        {activeSection === 'confirm' ? (
          <Button
            onClick={handleEmit}
            disabled={emitMutation.isPending || !hasValidItems}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {emitMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )}
            Emitir
          </Button>
        ) : (
          <Button
            onClick={() => {
              const currentIdx = sections.findIndex(
                s => s.id === activeSection
              );
              if (currentIdx < sections.length - 1) {
                setActiveSection(sections[currentIdx + 1].id);
              }
            }}
          >
            Próximo
          </Button>
        )}
      </div>
    );
  }, [
    emissionResult,
    activeSection,
    handleClose,
    handleEmit,
    emitMutation.isPending,
    hasValidItems,
    sections,
  ]);

  return (
    <NavigationWizardDialog
      open={open}
      onOpenChange={handleClose}
      title="Emitir Documento Fiscal"
      subtitle="Emissão de NF-e ou NFS-e a partir do lançamento"
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      footer={footer}
      isPending={emitMutation.isPending}
    >
      {/* Success State */}
      {emissionResult ? (
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-500/10">
              <CheckCircle2 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Documento Fiscal Emitido
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                O documento foi emitido com sucesso junto à SEFAZ.
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Número</span>
              <span className="text-sm font-medium">
                {emissionResult.number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="success"
                className="bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
              >
                {emissionResult.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor Total</span>
              <span className="text-sm font-mono font-medium">
                {formatCurrency(emissionResult.totalValue)}
              </span>
            </div>
            {emissionResult.accessKey && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Chave de Acesso
                </span>
                <span className="text-xs font-mono break-all text-muted-foreground">
                  {emissionResult.accessKey}
                </span>
              </div>
            )}
            {emissionResult.danfePdfUrl && (
              <a
                href={emissionResult.danfePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Abrir DANFE (PDF)
                </Button>
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Section: Tipo de Documento */}
          {activeSection === 'doc-type' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1">
                  Tipo de Documento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione o tipo de documento fiscal a ser emitido.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NFE Option */}
                <button
                  type="button"
                  onClick={() => setDocumentType('NFE')}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all',
                    documentType === 'NFE'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/8 ring-1 ring-teal-500'
                      : 'border-border hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-500/5'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      className={cn(
                        'h-5 w-5',
                        documentType === 'NFE'
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'font-semibold',
                        documentType === 'NFE'
                          ? 'text-teal-700 dark:text-teal-300'
                          : ''
                      )}
                    >
                      NF-e
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nota Fiscal Eletrônica para venda de produtos ou
                    mercadorias. Requer NCM e CFOP.
                  </p>
                </button>

                {/* NFSE Option */}
                <button
                  type="button"
                  onClick={() => setDocumentType('NFSE')}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all',
                    documentType === 'NFSE'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/8 ring-1 ring-teal-500'
                      : 'border-border hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-500/5'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileCheck
                      className={cn(
                        'h-5 w-5',
                        documentType === 'NFSE'
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'font-semibold',
                        documentType === 'NFSE'
                          ? 'text-teal-700 dark:text-teal-300'
                          : ''
                      )}
                    >
                      NFS-e
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nota Fiscal de Serviço Eletrônica para prestação de
                    serviços. Requer alíquota de ISS.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Section: Itens */}
          {activeSection === 'items' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold mb-1">Itens</h3>
                  <p className="text-sm text-muted-foreground">
                    {documentType === 'NFE'
                      ? 'Produtos ou mercadorias da nota fiscal.'
                      : 'Serviços prestados na nota fiscal.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Item
                </Button>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Item {index + 1}
                      </span>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Descrição *</Label>
                      <Input
                        value={item.description}
                        onChange={e =>
                          handleUpdateItem(
                            item.id,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Nome do produto ou serviço"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Quantidade *</Label>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={item.quantity}
                          onChange={e =>
                            handleUpdateItem(
                              item.id,
                              'quantity',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Preço Unitário *</Label>
                        <Input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={item.unitPrice}
                          onChange={e =>
                            handleUpdateItem(
                              item.id,
                              'unitPrice',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* NFE-specific fields */}
                    {documentType === 'NFE' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">NCM</Label>
                          <Input
                            value={item.ncm}
                            onChange={e =>
                              handleUpdateItem(item.id, 'ncm', e.target.value)
                            }
                            placeholder="Ex: 84714900"
                            maxLength={8}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">CFOP</Label>
                          <Input
                            value={item.cfop}
                            onChange={e =>
                              handleUpdateItem(item.id, 'cfop', e.target.value)
                            }
                            placeholder="Ex: 5102"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    )}

                    {/* NFSE-specific fields */}
                    {documentType === 'NFSE' && (
                      <div className="space-y-2">
                        <Label className="text-xs">Alíquota ISS (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          value={item.issRate}
                          onChange={e =>
                            handleUpdateItem(
                              item.id,
                              'issRate',
                              Number(e.target.value)
                            )
                          }
                          placeholder="Ex: 5.00"
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <span className="text-sm font-mono text-muted-foreground">
                        Subtotal:{' '}
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs">
                  Informações Adicionais (opcional)
                </Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observações que aparecerão no documento fiscal..."
                  rows={2}
                  maxLength={2000}
                />
              </div>
            </div>
          )}

          {/* Section: Confirmação */}
          {activeSection === 'confirm' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1">
                  Confirmar Emissão
                </h3>
                <p className="text-sm text-muted-foreground">
                  Revise os dados antes de emitir o documento fiscal.
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Tipo de Documento
                  </span>
                  <Badge
                    className={cn(
                      'bg-teal-50 text-teal-700 dark:bg-teal-500/8 dark:text-teal-300'
                    )}
                  >
                    {documentType === 'NFE'
                      ? 'NF-e (Produtos)'
                      : 'NFS-e (Serviços)'}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Lançamento
                  </span>
                  <span className="text-sm font-medium">{entry.code}</span>
                </div>

                {entry.customerName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Cliente
                    </span>
                    <span className="text-sm">{entry.customerName}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Quantidade de Itens
                  </span>
                  <span className="text-sm">{items.length}</span>
                </div>

                <div className="border-t pt-3 flex justify-between">
                  <span className="text-sm font-medium">Valor Total</span>
                  <span className="text-base font-mono font-bold text-violet-600 dark:text-violet-400">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="rounded-lg border">
                <div className="px-4 py-2 border-b bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    Itens
                  </span>
                </div>
                <div className="divide-y">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="px-4 py-2 flex justify-between items-center"
                    >
                      <div>
                        <span className="text-sm">{item.description}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.quantity} x {formatCurrency(item.unitPrice)})
                        </span>
                      </div>
                      <span className="text-sm font-mono">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {notes.trim() && (
                <div className="rounded-lg border p-4">
                  <span className="text-xs text-muted-foreground block mb-1">
                    Informações Adicionais
                  </span>
                  <p className="text-sm">{notes}</p>
                </div>
              )}

              {!hasValidItems && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-500/10 p-3">
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    Existem itens com campos obrigatórios não preenchidos. Volte
                    à seção de itens para corrigir.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </NavigationWizardDialog>
  );
}
