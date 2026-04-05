'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { StorageFile } from '@/types/storage';
import { useAuth } from '@/contexts/auth-context';
import { storageFilesService } from '@/services/storage/files.service';
import { FileTypeIcon } from './file-type-icon';
import { OfficeViewer, isOfficePreviewable } from './office-viewer';
import { PdfViewer } from './pdf-viewer';
import { ProtectedImageCanvas } from './protected-image-canvas';
import { VideoPlayer, isVideoPreviewable } from './video-player';
import { toast } from 'sonner';

interface FilePreviewModalProps {
  file: StorageFile | null;
  files?: StorageFile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (file: StorageFile) => void;
  canDownload?: boolean;
  /** Password for protected files — passed to serve URL */
  password?: string;
}

export function FilePreviewModal({
  file,
  files = [],
  open,
  onOpenChange,
  onNavigate,
  canDownload = false,
  password,
}: FilePreviewModalProps) {
  const { user } = useAuth();
  const userName = user?.username ?? user?.email ?? 'Usuário';

  // When server-side PDF conversion fails (e.g. LibreOffice not installed),
  // fall back to the client-side OfficeViewer (docx-preview / xlsx)
  const [pdfConversionFailed, setPdfConversionFailed] = useState(false);

  // Binary data fetched via authenticated request — never exposed as URL, immune to IDM
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [binaryData, setBinaryData] = useState<ArrayBuffer | null>(null);
  const [binaryDataPdf, setBinaryDataPdf] = useState<ArrayBuffer | null>(null);

  // Proxy serve URL (used internally for fetch, NOT exposed to DOM)
  const serveUrl = useMemo(
    () => (file ? storageFilesService.getServeUrl(file.id, { password }) : ''),
    [file, password]
  );

  const serveUrlPdf = useMemo(
    () =>
      file
        ? storageFilesService.getServeUrl(file.id, { password, format: 'pdf' })
        : '',
    [file, password]
  );

  // Fetch file data via POST request — IDM only intercepts GET, not POST
  useEffect(() => {
    if (!file || !serveUrl || !open) {
      setBlobUrl('');
      setBinaryData(null);
      setBinaryDataPdf(null);
      return;
    }

    let cancelled = false;
    setPdfConversionFailed(false);

    // POST to /v1/storage/preview with fileId in JSON body
    // IDM intercepts GET URLs but cannot intercept POST with JSON body
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    const authToken = localStorage.getItem('auth_token') || '';

    // POST JSON → receive base64 in JSON response — IDM never intercepts JSON
    const fetchProtected = async (fileId: string, format?: string): Promise<ArrayBuffer> => {
      const res = await fetch(`${apiBase}/v1/storage/preview`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ fileId, format: format || undefined, password }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Decode base64 to ArrayBuffer
      const binary = atob(json.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    };

    const isPdfFile = file.fileType === 'pdf';
    const isOfficeFile = isOfficePreviewable(file.mimeType);

    if (isPdfFile || isOfficeFile) {
      fetchProtected(file.id)
        .then(buffer => {
          if (!cancelled) setBinaryData(buffer);
        })
        .catch(() => {
          if (!cancelled) setBinaryData(null);
        });

      if (isOfficeFile) {
        fetchProtected(file.id, 'pdf')
          .then(buffer => {
            if (!cancelled) setBinaryDataPdf(buffer);
          })
          .catch(() => {
            if (!cancelled) {
              setBinaryDataPdf(null);
              setPdfConversionFailed(true);
            }
          });
      }
    } else {
      fetchProtected(file.id)
        .then(buffer => {
          if (!cancelled) {
            const blob = new Blob([buffer]);
            setBlobUrl(URL.createObjectURL(blob));
          }
        })
        .catch(() => {
          if (!cancelled) setBlobUrl('');
        });
    }

    return () => {
      cancelled = true;
      setBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return ''; });
    };
  }, [file?.id, serveUrl, serveUrlPdf, open]);

  const currentIndex = file ? files.findIndex(f => f.id === file.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < files.length - 1;

  const handlePrevious = useCallback(() => {
    if (hasPrevious && onNavigate) {
      onNavigate(files[currentIndex - 1]);
    }
  }, [hasPrevious, files, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(files[currentIndex + 1]);
    }
  }, [hasNext, files, currentIndex, onNavigate]);

  const handleDownload = useCallback(async () => {
    if (!file) return;
    try {
      // POST JSON endpoint — returns base64, IDM cannot intercept JSON
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const token = localStorage.getItem('auth_token') || '';
      const res = await fetch(`${apiBase}/v1/storage/preview`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fileId: file.id, password }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const binary = atob(json.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: json.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName || file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar o arquivo');
    }
  }, [file, password]);

  if (!file) return null;

  const isImage = file.fileType === 'image';
  const isPdf = file.fileType === 'pdf';
  const isOffice = isOfficePreviewable(file.mimeType);
  const isVideo = isVideoPreviewable(file.mimeType);
  const isPresentation = file.fileType === 'presentation';
  const isDocument = isPdf || isOffice || isPresentation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[95vh] flex flex-col [&>button]:hidden ${isDocument ? 'sm:max-w-4xl' : 'sm:max-w-3xl'}`}
      >
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0">
          <FileTypeIcon fileType={file.fileType} size={20} />
          <DialogTitle className="flex-1 truncate">{file.name}</DialogTitle>
          <div className="flex items-center gap-1 shrink-0">
            {canDownload && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleDownload}
                title="Baixar"
                aria-label="Baixar arquivo"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              title="Fechar"
              aria-label="Fechar preview"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Preview area */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          {/* Navigation arrows */}
          {files.length > 1 && (
            <>
              {hasPrevious && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
                  onClick={handlePrevious}
                  aria-label="Arquivo anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              {hasNext && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
                  onClick={handleNext}
                  aria-label="Próximo arquivo"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </>
          )}

          {!blobUrl && !binaryData && !binaryDataPdf && !pdfConversionFailed ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando arquivo...</p>
            </div>
          ) : isImage && blobUrl ? (
            <div className="flex items-center justify-center w-full max-h-[50vh] overflow-hidden rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <ProtectedImageCanvas
                src={blobUrl}
                alt={file.name}
                watermarkText={`${userName} · ${new Date().toLocaleDateString('pt-BR')}`}
                className="print-hidden"
                maxHeight={500}
              />
            </div>
          ) : isPdf && binaryData ? (
            <PdfViewer binaryData={binaryData} />
          ) : (isOffice || isPresentation) &&
            binaryDataPdf &&
            !pdfConversionFailed ? (
            <PdfViewer
              binaryData={binaryDataPdf}
              onError={() => setPdfConversionFailed(true)}
            />
          ) : isOffice && pdfConversionFailed && binaryData ? (
            <OfficeViewer
              url={URL.createObjectURL(new Blob([binaryData]))}
              fileName={file.name}
              mimeType={file.mimeType}
            />
          ) : isVideo && blobUrl ? (
            <VideoPlayer url={blobUrl} name={file.name} />
          ) : (
            <div className="flex flex-col items-center gap-4 py-12">
              <FileTypeIcon fileType={file.fileType} size={64} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualização não disponível para este tipo de arquivo
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
