'use client';

/**
 * Test Print Modal
 * Renders a label template with mock data and allows printing via iframe.
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LabelStudioTemplate } from '@/core/print-queue/editor';
import { buildSamplePreviewData } from '@/core/print-queue/editor';
import { Printer } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import { StudioLabelRenderer } from './studio-label-renderer';

interface TestPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: LabelStudioTemplate;
}

export function TestPrintModal({
  open,
  onOpenChange,
  template,
}: TestPrintModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const previewData = useMemo(() => buildSamplePreviewData(), []);

  const handlePrint = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const html = el.innerHTML;
    const widthMm = template.width;
    const heightMm = template.height;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page {
              size: ${widthMm}mm ${heightMm}mm;
              margin: 0;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: ${widthMm}mm;
              height: ${heightMm}mm;
            }
            .label-container {
              width: ${widthMm}mm;
              height: ${heightMm}mm;
              position: relative;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="label-container">${html}</div>
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };

    // Fallback for already loaded iframes
    if (iframe.contentDocument?.readyState === 'complete') {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    }
  }, [template.width, template.height]);

  // Calculate scale to fit preview in modal (max ~400px wide)
  const previewScale = Math.min(400 / (template.width * 3.7795), 3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Imprimir Etiqueta de Teste</DialogTitle>
          <DialogDescription>
            Preview com dados fictícios. Use para validar o layout antes de
            imprimir com dados reais.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div
            ref={previewRef}
            className="border border-dashed border-slate-300 dark:border-slate-600 rounded"
          >
            <StudioLabelRenderer
              template={template}
              previewData={previewData}
              scale={previewScale}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {template.width}mm x {template.height}mm
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
