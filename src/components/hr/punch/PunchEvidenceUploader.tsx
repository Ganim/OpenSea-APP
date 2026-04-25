'use client';

/**
 * PunchEvidenceUploader — drag-and-drop PDF dropzone (Phase 7 / Plan 07-06 / Task 2).
 *
 * - Accepts ONLY application/pdf, up to 3 files, max 10 MB each.
 * - Shows per-file preview (name + size + progress).
 * - On a successful upload, calls `onUploaded(storageKeys)` so the parent
 *   can attach the keys to the approval body when calling batch-resolve.
 * - Sensitive op — uploads include the action-PIN token passed by the
 *   parent (from VerifyActionPinModal flow).
 *
 * data-testid: punch-evidence-uploader (root), punch-evidence-input (file input).
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { punchExportService } from '@/services/hr/punch-export.service';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PunchEvidenceUploaderProps {
  /** Approval id this evidence is being attached to. */
  approvalId: string;
  /** Action-PIN token from VerifyActionPinModal (header `x-action-pin-token`). */
  actionPinToken: string;
  /** Notified with the list of accumulated storageKeys after each upload. */
  onUploaded: (storageKeys: string[]) => void;
  /** Disabled state (form is submitting, etc.). */
  disabled?: boolean;
  /** Max files. Default 3. */
  maxFiles?: number;
  /** Max file size in bytes. Default 10 MB. */
  maxSize?: number;
}

interface UploadedItem {
  filename: string;
  size: number;
  storageKey: string;
}

const MB = 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

export function PunchEvidenceUploader({
  approvalId,
  actionPinToken,
  onUploaded,
  disabled,
  maxFiles = 3,
  maxSize = 10 * MB,
}: PunchEvidenceUploaderProps) {
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      const msg = 'Apenas arquivos PDF são aceitos.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (file.size > maxSize) {
      const msg = `Arquivo excede ${formatBytes(maxSize)}.`;
      setError(msg);
      toast.error(msg);
      return;
    }
    if (items.length >= maxFiles) {
      const msg = `Limite de ${maxFiles} anexos atingido.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    setUploading(true);
    try {
      const response = await punchExportService.uploadEvidence(
        approvalId,
        file,
        actionPinToken
      );
      const next: UploadedItem[] = [
        ...items,
        {
          filename: response.filename ?? file.name,
          size: response.size ?? file.size,
          storageKey: response.storageKey,
        },
      ];
      setItems(next);
      onUploaded(next.map(i => i.storageKey));
      toast.success(`Anexo enviado: ${file.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao enviar anexo';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (storageKey: string) => {
    const next = items.filter(i => i.storageKey !== storageKey);
    setItems(next);
    onUploaded(next.map(i => i.storageKey));
  };

  return (
    <div data-testid="punch-evidence-uploader" className="space-y-2">
      <Label>
        Anexos (PDF, até {maxFiles} arquivos, {formatBytes(maxSize)} cada)
      </Label>
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center',
          'transition-colors hover:bg-accent/30',
          disabled && 'pointer-events-none opacity-50'
        )}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (disabled) return;
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <Upload className="h-8 w-8 text-muted-foreground/60" />
        <div className="space-y-1">
          <p className="text-sm">Arraste um PDF ou</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading || items.length >= maxFiles}
          >
            {uploading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Escolher arquivo
          </Button>
        </div>
        <input
          ref={inputRef}
          data-testid="punch-evidence-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            // reset input so the same file can be re-uploaded if removed
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      </div>

      {error && (
        <p
          data-testid="punch-evidence-error"
          className="text-xs text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}

      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map(item => (
            <li
              key={item.storageKey}
              data-testid={`punch-evidence-item-${item.storageKey}`}
              className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{item.filename}</span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(item.size)}
                </span>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => handleRemove(item.storageKey)}
                aria-label="Remover anexo"
              >
                <X className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
