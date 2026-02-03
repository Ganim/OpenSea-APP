/**
 * Import Templates Modal
 * Modal para importação em massa de templates
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ImportTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ImportTemplatesModal({
  isOpen,
  onClose,
  onImport,
}: ImportTemplatesModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      await onImport(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Erro ao importar templates:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // TODO: Implementar download do template CSV/Excel
    console.log('Download template');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Importar Templates</DialogTitle>
          <DialogDescription>
            Importe múltiplos templates de uma vez usando um arquivo CSV ou
            Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Download Template Button */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Baixar modelo
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Use nosso modelo para facilitar a importação
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="border-blue-300 dark:border-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {selectedFile ? (
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Formatos suportados: CSV, XLSX, XLS
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isImporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isImporting || !selectedFile}
            className="bg-linear-to-br from-blue-500 to-purple-600"
          >
            {isImporting ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
