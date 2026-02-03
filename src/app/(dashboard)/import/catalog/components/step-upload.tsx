'use client';

// ============================================
// STEP UPLOAD COMPONENT
// Passo 1: Upload de arquivo Excel/CSV
// ============================================

import { useCallback, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Table as TableIcon,
  BarChart3,
  Download,
  Info,
} from 'lucide-react';
import { useFileParser } from '../hooks/use-file-parser';
import { useTemplates } from '@/hooks/stock/use-stock-other';
import type { ParsedSheet } from '../../_shared/utils/excel-parser';
import type { Template, TemplateAttribute } from '@/types/stock';

// ============================================
// TYPES
// ============================================

interface StepUploadProps {
  file: File | null;
  parsedSheet: ParsedSheet | null;
  selectedSheetIndex: number;
  onFileChange: (file: File | null) => void;
  onParsedSheetChange: (sheet: ParsedSheet | null) => void;
  onSheetIndexChange: (index: number) => void;
}

// ============================================
// CONSTANTS
// ============================================

const ACCEPTED_FILES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    '.xlsx',
  ],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================
// CSV MODEL GENERATION FUNCTIONS
// ============================================

/**
 * Gera as colunas do CSV modelo baseado no template
 */
function generateCsvColumns(template: Template | null): string[] {
  const columns: string[] = [];

  // Campos fixos do produto
  columns.push('Nome do Produto');
  columns.push('Descrição');
  columns.push('CNPJ Fabricante');

  // Atributos customizados do produto (se template selecionado)
  if (template?.productAttributes) {
    Object.entries(template.productAttributes).forEach(([key, attr]) => {
      const label = attr.label || key;
      columns.push(attr.required ? `${label} *` : label);
    });
  }

  // Campos fixos da variante
  columns.push('Nome da Variante');
  columns.push('Referência');
  columns.push('Cor (Hex)');
  columns.push('Cor (Pantone)');
  columns.push('Preço');
  columns.push('Preço de Custo');
  columns.push('Código de Barras');
  columns.push('Estoque Mínimo');
  columns.push('Estoque Máximo');

  // Atributos customizados da variante (se template selecionado)
  if (template?.variantAttributes) {
    Object.entries(template.variantAttributes).forEach(([key, attr]) => {
      const label = attr.label || key;
      columns.push(attr.required ? `${label} *` : label);
    });
  }

  return columns;
}

/**
 * Gera valor de exemplo baseado no tipo do atributo
 */
function getExampleValue(
  type: string,
  label: string,
  alternate = false
): string {
  const labelLower = label.toLowerCase();

  // Tentar inferir pelo nome do campo
  if (labelLower.includes('composição') || labelLower.includes('composicao')) {
    return alternate ? '100% Algodão' : '65% Poliéster / 35% Algodão';
  }
  if (labelLower.includes('gramatura') || labelLower.includes('peso')) {
    return alternate ? '180 g/m²' : '220 g/m²';
  }
  if (labelLower.includes('largura')) {
    return alternate ? '1.50 m' : '1.60 m';
  }
  if (labelLower.includes('acabamento')) {
    return alternate ? 'Acetinado' : 'Fosco';
  }

  // Baseado no tipo
  switch (type) {
    case 'number':
      return alternate ? '200' : '100';
    case 'boolean':
      return alternate ? 'Não' : 'Sim';
    case 'date':
      return alternate ? '2024-06-15' : '2024-01-10';
    case 'select':
      return alternate ? 'Opção B' : 'Opção A';
    default:
      return alternate ? 'Valor exemplo 2' : 'Valor exemplo 1';
  }
}

/**
 * Gera linhas de exemplo para o CSV
 */
function generateExampleRows(template: Template | null): string[][] {
  const rows: string[][] = [];

  // Primeira linha de exemplo - Produto 1, Variante 1
  const row1: string[] = [
    'Produto Exemplo 1',
    'Descrição do produto exemplo',
    '00.000.000/0001-00',
  ];

  if (template?.productAttributes) {
    Object.entries(template.productAttributes).forEach(([, attr]) => {
      row1.push(getExampleValue(attr.type, attr.label || ''));
    });
  }

  row1.push('Variante Azul');
  row1.push('AZL01');
  row1.push('#0066CC');
  row1.push('286 C');
  row1.push('99.90');
  row1.push('49.90');
  row1.push('7891234567890');
  row1.push('10');
  row1.push('100');

  if (template?.variantAttributes) {
    Object.entries(template.variantAttributes).forEach(([, attr]) => {
      row1.push(getExampleValue(attr.type, attr.label || ''));
    });
  }

  rows.push(row1);

  // Segunda linha - Produto 1, Variante 2 (mesmo produto, variante diferente)
  const row2: string[] = [
    'Produto Exemplo 1',
    'Descrição do produto exemplo',
    '00.000.000/0001-00',
  ];

  if (template?.productAttributes) {
    Object.entries(template.productAttributes).forEach(([, attr]) => {
      row2.push(getExampleValue(attr.type, attr.label || ''));
    });
  }

  row2.push('Variante Vermelho');
  row2.push('VRM02');
  row2.push('#CC0000');
  row2.push('485 C');
  row2.push('109.90');
  row2.push('54.90');
  row2.push('7891234567891');
  row2.push('10');
  row2.push('100');

  if (template?.variantAttributes) {
    Object.entries(template.variantAttributes).forEach(([, attr]) => {
      row2.push(getExampleValue(attr.type, attr.label || ''));
    });
  }

  rows.push(row2);

  // Terceira linha - Produto 2
  const row3: string[] = [
    'Produto Exemplo 2',
    'Outro produto de exemplo',
    '11.111.111/0001-11',
  ];

  if (template?.productAttributes) {
    Object.entries(template.productAttributes).forEach(([, attr]) => {
      row3.push(getExampleValue(attr.type, attr.label || '', true));
    });
  }

  row3.push('Variante Verde');
  row3.push('VRD01');
  row3.push('#00CC66');
  row3.push('354 C');
  row3.push('79.90');
  row3.push('39.90');
  row3.push('7891234567892');
  row3.push('5');
  row3.push('50');

  if (template?.variantAttributes) {
    Object.entries(template.variantAttributes).forEach(([, attr]) => {
      row3.push(getExampleValue(attr.type, attr.label || '', true));
    });
  }

  rows.push(row3);

  return rows;
}

/**
 * Gera e baixa um arquivo Excel (.xlsx) com o modelo
 */
function downloadExcelModel(template: Template | null): void {
  const columns = generateCsvColumns(template);
  const exampleRows = generateExampleRows(template);

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();

  // Dados: cabeçalho + linhas de exemplo
  const data = [columns, ...exampleRows];

  // Criar worksheet a partir dos dados
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Configurar largura das colunas (auto-fit aproximado)
  const colWidths = columns.map((col, idx) => {
    // Pegar o maior valor entre cabeçalho e dados de exemplo
    let maxLen = col.length;
    exampleRows.forEach(row => {
      if (row[idx] && row[idx].length > maxLen) {
        maxLen = row[idx].length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
  });
  ws['!cols'] = colWidths;

  // Adicionar worksheet ao workbook
  const sheetName = template?.name
    ? template.name.substring(0, 31) // Excel limita a 31 caracteres
    : 'Modelo Importação';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Adicionar uma aba de instruções
  const instructionsData = [
    ['INSTRUÇÕES DE PREENCHIMENTO'],
    [''],
    [
      '1. Preencha os dados a partir da linha 2 (a linha 1 contém os cabeçalhos)',
    ],
    ['2. Campos marcados com * são obrigatórios'],
    [
      '3. Para importar múltiplas variantes do mesmo produto, repita os dados do produto em cada linha',
    ],
    ['4. O sistema agrupa automaticamente as variantes pelo "Nome do Produto"'],
    [''],
    ['CAMPOS DO PRODUTO:'],
    [
      '- Nome do Produto: Nome único que identifica o produto (usado para agrupar variantes)',
    ],
    ['- Descrição: Descrição detalhada do produto'],
    ['- CNPJ Fabricante: CNPJ do fabricante (formato: 00.000.000/0001-00)'],
    [''],
    ['CAMPOS DA VARIANTE:'],
    [
      '- Nome da Variante: Nome que diferencia esta variante (ex: "Azul Royal", "Vermelho")',
    ],
    ['- Referência: Código de referência da cor/variante (ex: "AZL01", "J29")'],
    ['- Cor (Hex): Código hexadecimal da cor (ex: "#0066CC")'],
    ['- Cor (Pantone): Código Pantone da cor (ex: "286 C")'],
    ['- Preço: Preço de venda (use ponto como separador decimal)'],
    ['- Preço de Custo: Preço de custo (use ponto como separador decimal)'],
    ['- Código de Barras: EAN/GTIN do produto'],
    ['- Estoque Mínimo: Quantidade mínima em estoque'],
    ['- Estoque Máximo: Quantidade máxima em estoque'],
    [''],
    ['DICAS:'],
    ['- Você pode deletar as linhas de exemplo antes de preencher seus dados'],
    ['- Salve o arquivo mantendo o formato .xlsx'],
    ['- Não altere os nomes das colunas na linha 1'],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');

  // Gerar arquivo e fazer download
  const templateName = template?.name
    ? template.name.toLowerCase().replace(/\s+/g, '_')
    : 'generico';
  XLSX.writeFile(wb, `modelo_importacao_${templateName}.xlsx`);
}

// ============================================
// COMPONENT
// ============================================

export function StepUpload({
  file,
  parsedSheet,
  selectedSheetIndex,
  onFileChange,
  onParsedSheetChange,
  onSheetIndexChange,
}: StepUploadProps) {
  const [previewRows] = useState(5);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const {
    parseFile,
    result,
    isLoading,
    isError,
    error,
    sheetNames,
    statistics,
    reset: resetParser,
  } = useFileParser();

  // Carregar templates para o seletor de modelo CSV
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  // Template selecionado para gerar o modelo
  const selectedModelTemplate = useMemo(() => {
    if (
      !selectedTemplateId ||
      selectedTemplateId === '__generic__' ||
      !templates
    )
      return null;
    return templates.find(t => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId, templates]);

  // Handler para download do modelo Excel
  const handleDownloadModel = useCallback(() => {
    downloadExcelModel(selectedModelTemplate);
  }, [selectedModelTemplate]);

  // ============================================
  // DROPZONE
  // ============================================

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (!uploadedFile) return;

      onFileChange(uploadedFile);

      const parseResult = await parseFile(uploadedFile);
      if (parseResult && parseResult.success && parseResult.sheets.length > 0) {
        onParsedSheetChange(parseResult.sheets[parseResult.activeSheetIndex]);
        onSheetIndexChange(parseResult.activeSheetIndex);
      }
    },
    [parseFile, onFileChange, onParsedSheetChange, onSheetIndexChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FILES,
      maxSize: MAX_FILE_SIZE,
      multiple: false,
      disabled: isLoading,
    });

  // ============================================
  // HANDLERS
  // ============================================

  const handleSheetChange = (index: string) => {
    const idx = parseInt(index, 10);
    onSheetIndexChange(idx);
    if (result?.sheets[idx]) {
      onParsedSheetChange(result.sheets[idx]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    onParsedSheetChange(null);
    onSheetIndexChange(0);
    resetParser();
  };

  // ============================================
  // RENDER
  // ============================================

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) {
      return <FileText className="h-8 w-8 text-green-500" />;
    }
    return <FileSpreadsheet className="h-8 w-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Download Model Section */}
      {!file && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Precisa de um modelo?
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Baixe uma planilha Excel modelo com as colunas corretas e
                    instruções de preenchimento.
                    {templates && templates.length > 0 && (
                      <span className="block mt-1">
                        Selecione um template para incluir os campos
                        customizados.
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                {templates && templates.length > 0 && (
                  <Select
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-background">
                      <SelectValue placeholder="Template (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__generic__">
                        Modelo genérico
                      </SelectItem>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="outline"
                  className="gap-2 bg-white dark:bg-background hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-300 dark:border-blue-700"
                  onClick={handleDownloadModel}
                  disabled={isLoadingTemplates}
                >
                  <Download className="h-4 w-4" />
                  Baixar Modelo Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dropzone */}
      {!file && (
        <div
          {...getRootProps()}
          className={cn(
            'relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragActive && !isDragReject && 'border-primary bg-primary/5',
            isDragReject && 'border-destructive bg-destructive/5',
            !isDragActive &&
              'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className={cn(
                'rounded-full p-4',
                isDragActive && !isDragReject && 'bg-primary/10',
                isDragReject && 'bg-destructive/10',
                !isDragActive && 'bg-muted'
              )}
            >
              <Upload
                className={cn(
                  'h-10 w-10',
                  isDragActive && !isDragReject && 'text-primary',
                  isDragReject && 'text-destructive',
                  !isDragActive && 'text-muted-foreground'
                )}
              />
            </div>

            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive
                  ? isDragReject
                    ? 'Arquivo não suportado'
                    : 'Solte o arquivo aqui'
                  : 'Arraste seu arquivo aqui'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                ou clique para selecionar
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">.xlsx</Badge>
              <Badge variant="secondary">.xls</Badge>
              <Badge variant="secondary">.csv</Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Tamanho máximo: 50MB
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Processando arquivo...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {isError && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-destructive">
                  Erro ao processar arquivo
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File info and preview */}
      {file && parsedSheet && !isLoading && !isError && (
        <div className="space-y-4">
          {/* File info card */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {getFileIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sheet selector (for Excel with multiple sheets) */}
          {sheetNames.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Selecionar Aba
                </CardTitle>
                <CardDescription>
                  O arquivo contém {sheetNames.length} abas. Selecione qual
                  deseja importar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedSheetIndex.toString()}
                  onValueChange={handleSheetChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma aba" />
                  </SelectTrigger>
                  <SelectContent>
                    {sheetNames.map((name, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Statistics card */}
          {statistics && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">
                    Estatísticas
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {statistics.totalRows}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Linhas totais
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {statistics.filledRows}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Linhas válidas
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {statistics.columnCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Colunas</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {(statistics.fillRate * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Preenchimento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  Preview dos Dados
                </CardTitle>
              </div>
              <CardDescription>
                Mostrando as primeiras {previewRows} linhas de{' '}
                {parsedSheet.rows.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center bg-muted/50">
                        #
                      </TableHead>
                      {parsedSheet.headers.map((header, idx) => (
                        <TableHead
                          key={idx}
                          className="min-w-[120px] bg-muted/50 whitespace-nowrap"
                        >
                          {header || `Coluna ${idx + 1}`}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedSheet.rows
                      .slice(0, previewRows)
                      .map((row, rowIdx) => (
                        <TableRow key={rowIdx}>
                          <TableCell className="text-center text-muted-foreground font-mono text-xs">
                            {rowIdx + 1}
                          </TableCell>
                          {parsedSheet.headers.map((header, colIdx) => (
                            <TableCell
                              key={colIdx}
                              className="max-w-[200px] truncate"
                              title={row[header] || ''}
                            >
                              {row[header] || (
                                <span className="text-muted-foreground/50">
                                  -
                                </span>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              {parsedSheet.rows.length > previewRows && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  ... e mais {parsedSheet.rows.length - previewRows} linhas
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state skeleton */}
      {!file && !isLoading && (
        <div className="hidden">
          <Skeleton className="h-[200px] w-full" />
        </div>
      )}
    </div>
  );
}
