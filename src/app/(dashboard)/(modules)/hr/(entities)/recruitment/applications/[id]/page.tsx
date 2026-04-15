/**
 * OpenSea OS - Application Detail Page
 * Página de detalhes da candidatura
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import { recruitmentService } from '@/services/hr/recruitment.service';
import type { Interview } from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  User,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  APPLICATION_PIPELINE_STAGES,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_STATUS_COLORS,
  INTERVIEW_RECOMMENDATION_LABELS,
  INTERVIEW_RECOMMENDATION_COLORS,
} from '../../src';
import { ScheduleInterviewModal } from '../../src/modals/schedule-interview-modal';
import { CompleteInterviewModal } from '../../src/modals/complete-interview-modal';
import { RejectApplicationModal } from '../../src/modals/reject-application-modal';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const applicationId = params.id as string;

  const canAdmin = hasPermission(HR_PERMISSIONS.RECRUITMENT.ADMIN);
  const canModify = hasPermission(HR_PERMISSIONS.RECRUITMENT.MODIFY);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [completingInterviewId, setCompletingInterviewId] = useState<
    string | null
  >(null);

  // Fetch application
  const {
    data: application,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['applications', applicationId],
    queryFn: async () => {
      const { application } =
        await recruitmentService.getApplication(applicationId);
      return application;
    },
  });

  // Fetch interviews for this application
  const { data: interviewsData } = useQuery({
    queryKey: ['interviews', 'application', applicationId],
    queryFn: () =>
      recruitmentService.listInterviews({ applicationId, perPage: 100 }),
    enabled: !!application,
  });

  // Fetch stages for the job posting
  const { data: stagesData } = useQuery({
    queryKey: ['interview-stages', application?.jobPostingId],
    queryFn: () =>
      recruitmentService.listInterviewStages(application!.jobPostingId),
    enabled: !!application?.jobPostingId,
  });

  // Fetch employees for interviewer selection
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'interviewers'],
    queryFn: async () => {
      const { employeesService } = await import(
        '@/services/hr/employees.service'
      );
      return employeesService.listEmployees({ perPage: 100 });
    },
    enabled: isScheduleOpen,
  });

  // Mutations
  const hireMutation = useMutation({
    mutationFn: () => recruitmentService.hireApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Candidato contratado com sucesso');
    },
    onError: () => toast.error('Erro ao contratar candidato'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason?: string) =>
      recruitmentService.rejectApplication(applicationId, {
        rejectionReason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Candidatura rejeitada');
    },
    onError: () => toast.error('Erro ao rejeitar candidatura'),
  });

  const advanceMutation = useMutation({
    mutationFn: () => {
      // Find next stage in pipeline
      const stages = APPLICATION_PIPELINE_STAGES;
      const currentIndex = stages.indexOf(application!.status);
      const nextStatus =
        currentIndex < stages.length - 1
          ? stages[currentIndex + 1]
          : application!.status;
      return recruitmentService.updateApplicationStatus(applicationId, {
        status: nextStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Candidatura avançada para a próxima etapa');
    },
    onError: () => toast.error('Erro ao avançar candidatura'),
  });

  const scheduleInterview = useMutation({
    mutationFn: recruitmentService.scheduleInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['interviews', 'application', applicationId],
      });
      toast.success('Entrevista agendada com sucesso');
    },
    onError: () => toast.error('Erro ao agendar entrevista'),
  });

  const completeInterview = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof recruitmentService.completeInterview>[1];
    }) => recruitmentService.completeInterview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['interviews', 'application', applicationId],
      });
      toast.success('Entrevista concluída');
    },
    onError: () => toast.error('Erro ao concluir entrevista'),
  });

  const cancelInterview = useMutation({
    mutationFn: recruitmentService.cancelInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['interviews', 'application', applicationId],
      });
      toast.success('Entrevista cancelada');
    },
  });

  if (isLoading) {
    return (
      <PageLayout data-testid="recruitment-application-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Candidatura' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !application) {
    return (
      <PageLayout data-testid="recruitment-application-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Candidatura não encontrada"
            message="A candidatura solicitada não foi encontrada."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/recruitment'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  const interviews = interviewsData?.interviews ?? [];
  const stages = (stagesData?.interviewStages ?? []).sort(
    (a, b) => a.order - b.order
  );
  const statusColors = APPLICATION_STATUS_COLORS[application.status];
  const interviewers = (employeesData?.employees ?? []).map(
    (e: { id: string; fullName: string }) => ({
      id: e.id,
      fullName: e.fullName,
    })
  );

  const isTerminal = ['HIRED', 'REJECTED', 'WITHDRAWN'].includes(
    application.status
  );

  // Build action buttons
  const buttons = [];

  if (canAdmin && !isTerminal) {
    buttons.push({
      id: 'schedule',
      title: 'Agendar Entrevista',
      icon: Calendar,
      onClick: () => setIsScheduleOpen(true),
      variant: 'outline' as const,
    });
    buttons.push({
      id: 'advance',
      title: 'Avançar Etapa',
      icon: ArrowRight,
      onClick: () => advanceMutation.mutate(),
      variant: 'outline' as const,
      disabled: advanceMutation.isPending,
    });
    buttons.push({
      id: 'reject',
      title: 'Rejeitar',
      icon: XCircle,
      onClick: () => setIsRejectOpen(true),
      variant: 'destructive' as const,
    });
    buttons.push({
      id: 'hire',
      title: 'Contratar',
      icon: CheckCircle2,
      onClick: () => hireMutation.mutate(),
      variant: 'default' as const,
      disabled: hireMutation.isPending,
    });
  }

  return (
    <PageLayout data-testid="recruitment-application-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Recrutamento', href: '/hr/recruitment' },
            {
              label: application.jobPosting?.title ?? 'Vaga',
              href: `/hr/recruitment/${application.jobPostingId}`,
            },
            { label: 'Candidatura' },
          ]}
          buttons={buttons}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-600 text-white">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {application.candidate?.fullName ??
                  `Candidato ${application.candidateId}`}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {application.jobPosting?.title ??
                  `Vaga ${application.jobPostingId}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  variant="outline"
                  className={`${statusColors.bg} ${statusColors.text} border-0`}
                >
                  {APPLICATION_STATUS_LABELS[application.status]}
                </Badge>
                {application.currentStage && (
                  <Badge variant="outline">
                    Etapa: {application.currentStage.name}
                  </Badge>
                )}
                {application.rating && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3" />
                    {application.rating}/5
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Pipeline Visualization */}
        <div className="flex gap-1 mt-6 overflow-x-auto pb-2">
          {APPLICATION_PIPELINE_STAGES.map(status => {
            const isActive = application.status === status;
            const isPassed =
              APPLICATION_PIPELINE_STAGES.indexOf(application.status) >
              APPLICATION_PIPELINE_STAGES.indexOf(status);
            const colors = APPLICATION_STATUS_COLORS[status];
            return (
              <div
                key={status}
                className={`flex-1 min-w-[80px] rounded-lg p-2 text-center transition-all ${
                  isActive
                    ? `${colors.bg} ring-2 ring-offset-1 ring-violet-500`
                    : isPassed
                      ? `${colors.bg} opacity-60`
                      : 'bg-muted'
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isActive || isPassed ? colors.text : 'text-muted-foreground'
                  }`}
                >
                  {APPLICATION_STATUS_LABELS[status]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Candidatura</span>
            </div>
            <p className="text-sm font-medium">
              {new Date(application.appliedAt).toLocaleDateString('pt-BR')}
            </p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs">Entrevistas</span>
            </div>
            <p className="text-lg font-semibold">{interviews.length}</p>
          </Card>

          {application.hiredAt && (
            <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">Contratado em</span>
              </div>
              <p className="text-sm font-medium">
                {new Date(application.hiredAt).toLocaleDateString('pt-BR')}
              </p>
            </Card>
          )}

          {application.rejectedAt && (
            <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <XCircle className="h-4 w-4" />
                <span className="text-xs">Rejeitado em</span>
              </div>
              <p className="text-sm font-medium">
                {new Date(application.rejectedAt).toLocaleDateString('pt-BR')}
              </p>
            </Card>
          )}
        </div>

        {/* Rejection Reason */}
        {application.rejectionReason && (
          <Card className="bg-white dark:bg-slate-800/60 border border-border p-6 mt-6">
            <h3 className="text-sm font-semibold mb-2">Motivo da Rejeição</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {application.rejectionReason}
            </p>
          </Card>
        )}

        {/* Interviews */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Entrevistas ({interviews.length})
            </h2>
            {canAdmin && !isTerminal && (
              <Button
                size="sm"
                className="h-9 px-2.5"
                onClick={() => setIsScheduleOpen(true)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Agendar
              </Button>
            )}
          </div>

          {interviews.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma entrevista agendada
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {interviews.map((interview: Interview) => {
                const ivStatusColors =
                  INTERVIEW_STATUS_COLORS[interview.status];
                return (
                  <Card
                    key={interview.id}
                    className="bg-white dark:bg-slate-800/60 border border-border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${ivStatusColors.bg} ${ivStatusColors.text} border-0`}
                        >
                          {INTERVIEW_STATUS_LABELS[interview.status]}
                        </Badge>
                        {interview.interviewStage && (
                          <span className="text-xs text-muted-foreground">
                            {interview.interviewStage.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {interview.status === 'SCHEDULED' && canAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                setCompletingInterviewId(interview.id);
                                setIsCompleteOpen(true);
                              }}
                            >
                              Concluir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-rose-600"
                              onClick={() =>
                                cancelInterview.mutate(interview.id)
                              }
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(interview.scheduledAt).toLocaleDateString(
                          'pt-BR'
                        )}{' '}
                        {new Date(interview.scheduledAt).toLocaleTimeString(
                          'pt-BR',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {interview.duration} min
                      </div>
                      {interview.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {interview.location}
                        </div>
                      )}
                      {interview.interviewer && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          {interview.interviewer.fullName}
                        </div>
                      )}
                    </div>

                    {/* Feedback section (completed interviews) */}
                    {interview.status === 'COMPLETED' && interview.feedback && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">
                          Feedback:
                        </p>
                        <p className="text-sm">{interview.feedback}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {interview.rating && (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star
                                  key={n}
                                  className={`h-4 w-4 ${
                                    n <= interview.rating!
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {interview.recommendation && (
                            <Badge
                              variant="outline"
                              className={`${INTERVIEW_RECOMMENDATION_COLORS[interview.recommendation].bg} ${INTERVIEW_RECOMMENDATION_COLORS[interview.recommendation].text} border-0`}
                            >
                              {
                                INTERVIEW_RECOMMENDATION_LABELS[
                                  interview.recommendation
                                ]
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule Interview Modal */}
        <ScheduleInterviewModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          isSubmitting={scheduleInterview.isPending}
          onSubmit={async data => {
            await scheduleInterview.mutateAsync(data);
          }}
          applicationId={applicationId}
          stages={stages}
          interviewers={interviewers}
        />

        {/* Complete Interview Modal */}
        <CompleteInterviewModal
          isOpen={isCompleteOpen}
          onClose={() => {
            setIsCompleteOpen(false);
            setCompletingInterviewId(null);
          }}
          isSubmitting={completeInterview.isPending}
          onSubmit={async data => {
            if (completingInterviewId) {
              await completeInterview.mutateAsync({
                id: completingInterviewId,
                data,
              });
            }
          }}
        />

        {/* Reject Application Modal */}
        <RejectApplicationModal
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          isSubmitting={rejectMutation.isPending}
          onSubmit={async reason => {
            await rejectMutation.mutateAsync(reason);
          }}
          candidateName={application.candidate?.fullName}
        />
      </PageBody>
    </PageLayout>
  );
}
