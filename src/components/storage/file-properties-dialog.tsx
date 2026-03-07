'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { StorageFile } from '@/types/storage';
import { FileTypeIcon } from './file-type-icon';
import { formatFileSize, getFileExtension } from './utils';
import { formatDate } from '@/lib/utils';

interface FilePropertiesDialogProps {
  file: StorageFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName?: string;
}

export function FilePropertiesDialog({
  file,
  open,
  onOpenChange,
  folderName,
}: FilePropertiesDialogProps) {
  if (!file) return null;

  const extension = getFileExtension(file.originalName);

  const properties: { label: string; value: string }[] = [
    { label: 'Nome', value: file.originalName },
    { label: 'Extensão', value: extension ? `.${extension}` : '—' },
    { label: 'Tipo MIME', value: file.mimeType },
    { label: 'Tamanho', value: formatFileSize(file.size) },
    { label: 'Criado em', value: formatDate(file.createdAt) },
    ...(file.updatedAt
      ? [{ label: 'Modificado em', value: formatDate(file.updatedAt) }]
      : []),
    { label: 'Versão', value: `v${file.currentVersion}` },
    { label: 'Enviado por', value: file.uploadedBy },
    ...(folderName ? [{ label: 'Pasta', value: folderName }] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileTypeIcon fileType={file.fileType} size={20} />
            Propriedades
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
          {properties.map(({ label, value }) => (
            <div key={label} className="contents">
              <span className="text-muted-foreground whitespace-nowrap">
                {label}
              </span>
              <span className="font-medium truncate" title={value}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
