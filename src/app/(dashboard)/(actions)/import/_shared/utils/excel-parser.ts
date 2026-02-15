// ============================================
// EXCEL/CSV PARSER
// Utilitário para parsing de arquivos Excel e CSV
// ============================================

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// ============================================
// TYPES
// ============================================

export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
}

export interface ParseResult {
  success: boolean;
  sheets: ParsedSheet[];
  activeSheetIndex: number;
  error?: string;
  fileName: string;
  fileType: 'xlsx' | 'xls' | 'csv';
}

export interface ParseOptions {
  /** Índice da aba a ser parseada (para Excel). Se não fornecido, parseia todas */
  sheetIndex?: number;
  /** Nome da aba a ser parseada (para Excel) */
  sheetName?: string;
  /** Índice da linha que contém os headers (0-indexed). Default: 0 */
  headerRowIndex?: number;
  /** Ignorar linhas vazias */
  skipEmptyRows?: boolean;
  /** Delimitador para CSV (auto-detectado se não fornecido) */
  csvDelimiter?: string;
  /** Encoding do arquivo CSV */
  csvEncoding?: string;
  /** Número máximo de linhas a serem lidas (para preview) */
  maxRows?: number;
}

// ============================================
// EXCEL PARSER
// ============================================

/**
 * Parseia um arquivo Excel (.xlsx, .xls)
 */
export async function parseExcelFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const {
    sheetIndex,
    sheetName,
    headerRowIndex = 0,
    skipEmptyRows = true,
    maxRows,
  } = options;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const sheets: ParsedSheet[] = [];
    let activeSheetIndex = 0;

    // Determinar quais abas processar
    const sheetNames = workbook.SheetNames;
    const sheetsToProcess: { name: string; index: number }[] = [];

    if (sheetName !== undefined) {
      const idx = sheetNames.indexOf(sheetName);
      if (idx === -1) {
        return {
          success: false,
          sheets: [],
          activeSheetIndex: 0,
          error: `Aba "${sheetName}" não encontrada no arquivo`,
          fileName: file.name,
          fileType: file.name.endsWith('.xlsx') ? 'xlsx' : 'xls',
        };
      }
      sheetsToProcess.push({ name: sheetName, index: idx });
      activeSheetIndex = 0;
    } else if (sheetIndex !== undefined) {
      if (sheetIndex < 0 || sheetIndex >= sheetNames.length) {
        return {
          success: false,
          sheets: [],
          activeSheetIndex: 0,
          error: `Índice de aba ${sheetIndex} inválido. O arquivo tem ${sheetNames.length} abas.`,
          fileName: file.name,
          fileType: file.name.endsWith('.xlsx') ? 'xlsx' : 'xls',
        };
      }
      sheetsToProcess.push({ name: sheetNames[sheetIndex], index: sheetIndex });
      activeSheetIndex = 0;
    } else {
      // Processar todas as abas
      sheetNames.forEach((name, index) => {
        sheetsToProcess.push({ name, index });
      });
    }

    // Processar cada aba
    for (const { name, index } of sheetsToProcess) {
      const worksheet = workbook.Sheets[name];
      const rawData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
      });

      if (rawData.length === 0) {
        sheets.push({
          name,
          headers: [],
          rows: [],
          rawRows: [],
        });
        continue;
      }

      // Extrair headers
      const headers = (rawData[headerRowIndex] || []).map(h =>
        String(h).trim()
      );

      // Extrair linhas de dados (após o header)
      let dataRows = rawData.slice(headerRowIndex + 1);

      // Aplicar limite de linhas
      if (maxRows !== undefined && maxRows > 0) {
        dataRows = dataRows.slice(0, maxRows);
      }

      // Converter para objetos
      const rows: Record<string, string>[] = [];
      const rawRows: string[][] = [];

      for (const row of dataRows) {
        // Verificar se a linha está vazia
        const isEmptyRow = row.every(
          cell => cell === '' || cell === null || cell === undefined
        );
        if (skipEmptyRows && isEmptyRow) {
          continue;
        }

        // Converter para objeto com headers como keys
        const rowObj: Record<string, string> = {};
        headers.forEach((header, idx) => {
          if (header) {
            rowObj[header] = String(row[idx] ?? '').trim();
          }
        });

        rows.push(rowObj);
        rawRows.push(row.map(cell => String(cell ?? '').trim()));
      }

      sheets.push({
        name,
        headers,
        rows,
        rawRows,
      });

      // Se esta era a aba especificada, definir como ativa
      if (sheetName === name || sheetIndex === index) {
        activeSheetIndex = sheets.length - 1;
      }
    }

    return {
      success: true,
      sheets,
      activeSheetIndex,
      fileName: file.name,
      fileType: file.name.endsWith('.xlsx') ? 'xlsx' : 'xls',
    };
  } catch (error) {
    return {
      success: false,
      sheets: [],
      activeSheetIndex: 0,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar arquivo Excel',
      fileName: file.name,
      fileType: file.name.endsWith('.xlsx') ? 'xlsx' : 'xls',
    };
  }
}

// ============================================
// CSV PARSER
// ============================================

/**
 * Parseia um arquivo CSV
 */
export async function parseCsvFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const {
    headerRowIndex = 0,
    skipEmptyRows = true,
    csvDelimiter,
    maxRows,
  } = options;

  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = event => {
      const text = event.target?.result as string;

      if (!text) {
        resolve({
          success: false,
          sheets: [],
          activeSheetIndex: 0,
          error: 'Arquivo vazio ou não foi possível ler o conteúdo',
          fileName: file.name,
          fileType: 'csv',
        });
        return;
      }

      // Detectar delimitador automaticamente se não fornecido
      const delimiter = csvDelimiter || detectCsvDelimiter(text);

      Papa.parse(text, {
        delimiter,
        skipEmptyLines: skipEmptyRows,
        complete: results => {
          const rawData = results.data as string[][];

          if (rawData.length === 0) {
            resolve({
              success: true,
              sheets: [
                {
                  name: file.name.replace(/\.csv$/i, ''),
                  headers: [],
                  rows: [],
                  rawRows: [],
                },
              ],
              activeSheetIndex: 0,
              fileName: file.name,
              fileType: 'csv',
            });
            return;
          }

          // Extrair headers
          const headers = (rawData[headerRowIndex] || []).map(h =>
            String(h).trim()
          );

          // Extrair linhas de dados
          let dataRows = rawData.slice(headerRowIndex + 1);

          // Aplicar limite de linhas
          if (maxRows !== undefined && maxRows > 0) {
            dataRows = dataRows.slice(0, maxRows);
          }

          // Converter para objetos
          const rows: Record<string, string>[] = [];
          const rawRows: string[][] = [];

          for (const row of dataRows) {
            // Verificar se a linha está vazia
            const isEmptyRow = row.every(
              cell => cell === '' || cell === null || cell === undefined
            );
            if (skipEmptyRows && isEmptyRow) {
              continue;
            }

            // Converter para objeto
            const rowObj: Record<string, string> = {};
            headers.forEach((header, idx) => {
              if (header) {
                rowObj[header] = String(row[idx] ?? '').trim();
              }
            });

            rows.push(rowObj);
            rawRows.push(row.map(cell => String(cell ?? '').trim()));
          }

          resolve({
            success: true,
            sheets: [
              {
                name: file.name.replace(/\.csv$/i, ''),
                headers,
                rows,
                rawRows,
              },
            ],
            activeSheetIndex: 0,
            fileName: file.name,
            fileType: 'csv',
          });
        },
        error: (error: Error) => {
          resolve({
            success: false,
            sheets: [],
            activeSheetIndex: 0,
            error: error.message || 'Erro ao processar arquivo CSV',
            fileName: file.name,
            fileType: 'csv',
          });
        },
      });
    };

    reader.onerror = () => {
      resolve({
        success: false,
        sheets: [],
        activeSheetIndex: 0,
        error: 'Erro ao ler o arquivo',
        fileName: file.name,
        fileType: 'csv',
      });
    };

    reader.readAsText(file);
  });
}

// ============================================
// UNIFIED PARSER
// ============================================

/**
 * Parseia um arquivo Excel ou CSV automaticamente baseado na extensão
 */
export async function parseFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelFile(file, options);
  }

  if (fileName.endsWith('.csv')) {
    return parseCsvFile(file, options);
  }

  return {
    success: false,
    sheets: [],
    activeSheetIndex: 0,
    error: 'Formato de arquivo não suportado. Use .xlsx, .xls ou .csv',
    fileName: file.name,
    fileType: 'csv',
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Detecta o delimitador mais provável de um arquivo CSV
 */
export function detectCsvDelimiter(text: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const firstLines = text.split('\n').slice(0, 5).join('\n');

  let bestDelimiter = ',';
  let maxCount = 0;

  for (const delimiter of delimiters) {
    const count = (
      firstLines.match(new RegExp(escapeRegex(delimiter), 'g')) || []
    ).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

/**
 * Escapa caracteres especiais para regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Obtém os nomes das abas de um arquivo Excel
 */
export async function getExcelSheetNames(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    return workbook.SheetNames;
  } catch {
    return [];
  }
}

/**
 * Obtém preview das primeiras N linhas de uma aba
 */
export async function getSheetPreview(
  file: File,
  sheetIndex: number = 0,
  maxRows: number = 10
): Promise<ParsedSheet | null> {
  const result = await parseFile(file, { sheetIndex, maxRows });
  if (!result.success || result.sheets.length === 0) {
    return null;
  }
  return result.sheets[0];
}

/**
 * Valida se um arquivo é do tipo suportado
 */
export function isValidFileType(file: File): boolean {
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Obtém a extensão do arquivo
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? `.${parts.pop()}` : '';
}

/**
 * Normaliza um header para uso como key (remove acentos, espaços, etc.)
 */
export function normalizeHeaderKey(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais por _
    .replace(/_+/g, '_') // Remove múltiplos _
    .replace(/^_|_$/g, ''); // Remove _ no início e fim
}

/**
 * Cria um mapa de header normalizado -> header original
 */
export function createHeaderMap(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const header of headers) {
    const normalized = normalizeHeaderKey(header);
    if (normalized && !map.has(normalized)) {
      map.set(normalized, header);
    }
  }
  return map;
}

// ============================================
// STATISTICS
// ============================================

export interface SheetStatistics {
  totalRows: number;
  filledRows: number;
  emptyRows: number;
  columnCount: number;
  fillRate: number;
  columnFillRates: Record<string, number>;
}

/**
 * Calcula estatísticas de uma aba
 */
export function calculateSheetStatistics(sheet: ParsedSheet): SheetStatistics {
  const totalRows = sheet.rows.length;
  const columnCount = sheet.headers.length;

  // Calcular taxa de preenchimento por coluna
  const columnFillRates: Record<string, number> = {};
  let totalFilledCells = 0;

  for (const header of sheet.headers) {
    let filledCount = 0;
    for (const row of sheet.rows) {
      if (row[header] && row[header].trim() !== '') {
        filledCount++;
        totalFilledCells++;
      }
    }
    columnFillRates[header] = totalRows > 0 ? filledCount / totalRows : 0;
  }

  // Contar linhas preenchidas (pelo menos uma célula não vazia)
  let filledRows = 0;
  for (const row of sheet.rows) {
    const hasContent = sheet.headers.some(h => row[h] && row[h].trim() !== '');
    if (hasContent) {
      filledRows++;
    }
  }

  const totalCells = totalRows * columnCount;
  const fillRate = totalCells > 0 ? totalFilledCells / totalCells : 0;

  return {
    totalRows,
    filledRows,
    emptyRows: totalRows - filledRows,
    columnCount,
    fillRate,
    columnFillRates,
  };
}
