import {
  financeReportsService,
  type ExportFormat,
  type ReportType,
} from '@/services/finance/finance-reports.service';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const QUERY_KEYS = {
  DRE: ['finance-dre-interactive'],
} as const;

export function useInteractiveDRE(params: {
  startDate: string;
  endDate: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.DRE, params],
    queryFn: () => financeReportsService.getInteractiveDRE(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async (params: {
      reportType: ReportType;
      format: ExportFormat;
      startDate: string;
      endDate: string;
    }) => {
      const blob = await financeReportsService.exportReport(params);
      const ext = params.format.toLowerCase();
      const fileName = `relatorio_${params.reportType.toLowerCase()}.${ext}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Relatorio exportado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao exportar relatorio');
    },
  });
}
