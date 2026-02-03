'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSVUploadProps {
  onDataParsed: (data: string[][], headers: string[]) => void;
  className?: string;
}

type Delimiter = ',' | ';' | '\t' | '|';

const DELIMITER_OPTIONS: { value: Delimiter; label: string }[] = [
  { value: ',', label: 'Vírgula (,)' },
  { value: ';', label: 'Ponto e vírgula (;)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
];

function parseCSV(content: string, delimiter: Delimiter): string[][] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  return lines.map(line => {
    // Handle quoted fields
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
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

export function CSVUpload({ onDataParsed, className }: CSVUploadProps) {
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((fileContent: string, delim: Delimiter) => {
    try {
      const parsed = parseCSV(fileContent, delim);
      if (parsed.length < 2) {
        setError(
          'O arquivo deve conter pelo menos um cabeçalho e uma linha de dados'
        );
        setPreview(null);
        return;
      }
      setPreview(parsed.slice(0, 6)); // Preview das primeiras 5 linhas + header
      setError(null);
    } catch {
      setError('Erro ao processar o arquivo');
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setError(null);

      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        processFile(content, delimiter);
      };
      reader.onerror = () => {
        setError('Erro ao ler o arquivo');
      };
      reader.readAsText(selectedFile);
    },
    [delimiter, processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxFiles: 1,
  });

  const handleDelimiterChange = (value: Delimiter) => {
    setDelimiter(value);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        processFile(content, value);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirm = () => {
    if (!file || !preview) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const parsed = parseCSV(content, delimiter);
      const headers = parsed[0] || [];
      const data = parsed.slice(1);
      onDataParsed(data, headers);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Importar de Arquivo</CardTitle>
        <CardDescription>
          Carregue um arquivo CSV ou Excel para importar dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delimiter selector */}
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <Label className="text-sm">Separador</Label>
            <Select value={delimiter} onValueChange={handleDelimiterChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIMITER_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dropzone */}
        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-primary font-medium">
                Solte o arquivo aqui...
              </p>
            ) : (
              <>
                <p className="font-medium">
                  Arraste um arquivo ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Suporta CSV, TXT, XLS, XLSX
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="space-y-3">
                <Label className="text-sm">Preview (primeiras 5 linhas)</Label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        {preview[0]?.map((header, i) => (
                          <th
                            key={i}
                            className="border p-2 text-left font-medium"
                          >
                            {header || `Coluna ${i + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border p-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleConfirm}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Usar estes dados
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
