'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useExportReport } from '@/hooks/finance/use-reports';
import type {
  ExportFormat,
  ReportType,
} from '@/services/finance/finance-reports.service';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface ExportMenuProps {
  reportType: ReportType;
  startDate: string;
  endDate: string;
}

const FORMAT_OPTIONS: { format: ExportFormat; label: string; icon: React.ElementType }[] = [
  { format: 'CSV', label: 'CSV', icon: FileSpreadsheet },
  { format: 'PDF', label: 'PDF', icon: FileText },
  { format: 'XLSX', label: 'Excel (XLSX)', icon: FileSpreadsheet },
  { format: 'DOCX', label: 'Word (DOCX)', icon: FileText },
];

export function ExportMenu({ reportType, startDate, endDate }: ExportMenuProps) {
  const { mutate: exportReport, isPending } = useExportReport();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FORMAT_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.format}
            onClick={() =>
              exportReport({ reportType, format: opt.format, startDate, endDate })
            }
          >
            <opt.icon className="h-4 w-4 mr-2" />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
