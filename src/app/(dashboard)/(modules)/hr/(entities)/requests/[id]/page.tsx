/**
 * HR Request Detail Page
 * Detalhes da solicitação
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { InfoField } from '@/components/shared/info-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { portalService } from '@/services/hr';
import type { EmployeeRequest, RequestType, RequestStatus } from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  PalmtreeIcon,
  Send,
  UserCog,
  X,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  VACATION: 'Férias',
  ABSENCE: 'Ausência',
  ADVANCE: 'Adiantamento',
  DATA_CHANGE: 'Alteração de Dados',
  SUPPORT: 'Suporte',
};

const REQUEST_TYPE_ICONS: Record<RequestType, LucideIcon> = {
  VACATION: PalmtreeIcon,
  ABSENCE: Calendar,
  ADVANCE: FileText,
  DATA_CHANGE: UserCog,
  SUPPORT: Send,
};

const REQUEST_TYPE_GRADIENTS: Record<RequestType, string> = {
  VACATION: 'from-green-500 to-green-600',
  ABSENCE: 'from-rose-500 to-rose-600',
  ADVANCE: 'from-amber-500 to-amber-600',
  DATA_CHANGE: 'from-blue-500 to-blue-600',
  SUPPORT: 'from-violet-500 to-violet-600',
};

const STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  PENDING: { label: 'Pendente', variant: 'outline' },
  APPROVED: { label: 'Aprovada', variant: 'default' },
  REJECTED: { label: 'Rejeitada', variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' },
};

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const requestId = params.id as string;

  const canApprove = hasPermission(HR_PERMISSIONS.EMPLOYEES.MANAGE);

  const [actionTarget, setActionTarget] = useState<'approve' | 'reject' | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState('');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['hr-pending-requests'],
    queryFn: async () => {
      const response = await portalService.listPendingApprovals({
        perPage: 100,
      });
      return response.requests;
    },
  });

  const request = requestsData?.find(
    (r: EmployeeRequest) => r.id === requestId
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const approveMutation = useMutation({
    mutationFn: (id: string) => portalService.approveRequest(id),
    onSuccess: () => {
      toast.success('Solicitação aprovada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['hr-pending-requests'] });
      router.push('/hr/requests');
    },
    onError: () => {
      toast.error('Erro ao aprovar solicitação');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      portalService.rejectRequest(id, reason),
    onSuccess: () => {
      toast.success('Solicitação rejeitada');
      queryClient.invalidateQueries({ queryKey: ['hr-pending-requests'] });
      router.push('/hr/requests');
    },
    onError: () => {
      toast.error('Erro ao rejeitar solicitação');
    },
  });

  const handleAction = useCallback(() => {
    if (!actionTarget || !request) return;

    if (actionTarget === 'approve') {
      approveMutation.mutate(request.id);
    } else {
      if (!rejectionReason.trim()) {
        toast.error('Informe o motivo da rejeição');
        return;
      }
      rejectMutation.mutate({
        id: request.id,
        reason: rejectionReason.trim(),
      });
    }
  }, [actionTarget, request, rejectionReason, approveMutation, rejectMutation]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Recursos Humanos', href: '/hr' },
              { label: 'Solicitações', href: '/hr/requests' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!request) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Recursos Humanos', href: '/hr' },
              { label: 'Solicitações', href: '/hr/requests' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Solicitação não encontrada
            </h2>
            <Button onClick={() => router.push('/hr/requests')}>
              Voltar para Solicitações
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  const typeLabel = REQUEST_TYPE_LABELS[request.type];
  const TypeIcon = REQUEST_TYPE_ICONS[request.type];
  const gradient = REQUEST_TYPE_GRADIENTS[request.type];
  const statusConfig = STATUS_CONFIG[request.status];

  // Render request data fields
  const dataEntries = Object.entries(request.data || {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );

  // ============================================================================
  // ACTION BUTTONS
  // ============================================================================

  const actionButtons = [];
  if (canApprove && request.status === 'PENDING') {
    actionButtons.push({
      id: 'reject',
      title: 'Rejeitar',
      icon: X,
      onClick: () => setActionTarget('reject'),
      variant: 'outline' as const,
    });
    actionButtons.push({
      id: 'approve',
      title: 'Aprovar',
      icon: Check,
      onClick: () => setActionTarget('approve'),
    });
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Recursos Humanos', href: '/hr' },
            { label: 'Solicitações', href: '/hr/requests' },
            { label: typeLabel },
          ]}
          buttons={actionButtons}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br ${gradient}`}
            >
              <TypeIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {typeLabel}
                </h1>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {request.employee && (
                  <span>
                    {request.employee.fullName}
                    {request.employee.department
                      ? ` - ${request.employee.department.name}`
                      : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>
                  {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {request.approvedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>
                    {new Date(request.approvedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Detalhes */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <ClipboardList className="h-5 w-5" />
            Detalhes da Solicitação
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <InfoField label="Tipo" value={typeLabel} />
            <InfoField
              label="Status"
              value={statusConfig.label}
              badge={
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              }
            />
            {request.employee && (
              <InfoField
                label="Colaborador"
                value={request.employee.fullName}
              />
            )}
            {request.employee?.department && (
              <InfoField
                label="Departamento"
                value={request.employee.department.name}
              />
            )}
            <InfoField
              label="Data da Solicitação"
              value={new Date(request.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            />
            {request.approverEmployee && (
              <InfoField
                label="Aprovador"
                value={request.approverEmployee.fullName}
              />
            )}
          </div>
          {request.rejectionReason && (
            <div className="mt-4 p-4 rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">
                Motivo da Rejeição
              </p>
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {request.rejectionReason}
              </p>
            </div>
          )}
        </Card>

        {/* Dados da Solicitação */}
        {dataEntries.length > 0 && (
          <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
              <FileText className="h-5 w-5" />
              Dados Adicionais
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {dataEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </PageBody>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={!!actionTarget}
        onOpenChange={v => {
          if (!v) {
            setActionTarget(null);
            setRejectionReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionTarget === 'approve'
                ? 'Aprovar Solicitação'
                : 'Rejeitar Solicitação'}
            </DialogTitle>
            <DialogDescription>
              {actionTarget === 'approve'
                ? `Confirma a aprovação da solicitação de ${typeLabel}?`
                : 'Informe o motivo da rejeição.'}
            </DialogDescription>
          </DialogHeader>

          {actionTarget === 'reject' && (
            <div className="space-y-2 py-2">
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionTarget(null);
                setRejectionReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={actionTarget === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {(approveMutation.isPending || rejectMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              )}
              {actionTarget === 'approve' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Confirmar Aprovação
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Confirmar Rejeição
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
