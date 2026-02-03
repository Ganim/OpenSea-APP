/**
 * Excel/CSV utilities for import system
 */

import * as XLSX from 'xlsx';
import type { ImportFieldConfig } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedFileData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export interface ExcelTemplateOptions {
  sheetName?: string;
  includeExamples?: boolean;
}

// ============================================================================
// FILE PARSING
// ============================================================================

/**
 * Parse a file (Excel or CSV) and return structured data
 */
export async function parseImportFile(file: File): Promise<ParsedFileData> {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = e.target?.result;

        if (isExcel) {
          const result = parseExcel(data as ArrayBuffer);
          resolve(result);
        } else {
          const result = parseCSV(data as string);
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

/**
 * Parse Excel file
 */
function parseExcel(data: ArrayBuffer): ParsedFileData {
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of arrays
  const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    raw: false, // Convert all values to strings
    defval: '', // Default value for empty cells
  });

  if (rows.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  // First row is headers
  const headers = (rows[0] || []).map(h => String(h || '').trim());
  const dataRows = rows
    .slice(1)
    .map(row => row.map(cell => String(cell || '').trim()));

  return {
    headers,
    rows: dataRows,
    totalRows: dataRows.length,
  };
}

/**
 * Parse CSV file
 */
function parseCSV(data: string): ParsedFileData {
  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = data.split('\n')[0] || '';
  const delimiter = detectDelimiter(firstLine);

  const lines = data.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = parseCSVLine(lines[0], delimiter).map(h => h.trim());
  const dataRows = lines
    .slice(1)
    .map(line => parseCSVLine(line, delimiter).map(cell => cell.trim()));

  return {
    headers,
    rows: dataRows,
    totalRows: dataRows.length,
  };
}

/**
 * Detect CSV delimiter
 */
function detectDelimiter(line: string): string {
  const counts = {
    ',': (line.match(/,/g) || []).length,
    ';': (line.match(/;/g) || []).length,
    '\t': (line.match(/\t/g) || []).length,
  };

  if (counts[';'] > counts[','] && counts[';'] > counts['\t']) return ';';
  if (counts['\t'] > counts[','] && counts['\t'] > counts[';']) return '\t';
  return ',';
}

/**
 * Parse a single CSV line (handling quoted fields)
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// ============================================================================
// EXCEL TEMPLATE GENERATION
// ============================================================================

/**
 * Generate and download an Excel template for import
 */
export function downloadExcelTemplate(
  fields: ImportFieldConfig[],
  entityName: string,
  options: ExcelTemplateOptions = {}
): void {
  const { sheetName = 'Dados', includeExamples = true } = options;

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Prepare headers (only enabled fields)
  const enabledFields = fields.filter(f => f.enabled !== false);
  const headers = enabledFields.map(f => f.label);

  // Prepare data with headers
  const data: (string | number)[][] = [headers];

  // Add example row if requested
  if (includeExamples) {
    const exampleRow = enabledFields.map(f => getExampleValue(f));
    data.push(exampleRow);
  }

  // Add a few empty rows for user to fill
  for (let i = 0; i < 5; i++) {
    data.push(enabledFields.map(() => ''));
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = enabledFields.map(f => ({
    wch: Math.max(f.label.length + 2, 15),
  }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Add instructions sheet
  const instructionsData = generateInstructionsSheet(enabledFields);
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 50 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `template_${entityName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Generate example value for a field
 */
function getExampleValue(field: ImportFieldConfig): string | number {
  switch (field.type) {
    case 'text':
      if (field.key.toLowerCase().includes('cnpj')) {
        return '12.345.678/0001-90';
      }
      if (field.key.toLowerCase().includes('cpf')) {
        return '123.456.789-00';
      }
      if (field.key.toLowerCase().includes('email')) {
        return 'exemplo@email.com';
      }
      if (
        field.key.toLowerCase().includes('phone') ||
        field.key.toLowerCase().includes('telefone')
      ) {
        return '(11) 99999-9999';
      }
      if (
        field.key.toLowerCase().includes('cep') ||
        field.key.toLowerCase().includes('postal')
      ) {
        return '01234-567';
      }
      return `Exemplo ${field.label}`;

    case 'number':
      if (
        field.key.toLowerCase().includes('salary') ||
        field.key.toLowerCase().includes('price')
      ) {
        return 1500.0;
      }
      if (field.key.toLowerCase().includes('hours')) {
        return 44;
      }
      return 1;

    case 'email':
      return 'exemplo@email.com';

    case 'date':
      return new Date().toISOString().slice(0, 10);

    case 'boolean':
      return 'Sim';

    case 'select':
      if (field.options && field.options.length > 0) {
        return field.options[0].label;
      }
      return '';

    case 'reference':
      return `ID ou Nome do(a) ${field.label}`;

    default:
      return '';
  }
}

/**
 * Generate instructions sheet data
 */
function generateInstructionsSheet(
  fields: ImportFieldConfig[]
): (string | number)[][] {
  const data: (string | number)[][] = [
    ['Campo', 'Obrigatório', 'Descrição', 'Valores Aceitos'],
    [], // Empty row
  ];

  for (const field of fields) {
    let acceptedValues = '';

    if (field.type === 'select' && field.options) {
      acceptedValues = field.options.map(o => o.label).join(', ');
    } else if (field.type === 'boolean') {
      acceptedValues = 'Sim, Não, 1, 0, true, false';
    } else if (field.type === 'date') {
      acceptedValues = 'Data no formato YYYY-MM-DD ou DD/MM/YYYY';
    } else if (field.type === 'number') {
      acceptedValues = 'Número';
      if (field.min !== undefined) acceptedValues += ` (mín: ${field.min})`;
      if (field.max !== undefined) acceptedValues += ` (máx: ${field.max})`;
    } else if (field.type === 'email') {
      acceptedValues = 'Email válido';
    } else if (field.key.toLowerCase().includes('cnpj')) {
      acceptedValues = 'CNPJ com ou sem formatação';
    } else if (field.key.toLowerCase().includes('cpf')) {
      acceptedValues = 'CPF com ou sem formatação';
    }

    data.push([
      field.label,
      field.required ? 'Sim' : 'Não',
      field.description || '',
      acceptedValues,
    ]);
  }

  return data;
}

// ============================================================================
// DATA CLEANING UTILITIES
// ============================================================================

/**
 * Clean CNPJ - remove all non-numeric characters
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Clean CPF - remove all non-numeric characters
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Clean phone number - remove all non-numeric characters
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Clean postal code (CEP) - remove all non-numeric characters
 */
export function cleanPostalCode(cep: string): string {
  return cep.replace(/\D/g, '');
}

/**
 * Parse boolean value from various formats
 */
export function parseBoolean(value: string | boolean | number): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const normalized = String(value).toLowerCase().trim();
  return ['sim', 'yes', 'true', '1', 's', 'y'].includes(normalized);
}

/**
 * Parse date from various formats
 */
export function parseDate(value: string): string | null {
  if (!value) return null;

  // Try ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  // Try Brazilian format (DD/MM/YYYY)
  const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  // Try to parse as Date
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Clean and normalize import row data based on field definitions
 */
export function cleanRowData(
  rowData: Record<string, unknown>,
  fields: ImportFieldConfig[]
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const field of fields) {
    const value = rowData[field.key];
    if (value === undefined || value === null || value === '') continue;

    const stringValue = String(value).trim();
    if (!stringValue) continue;

    // Clean based on field type or key
    if (field.key.toLowerCase().includes('cnpj')) {
      cleaned[field.key] = cleanCNPJ(stringValue);
    } else if (field.key.toLowerCase().includes('cpf')) {
      cleaned[field.key] = cleanCPF(stringValue);
    } else if (
      field.key.toLowerCase().includes('phone') ||
      field.key.toLowerCase().includes('telefone')
    ) {
      cleaned[field.key] = cleanPhone(stringValue);
    } else if (
      field.key.toLowerCase().includes('cep') ||
      field.key.toLowerCase().includes('postal')
    ) {
      cleaned[field.key] = cleanPostalCode(stringValue);
    } else if (field.type === 'boolean') {
      cleaned[field.key] = parseBoolean(stringValue);
    } else if (field.type === 'date') {
      const parsed = parseDate(stringValue);
      if (parsed) cleaned[field.key] = parsed;
    } else if (field.type === 'number') {
      const num = parseFloat(stringValue.replace(',', '.'));
      if (!isNaN(num)) cleaned[field.key] = num;
    } else if (field.type === 'select' && field.options) {
      // Try to match by label or value
      const match = field.options.find(
        o =>
          o.label.toLowerCase() === stringValue.toLowerCase() ||
          o.value.toLowerCase() === stringValue.toLowerCase()
      );
      cleaned[field.key] = match ? match.value : stringValue;
    } else {
      cleaned[field.key] = stringValue;
    }
  }

  return cleaned;
}
