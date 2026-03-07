'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  ScrollText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OfficeViewerProps {
  url: string;
  fileName: string;
  mimeType: string;
}

const DOCX_MIMES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const XLSX_MIMES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const PPTX_MIMES = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
];

/** All office MIME types that can be converted to PDF server-side */
export function isOfficePreviewable(mimeType: string): boolean {
  return [...DOCX_MIMES, ...XLSX_MIMES, ...PPTX_MIMES].includes(mimeType);
}

/** A4 page height in px at 96 DPI */
const A4_PAGE_HEIGHT = 1122.53;
/** Gap between page cards in px */
const PAGE_GAP = 24;
/** Wrapper vertical padding in px */
const WRAPPER_PADDING = 24;

export function OfficeViewer({ url, fileName, mimeType }: OfficeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [breakPages, setBreakPages] = useState(true);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);

  // DOCX page navigation
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageHeightRef = useRef(A4_PAGE_HEIGHT);

  // XLSX sheet tabs
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const workbookRef = useRef<unknown>(null);

  const isDocx = DOCX_MIMES.includes(mimeType);
  const isXlsx = XLSX_MIMES.includes(mimeType);

  // Step 1: Fetch file data
  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setFileBuffer(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar arquivo');
        return res.arrayBuffer();
      })
      .then((buffer) => {
        if (!cancelled) setFileBuffer(buffer);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar arquivo',
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Step 2a: Render DOCX (re-runs when buffer arrives or breakPages toggles)
  useEffect(() => {
    if (!fileBuffer || !containerRef.current || !isDocx) return;

    let cancelled = false;
    const container = containerRef.current;

    async function render() {
      try {
        const { renderAsync } = await import('docx-preview');
        container.innerHTML = '';

        // Clone buffer to prevent consumption on re-renders
        await renderAsync(fileBuffer!.slice(0), container, undefined, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages,
          experimental: false,
        });

        if (!cancelled && breakPages) {
          // Style wrapper as page canvas
          const wrapper = container.querySelector(
            '.docx-wrapper',
          ) as HTMLElement;
          if (wrapper) {
            wrapper.style.background = 'transparent';
            wrapper.style.padding = `${WRAPPER_PADDING}px`;
          }

          const cardShadow =
            '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)';
          const cardBorder = '1px solid rgba(0,0,0,0.06)';
          const sections = container.querySelectorAll(
            'section.docx',
          ) as NodeListOf<HTMLElement>;
          let totalPages = 0;

          sections.forEach((section) => {
            const ph =
              parseFloat(window.getComputedStyle(section).minHeight) ||
              A4_PAGE_HEIGHT;
            pageHeightRef.current = ph;
            const sectionPages = Math.max(
              1,
              Math.ceil(section.scrollHeight / ph),
            );
            totalPages += sectionPages;

            if (sectionPages > 1) {
              // Multi-page section → split into individual page cards
              const parent = section.parentElement;
              if (!parent) return;

              const pageGroup = document.createElement('div');
              pageGroup.style.display = 'flex';
              pageGroup.style.flexDirection = 'column';
              pageGroup.style.alignItems = 'center';
              pageGroup.style.gap = `${PAGE_GAP}px`;
              pageGroup.style.marginBottom = `${PAGE_GAP}px`;

              parent.insertBefore(pageGroup, section);
              parent.removeChild(section);

              // Strip card styles from the section itself
              section.style.boxShadow = 'none';
              section.style.border = 'none';
              section.style.marginBottom = '0';
              section.style.overflow = 'visible';

              for (let i = 0; i < sectionPages; i++) {
                const card = document.createElement('div');
                card.style.height = `${ph}px`;
                card.style.overflow = 'hidden';
                card.style.background = 'white';
                card.style.boxShadow = cardShadow;
                card.style.borderRadius = '2px';
                card.style.border = cardBorder;

                const clone =
                  i === 0
                    ? section
                    : (section.cloneNode(true) as HTMLElement);
                if (i > 0) clone.style.marginTop = `${-i * ph}px`;

                card.appendChild(clone);
                pageGroup.appendChild(card);
              }
            } else {
              // Single-page section → style as page card directly
              section.style.overflow = 'visible';
              section.style.boxShadow = cardShadow;
              section.style.borderRadius = '2px';
              section.style.marginBottom = `${PAGE_GAP}px`;
              section.style.border = cardBorder;
            }
          });

          setNumPages(totalPages);
          setCurrentPage(1);
        } else if (!cancelled) {
          // Continuous scroll — reset page canvas styling
          const wrapper = container.querySelector(
            '.docx-wrapper',
          ) as HTMLElement;
          if (wrapper) {
            wrapper.style.background = '';
            wrapper.style.padding = '';
          }
          setNumPages(0);
          setCurrentPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao renderizar documento',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [fileBuffer, mimeType, breakPages, isDocx]);

  // Step 2b: Render XLSX
  useEffect(() => {
    if (!fileBuffer || !containerRef.current || !isXlsx) return;

    let cancelled = false;
    const container = containerRef.current;

    async function render() {
      try {
        const XLSX = await import('xlsx');
        // Parse workbook once and cache
        if (!workbookRef.current) {
          workbookRef.current = XLSX.read(fileBuffer!.slice(0), {
            type: 'array',
          });
        }

        const workbook = workbookRef.current as {
          SheetNames: string[];
          Sheets: Record<string, unknown>;
        };

        if (!cancelled) {
          setSheetNames(workbook.SheetNames);

          const sheetName =
            workbook.SheetNames[activeSheet] || workbook.SheetNames[0];
          if (!sheetName) throw new Error('Planilha vazia');

          const html = XLSX.utils.sheet_to_html(
            workbook.Sheets[sheetName] as Parameters<typeof XLSX.utils.sheet_to_html>[0],
            { editable: false },
          );
          container.innerHTML = `<div class="xlsx-preview">${html}</div>`;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao renderizar planilha',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [fileBuffer, mimeType, activeSheet, isXlsx]);

  // Scroll-based page tracking for DOCX
  useEffect(() => {
    if (!breakPages || numPages <= 1 || !scrollRef.current) return;

    const scrollEl = scrollRef.current;
    const handleScroll = () => {
      const ph = pageHeightRef.current;
      // +10 tolerance to handle sub-pixel rounding at page boundaries
      const adjusted = Math.max(
        0,
        scrollEl.scrollTop - WRAPPER_PADDING * scale + 10,
      );
      const page = Math.min(
        numPages,
        Math.max(
          1,
          Math.floor(adjusted / ((ph + PAGE_GAP) * scale)) + 1,
        ),
      );
      setCurrentPage(page);
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [breakPages, numPages, scale]);

  const goToPage = useCallback(
    (page: number) => {
      if (!scrollRef.current || page < 1 || page > numPages) return;
      const ph = pageHeightRef.current;
      scrollRef.current.scrollTo({
        top:
          WRAPPER_PADDING * scale +
          (page - 1) * (ph + PAGE_GAP) * scale,
        behavior: 'smooth',
      });
      setCurrentPage(page);
    },
    [numPages, scale],
  );

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const toggleBreakPages = useCallback(() => {
    setLoading(true);
    setBreakPages((prev) => !prev);
  }, []);

  const switchSheet = useCallback((idx: number) => {
    setActiveSheet(idx);
    setLoading(true);
  }, []);

  const showToolbar = !loading && !error;

  return (
    <div className="w-full h-[calc(80vh+60px)] rounded-lg overflow-hidden bg-white dark:bg-slate-800/50 flex flex-col relative">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 border-b bg-white dark:bg-slate-900 shrink-0">
          {/* DOCX page navigation */}
          {isDocx && breakPages && numPages > 1 && (
            <>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums min-w-[80px] text-center">
                {currentPage} / {numPages}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
            </>
          )}

          {/* DOCX breakPages toggle */}
          {isDocx && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant={breakPages ? 'default' : 'ghost'}
                    onClick={toggleBreakPages}
                  >
                    {breakPages ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <ScrollText className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {breakPages
                    ? 'Mudar para rolagem contínua'
                    : 'Mudar para visualização por página'}
                </TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-border mx-1" />
            </>
          )}

          {/* Zoom controls */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={zoomIn}
            disabled={scale >= 3.0}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* XLSX Sheet Tabs */}
      {isXlsx && sheetNames.length > 1 && showToolbar && (
        <div className="flex items-center gap-0 px-1 border-b bg-gray-50 dark:bg-slate-800 shrink-0 overflow-x-auto">
          {sheetNames.map((name, idx) => (
            <button
              key={name}
              onClick={() => switchSheet(idx)}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                idx === activeSheet
                  ? 'border-primary text-primary bg-white dark:bg-slate-900'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-auto ${isDocx && breakPages ? 'bg-gray-200 dark:bg-slate-900' : ''}`}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 dark:bg-slate-800/80">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Carregando documento...
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <div
          ref={containerRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className={`office-viewer-container
            [&_.xlsx-preview_table]:w-full
            [&_.xlsx-preview_table]:border-collapse
            [&_.xlsx-preview_table]:text-sm
            [&_.xlsx-preview_td]:border
            [&_.xlsx-preview_td]:border-gray-200
            [&_.xlsx-preview_td]:px-2
            [&_.xlsx-preview_td]:py-1
            [&_.xlsx-preview_td]:text-sm
            [&_.xlsx-preview_th]:border
            [&_.xlsx-preview_th]:border-gray-200
            [&_.xlsx-preview_th]:px-2
            [&_.xlsx-preview_th]:py-1
            [&_.xlsx-preview_th]:text-sm
            [&_.xlsx-preview_th]:bg-green-50
            [&_.xlsx-preview_th]:font-semibold
            [&_.xlsx-preview_th]:text-green-900
            [&_.xlsx-preview_tr:nth-child(even)_td]:bg-gray-50/50
            [&_.xlsx-preview_tr:hover_td]:bg-blue-50/50
            dark:[&_.xlsx-preview_td]:border-slate-600
            dark:[&_.xlsx-preview_th]:border-slate-600
            dark:[&_.xlsx-preview_th]:bg-slate-700
            dark:[&_.xlsx-preview_th]:text-slate-200
            dark:[&_.xlsx-preview_tr:nth-child(even)_td]:bg-slate-800/30
            dark:[&_.xlsx-preview_tr:hover_td]:bg-slate-700/30
          `}
        />
      </div>
    </div>
  );
}
