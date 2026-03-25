'use client';

import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiDocumentsService } from '@/services/ai';
import { cn } from '@/lib/utils';
import {
  FileText,
  Upload,
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  RotateCcw,
  ClipboardPaste,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  DocumentType,
  DocumentAnalysisResult,
  DocumentMatchItem,
} from '@/types/ai';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'EDITAL', label: 'Edital' },
  { value: 'LICITACAO', label: 'Licitacao' },
  { value: 'PREGAO', label: 'Pregao' },
  { value: 'COTACAO', label: 'Cotacao' },
  { value: 'OUTRO', label: 'Outro' },
];

function MatchIndicator({ level }: { level: DocumentMatchItem['matchLevel'] }) {
  if (level === 'FULL') {
    return (
      <div className="flex items-center gap-1 text-emerald-500">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Encontrado</span>
      </div>
    );
  }
  if (level === 'PARTIAL') {
    return (
      <div className="flex items-center gap-1 text-amber-500">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Parcial</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-rose-500">
      <XCircle className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">Ausente</span>
    </div>
  );
}

export function AiDocumentAnalyzer() {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('EDITAL');
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useMutation({
    mutationFn: aiDocumentsService.analyzeDocument,
    onSuccess: data => {
      setResult(data);
    },
    onError: () => {
      toast.error('Erro ao analisar o documento. Tente novamente.');
    },
  });

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        toast.error('Formato de arquivo nao suportado. Use PDF ou TXT.');
        return;
      }

      try {
        const text = await file.text();
        setContent(text);
        toast.success(`Arquivo "${file.name}" carregado.`);
      } catch {
        toast.error('Erro ao ler o arquivo.');
      }
    },
    []
  );

  const handleAnalyze = useCallback(() => {
    if (!content.trim()) {
      toast.error('Insira o conteudo do documento para analise.');
      return;
    }
    analyzeMutation.mutate({
      content: content.trim(),
      documentType,
    });
  }, [content, documentType, analyzeMutation]);

  const handleReset = useCallback(() => {
    setContent('');
    setResult(null);
  }, []);

  const matchPercentage = result?.matchPercentage ?? 0;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Analise de Documentos</h3>
          <p className="text-sm text-muted-foreground">
            Envie um documento para analise automatica e comparacao com seu
            estoque
          </p>
        </div>

        {/* Input Section */}
        {!result && (
          <Card className="p-5 space-y-4">
            {/* Document type selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium shrink-0">
                Tipo de documento:
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {DOCUMENT_TYPES.map(dt => (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => setDocumentType(dt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      documentType === dt.value
                        ? 'bg-violet-500 text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input mode toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  inputMode === 'upload'
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Upload className="h-4 w-4" />
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  inputMode === 'paste'
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ClipboardPaste className="h-4 w-4" />
                Colar Texto
              </button>
            </div>

            {/* Upload or textarea */}
            {inputMode === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium">
                  {content
                    ? 'Arquivo carregado. Clique para trocar.'
                    : 'Arraste ou clique para enviar'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF ou TXT</p>
                {content && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-emerald-500 border-emerald-500/30"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {content.length} caracteres carregados
                  </Badge>
                )}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Cole aqui o conteudo do documento para analise..."
                rows={10}
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            )}

            {/* Analyze button */}
            <div className="flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={!content.trim() || analyzeMutation.isPending}
                className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analisar Documento
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Action bar */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Nova Analise
              </Button>
            </div>

            {/* Document info card */}
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-violet-500/10 shrink-0">
                  <FileText className="h-6 w-6 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base">{result.title}</h4>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted-foreground">
                    {result.organization && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {result.organization}
                      </div>
                    )}
                    {result.dueDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(result.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {result.estimatedValue != null && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        {result.estimatedValue.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.summary}
                  </p>
                </div>
              </div>
            </Card>

            {/* Match percentage bar */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Compatibilidade com Estoque
                </span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    matchPercentage >= 70
                      ? 'text-emerald-500'
                      : matchPercentage >= 40
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  )}
                >
                  {matchPercentage}%
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    matchPercentage >= 70
                      ? 'bg-emerald-500'
                      : matchPercentage >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  )}
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </Card>

            {/* Items table */}
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h4 className="text-sm font-semibold">
                  Itens do Documento ({result.items.length})
                </h4>
              </div>
              <div className="divide-y divide-border">
                {result.items.map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>
                          {item.quantity} {item.unit}
                        </span>
                        {item.estimatedPrice != null && (
                          <span>
                            {item.estimatedPrice.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        )}
                        {item.matchedProductName && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {item.matchedProductName}
                          </span>
                        )}
                      </div>
                    </div>
                    <MatchIndicator level={item.matchLevel} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Suggested actions */}
            {result.suggestedActions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Acoes Sugeridas</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {result.suggestedActions.map(action => (
                    <Card
                      key={action.id}
                      className="p-4 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium">
                            {action.title}
                          </h5>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {action.description}
                          </p>
                          <Badge variant="outline" className="text-[10px] mt-2">
                            {action.module}
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
