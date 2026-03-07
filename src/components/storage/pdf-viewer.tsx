'use client';

import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use CDN worker to avoid bundling issues with Next.js/Turbopack
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  /** Called when fetch or rendering fails — allows parent to show a fallback */
  onError?: () => void;
}

export function PdfViewer({ url, onError }: PdfViewerProps) {
  const [pdfData, setPdfData] = useState<{ data: Uint8Array } | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pre-fetch PDF as binary data to avoid IDM/extension interception
  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdfData(null);
    setPageNumber(1);
    setNumPages(0);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((buffer) => {
        if (!cancelled) {
          setPdfData({ data: new Uint8Array(buffer) });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Erro ao carregar PDF');
          setLoading(false);
          onError?.();
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError('Erro ao renderizar PDF');
    setLoading(false);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  return (
    <div className="w-full h-[calc(80vh+60px)] rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-800/50 flex flex-col">
      {/* Toolbar */}
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 border-b bg-white dark:bg-slate-900 shrink-0">
          <Button size="icon-sm" variant="ghost" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[80px] text-center">
            {pageNumber} / {numPages}
          </span>
          <Button size="icon-sm" variant="ghost" onClick={goToNextPage} disabled={pageNumber >= numPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button size="icon-sm" variant="ghost" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button size="icon-sm" variant="ghost" onClick={zoomIn} disabled={scale >= 3.0}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* PDF content */}
      <div className="flex-1 overflow-auto flex justify-center">
        {loading && (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando PDF...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center w-full">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        {pdfData && (
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={null}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={null}
              renderAnnotationLayer
              renderTextLayer
            />
          </Document>
        )}
      </div>
    </div>
  );
}
