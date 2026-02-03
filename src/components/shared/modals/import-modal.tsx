/**
 * Import Modal (Generic)
 * Modal para importação em massa de qualquer entidade
 * Componente 100% genérico que funciona com qualquer entidade
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

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  title?: string;
  description?: string;
  acceptedFormats?: string;
  templateUrl?: string;
  onDownloadTemplate?: () => void;
  icon?: React.ReactNode;
}

export function ImportModal({
  isOpen,
  onClose,
  onImport,
  title = 'Importar',
  description = 'Faça upload de um arquivo CSV ou Excel para importar em massa.',
  acceptedFormats = '.csv,.xlsx,.xls',
  templateUrl,
  onDownloadTemplate,
  icon,
}: ImportModalProps) {
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
      console.error('Erro ao importar:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (templateUrl) {
      window.open(templateUrl, '_blank');
    } else if (onDownloadTemplate) {
      onDownloadTemplate();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              {icon || <Upload className="w-5 h-5 text-blue-500" />}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Download Template Button */}
          {(templateUrl || onDownloadTemplate) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar modelo
            </Button>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />

            {selectedFile ? (
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="mt-2"
                >
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Arraste um arquivo aqui ou
                </p>
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>Selecionar arquivo</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept={acceptedFormats}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Formatos aceitos:{' '}
                  {acceptedFormats.replace(/\./g, '').toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
