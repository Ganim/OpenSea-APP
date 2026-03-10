'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateAttachmentRequest } from '@/types/stock';
import { useState } from 'react';
import { MdAdd } from 'react-icons/md';

interface AttachmentUploadProps {
  onAdd: (data: CreateAttachmentRequest) => void;
  isPending?: boolean;
}

/**
 * Formulário simples para adicionar anexo (metadados).
 * Upload real de arquivo via Storage é tratado separadamente.
 */
export function AttachmentUpload({ onAdd, isPending }: AttachmentUploadProps) {
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl.trim() || !fileName.trim()) return;

    onAdd({
      fileUrl: fileUrl.trim(),
      fileName: fileName.trim(),
      fileSize: 0,
      mimeType: guessMimeType(fileName),
      label: label.trim() || undefined,
    });

    setFileUrl('');
    setFileName('');
    setLabel('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="att-url">URL do Arquivo</Label>
          <Input
            id="att-url"
            value={fileUrl}
            onChange={e => setFileUrl(e.target.value)}
            placeholder="https://..."
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="att-name">Nome do Arquivo</Label>
          <Input
            id="att-name"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            placeholder="documento.pdf"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="att-label">Rótulo (opcional)</Label>
          <Input
            id="att-label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ex: Ficha técnica"
            disabled={isPending}
          />
        </div>
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={isPending || !fileUrl.trim() || !fileName.trim()}
        className="gap-1"
      >
        <MdAdd className="h-4 w-4" />
        Adicionar Anexo
      </Button>
    </form>
  );
}

function guessMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    zip: 'application/zip',
  };
  return map[ext || ''] || 'application/octet-stream';
}
