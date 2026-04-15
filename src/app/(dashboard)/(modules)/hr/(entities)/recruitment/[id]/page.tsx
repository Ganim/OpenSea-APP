/**
 * OpenSea OS - Job Posting Detail Page
 * Página de detalhes da vaga
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import { recruitmentService } from '@/services/hr/recruitment.service';
import type { Application, InterviewStage } from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUp,
  ArrowDown,
  Briefcase,
  Calendar,
  Edit,
  GripVertical,
  MapPin,
  Plus,
  Send,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  JOB_POSTING_STATUS_LABELS,
  JOB_POSTING_STATUS_COLORS,
  JOB_POSTING_TYPE_LABELS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  APPLICATION_PIPELINE_STAGES,
  INTERVIEW_STAGE_TYPE_LABELS,
  formatSalaryRange,
} from '../src';

export default function JobPostingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const jobPostingId = params.id as string;

  const canModify = hasPermission(HR_PERMISSIONS.RECRUITMENT.MODIFY);
  const canDelete = hasPermission(HR_PERMISSIONS.RECRUITMENT.REMOVE);
  const canAdmin = hasPermission(HR_PERMISSIONS.RECRUITMENT.ADMIN);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('applications');

  // Fetch job posting
  const {
    data: jobPosting,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['job-postings', jobPostingId],
    queryFn: async () => {
      const { jobPosting } =
        await recruitmentService.getJobPosting(jobPostingId);
      return jobPosting;
    },
  });

  // Fetch applications for this job
  const { data: applicationsData } = useQuery({
    queryKey: ['applications', 'job', jobPostingId],
    queryFn: () =>
      recruitmentService.listApplications({ jobPostingId, perPage: 100 }),
    enabled: !!jobPosting,
  });

  // Fetch stages
  const { data: stagesData } = useQuery({
    queryKey: ['interview-stages', jobPostingId],
    queryFn: () => recruitmentService.listInterviewStages(jobPostingId),
    enabled: !!jobPosting,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: () => recruitmentService.deleteJobPosting(jobPostingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Vaga excluída com sucesso');
      router.push('/hr/recruitment');
    },
    onError: () => toast.error('Erro ao excluir vaga'),
  });

  const publishMutation = useMutation({
    mutationFn: () => recruitmentService.publishJobPosting(jobPostingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['job-postings', jobPostingId],
      });
      toast.success('Vaga publicada com sucesso');
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => recruitmentService.closeJobPosting(jobPostingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['job-postings', jobPostingId],
      });
      toast.success('Vaga encerrada com sucesso');
    },
  });

  const deleteStage = useMutation({
    mutationFn: recruitmentService.deleteInterviewStage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['interview-stages', jobPostingId],
      });
      toast.success('Etapa removida');
    },
  });

  const reorderStages = useMutation({
    mutationFn: (stageIds: string[]) =>
      recruitmentService.reorderInterviewStages(jobPostingId, { stageIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['interview-stages', jobPostingId],
      });
    },
  });

  if (isLoading) {
    return (
      <PageLayout data-testid="recruitment-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
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

  if (error || !jobPosting) {
    return (
      <PageLayout data-testid="recruitment-detail-page">
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
            title="Vaga não encontrada"
            message="A vaga solicitada não foi encontrada."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/recruitment'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  const statusColor = JOB_POSTING_STATUS_COLORS[jobPosting.status];
  const applications = applicationsData?.applications ?? [];
  const stages = (stagesData?.interviewStages ?? []).sort(
    (a, b) => a.order - b.order
  );

  // Build action buttons
  const buttons = [];

  if (canAdmin && jobPosting.status === 'DRAFT') {
    buttons.push({
      id: 'publish',
      title: 'Publicar',
      icon: Send,
      onClick: () => publishMutation.mutate(),
      variant: 'outline' as const,
    });
  }

  if (canAdmin && jobPosting.status === 'OPEN') {
    buttons.push({
      id: 'close',
      title: 'Encerrar',
      icon: XCircle,
      onClick: () => closeMutation.mutate(),
      variant: 'outline' as const,
    });
  }

  if (canDelete) {
    buttons.push({
      id: 'delete',
      title: 'Excluir',
      icon: Trash2,
      onClick: () => setIsDeleteOpen(true),
      variant: 'destructive' as const,
    });
  }

  if (canModify) {
    buttons.push({
      id: 'edit',
      title: 'Editar',
      icon: Edit,
      onClick: () => router.push(`/hr/recruitment/${jobPostingId}/edit`),
      variant: 'default' as const,
    });
  }

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStages.length) return;
    [newStages[index], newStages[targetIndex]] = [
      newStages[targetIndex],
      newStages[index],
    ];
    reorderStages.mutate(newStages.map(s => s.id));
  };

  return (
    <PageLayout data-testid="recruitment-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Recrutamento', href: '/hr/recruitment' },
            { label: jobPosting.title },
          ]}
          buttons={buttons}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-600 text-white">
              <Briefcase className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{jobPosting.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Criado em{' '}
                {new Date(jobPosting.createdAt).toLocaleDateString('pt-BR')}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  variant={statusColor.variant}
                  className={`${statusColor.bg} ${statusColor.text} border-0`}
                >
                  {JOB_POSTING_STATUS_LABELS[jobPosting.status]}
                </Badge>
                <Badge variant="outline">
                  {JOB_POSTING_TYPE_LABELS[jobPosting.type]}
                </Badge>
                {jobPosting.location && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {jobPosting.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Candidaturas</span>
            </div>
            <p className="text-lg font-semibold">{applications.length}</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs">Etapas</span>
            </div>
            <p className="text-lg font-semibold">{stages.length}</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Salário</span>
            </div>
            <p className="text-sm font-medium">
              {formatSalaryRange(jobPosting.salaryMin, jobPosting.salaryMax)}
            </p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Publicada em</span>
            </div>
            <p className="text-sm font-medium">
              {jobPosting.publishedAt
                ? new Date(jobPosting.publishedAt).toLocaleDateString('pt-BR')
                : 'Não publicada'}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 h-12 mb-4">
            <TabsTrigger value="applications">Candidaturas</TabsTrigger>
            <TabsTrigger value="stages">Etapas</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            {/* Pipeline visualization */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
              {APPLICATION_PIPELINE_STAGES.map(status => {
                const count = applications.filter(
                  a => a.status === status
                ).length;
                const colors = APPLICATION_STATUS_COLORS[status];
                return (
                  <div
                    key={status}
                    className={`flex-1 min-w-[100px] rounded-lg p-3 text-center ${colors.bg}`}
                  >
                    <p className={`text-xs font-medium ${colors.text}`}>
                      {APPLICATION_STATUS_LABELS[status]}
                    </p>
                    <p className={`text-xl font-bold ${colors.text}`}>
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>

            {applications.length === 0 ? (
              <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma candidatura para esta vaga
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {applications.map((app: Application) => {
                  const statusColors = APPLICATION_STATUS_COLORS[app.status];
                  return (
                    <Card
                      key={app.id}
                      className="bg-white dark:bg-slate-800/60 border border-border p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        router.push(`/hr/recruitment/applications/${app.id}`)
                      }
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {app.candidate?.fullName ??
                            `Candidato ${app.candidateId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Candidatura em{' '}
                          {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${statusColors.bg} ${statusColors.text} border-0`}
                      >
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </Badge>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Stages Tab */}
          <TabsContent value="stages">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stages.length} etapa{stages.length !== 1 ? 's' : ''}{' '}
                configurada{stages.length !== 1 ? 's' : ''}
              </h3>
              {canAdmin && (
                <Button
                  size="sm"
                  className="h-9 px-2.5"
                  onClick={() =>
                    router.push(
                      `/hr/recruitment/${jobPostingId}/edit?tab=stages`
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Etapa
                </Button>
              )}
            </div>

            {stages.length === 0 ? (
              <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
                <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma etapa configurada para esta vaga
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {stages.map((stage: InterviewStage, index: number) => (
                  <Card
                    key={stage.id}
                    className="bg-white dark:bg-slate-800/60 border border-border p-4 flex items-center gap-3"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium">{stage.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {INTERVIEW_STAGE_TYPE_LABELS[stage.type]}
                        </Badge>
                      </div>
                      {stage.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-8">
                          {stage.description}
                        </p>
                      )}
                    </div>
                    {canAdmin && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={index === 0}
                          onClick={() => handleMoveStage(index, 'up')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={index === stages.length - 1}
                          onClick={() => handleMoveStage(index, 'down')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
                          onClick={() => deleteStage.mutate(stage.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="space-y-6">
              {jobPosting.description && (
                <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
                  <h3 className="text-sm font-semibold mb-2">Descrição</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {jobPosting.description}
                  </p>
                </Card>
              )}

              {jobPosting.benefits && (
                <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
                  <h3 className="text-sm font-semibold mb-2">Benefícios</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {jobPosting.benefits}
                  </p>
                </Card>
              )}

              {jobPosting.requirements && (
                <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
                  <h3 className="text-sm font-semibold mb-2">Requisitos</h3>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(jobPosting.requirements, null, 2)}
                  </pre>
                </Card>
              )}

              <Card className="bg-white dark:bg-slate-800/60 border border-border p-6">
                <h3 className="text-sm font-semibold mb-3">Informações</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Departamento</span>
                    <p className="font-medium">
                      {jobPosting.department?.name ?? 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cargo</span>
                    <p className="font-medium">
                      {jobPosting.position?.name ?? 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Máximo de candidatos
                    </span>
                    <p className="font-medium">
                      {jobPosting.maxApplicants ?? 'Sem limite'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Encerrada em</span>
                    <p className="font-medium">
                      {jobPosting.closedAt
                        ? new Date(jobPosting.closedAt).toLocaleDateString(
                            'pt-BR'
                          )
                        : 'Em aberto'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => deleteMutation.mutate()}
          title="Excluir Vaga"
          description={`Digite seu PIN de ação para excluir "${jobPosting.title}". Esta ação não pode ser desfeita.`}
        />
      </PageBody>
    </PageLayout>
  );
}
