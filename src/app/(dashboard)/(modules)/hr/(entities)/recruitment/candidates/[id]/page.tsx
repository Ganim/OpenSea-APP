/**
 * OpenSea OS - Candidate Detail Page
 * Página de detalhes do candidato
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
import { Card } from '@/components/ui/card';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { HR_PERMISSIONS } from '@/config/rbac/permission-codes';
import { usePermissions } from '@/hooks/use-permissions';
import { recruitmentService } from '@/services/hr/recruitment.service';
import type { Application } from '@/types/hr';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Edit,
  ExternalLink,
  Globe,
  Linkedin,
  Mail,
  Phone,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  CANDIDATE_SOURCE_LABELS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '../../src';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const candidateId = params.id as string;

  const canModify = hasPermission(HR_PERMISSIONS.RECRUITMENT.MODIFY);
  const canDelete = hasPermission(HR_PERMISSIONS.RECRUITMENT.REMOVE);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: candidate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['candidates', candidateId],
    queryFn: async () => {
      const { candidate } = await recruitmentService.getCandidate(candidateId);
      return candidate;
    },
  });

  const { data: applicationsData } = useQuery({
    queryKey: ['applications', 'candidate', candidateId],
    queryFn: () =>
      recruitmentService.listApplications({ candidateId, perPage: 100 }),
    enabled: !!candidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => recruitmentService.deleteCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidato excluído com sucesso');
      router.push('/hr/recruitment/candidates');
    },
    onError: () => toast.error('Erro ao excluir candidato'),
  });

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Candidatos', href: '/hr/recruitment/candidates' },
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

  if (error || !candidate) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Recrutamento', href: '/hr/recruitment' },
              { label: 'Candidatos', href: '/hr/recruitment/candidates' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Candidato não encontrado"
            message="O candidato solicitado não foi encontrado."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/recruitment/candidates'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  const applications = applicationsData?.applications ?? [];

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Recrutamento', href: '/hr/recruitment' },
            { label: 'Candidatos', href: '/hr/recruitment/candidates' },
            { label: candidate.fullName },
          ]}
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete',
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setIsDeleteOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            ...(canModify
              ? [
                  {
                    id: 'edit',
                    title: 'Editar',
                    icon: Edit,
                    onClick: () =>
                      router.push(
                        `/hr/recruitment/candidates/${candidateId}/edit`
                      ),
                    variant: 'default' as const,
                  },
                ]
              : []),
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-teal-600 text-white">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{candidate.fullName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Criado em{' '}
                {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">
                  {CANDIDATE_SOURCE_LABELS[candidate.source]}
                </Badge>
                {candidate.tags?.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-teal-50 text-teal-700 dark:bg-teal-500/8 dark:text-teal-300 border-0"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mail className="h-4 w-4" />
              <span className="text-xs">E-mail</span>
            </div>
            <p className="text-sm font-medium truncate">{candidate.email}</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Phone className="h-4 w-4" />
              <span className="text-xs">Telefone</span>
            </div>
            <p className="text-sm font-medium">
              {candidate.phone ?? 'Não informado'}
            </p>
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Globe className="h-4 w-4" />
              <span className="text-xs">Currículo</span>
            </div>
            {candidate.resumeUrl ? (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                Ver currículo
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                Não informado
              </p>
            )}
          </Card>

          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Linkedin className="h-4 w-4" />
              <span className="text-xs">LinkedIn</span>
            </div>
            {candidate.linkedinUrl ? (
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                Ver perfil
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                Não informado
              </p>
            )}
          </Card>
        </div>

        {/* Notes */}
        {candidate.notes && (
          <Card className="bg-white dark:bg-slate-800/60 border border-border p-6 mt-6">
            <h3 className="text-sm font-semibold mb-2">Observações</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {candidate.notes}
            </p>
          </Card>
        )}

        {/* Applications */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Candidaturas ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <Card className="bg-white dark:bg-slate-800/60 border border-border p-8 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Este candidato não possui candidaturas
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
                        {app.jobPosting?.title ?? `Vaga ${app.jobPostingId}`}
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
        </div>

        {/* Delete Confirmation */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={() => deleteMutation.mutate()}
          title="Excluir Candidato"
          description={`Digite seu PIN de ação para excluir "${candidate.fullName}". Esta ação não pode ser desfeita.`}
        />
      </PageBody>
    </PageLayout>
  );
}
