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
import { usePermissions } from '@/hooks/use-permissions';
import type { SafetyProgram, WorkplaceRisk } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Shield,
  ShieldCheck,
  Trash,
  Zap,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { safetyProgramsService } from '@/services/hr/safety-programs.service';
import { workplaceRisksService } from '@/services/hr/workplace-risks.service';
import {
  workplaceRiskKeys,
  getRiskCategoryLabel,
  getRiskSeverityLabel,
  getRiskSeverityVariant,
  getRiskCategoryVariant,
  getRiskSeverityColor,
  formatDate,
} from '../src';
import { safetyProgramKeys } from '../../safety-programs/src';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';

export default function WorkplaceRiskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const riskId = params.id as string;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { hasPermission } = usePermissions();
  const canDelete = hasPermission(HR_PERMISSIONS.WORKPLACE_RISKS.DELETE);

  // ============================================================================
  // DATA FETCHING
  // We need to find the risk across all programs since we only have riskId
  // ============================================================================

  const { data: riskData, isLoading } = useQuery<{
    risk: WorkplaceRisk;
    program: SafetyProgram;
  } | null>({
    queryKey: workplaceRiskKeys.detail(riskId),
    queryFn: async () => {
      // Fetch all programs, then search for the risk in each
      const programsResponse = await safetyProgramsService.list({
        perPage: 100,
      });
      const programs = programsResponse.safetyPrograms ?? [];

      for (const program of programs) {
        const risksResponse = await safetyProgramsService.listRisks(program.id);
        const risks = risksResponse.risks ?? [];
        const found = risks.find(r => r.id === riskId);
        if (found) {
          return { risk: found, program };
        }
      }

      return null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const risk = riskData?.risk;
  const program = riskData?.program;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDelete = useCallback(async () => {
    if (!risk || !program) return;
    await workplaceRisksService.delete(program.id, risk.id);
    queryClient.invalidateQueries({ queryKey: workplaceRiskKeys.lists() });
    queryClient.invalidateQueries({
      queryKey: safetyProgramKeys.risks(program.id),
    });
    setIsDeleteModalOpen(false);
    router.push('/hr/workplace-risks');
  }, [risk, program, queryClient, router]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Riscos Ocupacionais', href: '/hr/workplace-risks' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!risk || !program) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Riscos Ocupacionais', href: '/hr/workplace-risks' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Risco não encontrado
            </h2>
            <Button onClick={() => router.push('/hr/workplace-risks')}>
              Voltar para Riscos
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Riscos Ocupacionais', href: '/hr/workplace-risks' },
            { label: risk.name },
          ]}
          buttons={
            canDelete
              ? [
                  {
                    id: 'delete',
                    title: 'Excluir',
                    icon: Trash,
                    onClick: () => setIsDeleteModalOpen(true),
                    variant: 'outline',
                  },
                ]
              : []
          }
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-amber-500 to-orange-600">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {risk.name}
                </h1>
                <Badge variant={getRiskCategoryVariant(risk.category)}>
                  {getRiskCategoryLabel(risk.category)}
                </Badge>
                <Badge variant={getRiskSeverityVariant(risk.severity)}>
                  {getRiskSeverityLabel(risk.severity)}
                </Badge>
                {!risk.isActive && <Badge variant="outline">Inativo</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Programa: {program.name} ({program.type})
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {risk.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span>{formatDate(risk.createdAt)}</span>
                </div>
              )}
              {risk.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{formatDate(risk.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Informações do Risco */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <AlertTriangle className="h-5 w-5" />
            Informações do Risco
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField
              label="Categoria"
              value={getRiskCategoryLabel(risk.category)}
              badge={
                <Badge variant={getRiskCategoryVariant(risk.category)}>
                  {getRiskCategoryLabel(risk.category)}
                </Badge>
              }
            />
            <InfoField
              label="Severidade"
              value={getRiskSeverityLabel(risk.severity)}
              badge={
                <Badge variant={getRiskSeverityVariant(risk.severity)}>
                  {getRiskSeverityLabel(risk.severity)}
                </Badge>
              }
            />
            <InfoField
              label="Fonte do Risco"
              value={risk.source || 'Não informado'}
              icon={<Zap className="h-4 w-4" />}
            />
            <InfoField
              label="Área Afetada"
              value={risk.affectedArea || 'Não informado'}
              icon={<MapPin className="h-4 w-4" />}
            />
            <InfoField
              label="Status"
              value={risk.isActive ? 'Ativo' : 'Inativo'}
              badge={
                <Badge variant={risk.isActive ? 'default' : 'outline'}>
                  {risk.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              }
            />
          </div>
        </Card>

        {/* Medidas de Controle */}
        {risk.controlMeasures && (
          <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
              <Shield className="h-5 w-5" />
              Medidas de Controle
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {risk.controlMeasures}
            </p>
          </Card>
        )}

        {/* EPI Necessário */}
        {risk.epiRequired && (
          <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
              <ShieldCheck className="h-5 w-5" />
              EPI Necessário
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {risk.epiRequired}
            </p>
          </Card>
        )}

        {/* Programa Vinculado */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <ShieldCheck className="h-5 w-5" />
            Programa de Segurança Vinculado
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField label="Programa" value={program.name} />
            <InfoField label="Tipo" value={program.type} />
            <InfoField label="Responsável" value={program.responsibleName} />
            <InfoField label="Status" value={program.status} />
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/hr/safety-programs/${program.id}`)}
            >
              Ver Programa Completo
            </Button>
          </div>
        </Card>

        {/* Metadados */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
            <Clock className="h-5 w-5" />
            Metadados
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField label="Criado em" value={formatDate(risk.createdAt)} />
            <InfoField
              label="Atualizado em"
              value={formatDate(risk.updatedAt)}
            />
          </div>
        </Card>
      </PageBody>

      {/* Delete PIN Modal */}
      <VerifyActionPinModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDelete}
        title="Excluir Risco Ocupacional"
        description={`Digite seu PIN de ação para excluir o risco "${risk.name}". Esta ação não pode ser desfeita.`}
      />
    </PageLayout>
  );
}
