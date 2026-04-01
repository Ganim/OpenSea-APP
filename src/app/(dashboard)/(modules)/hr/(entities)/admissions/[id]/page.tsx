'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { InfoField } from '@/components/shared/info-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import type { AdmissionInvite } from '@/types/hr';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  CheckCircle,
  ClipboardList,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Link2,
  PenTool,
  Send,
  User,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  admissionsApi,
  admissionKeys,
  useApproveAdmission,
  useRejectAdmission,
  useResendAdmission,
  getAdmissionStatusLabel,
  getAdmissionStatusColor,
  getContractTypeLabel,
  getWorkRegimeLabel,
  getDocumentTypeLabel,
  getDocumentStatusLabel,
  getDocumentStatusColor,
  getMaritalStatusLabel,
  getRelationshipLabel,
  getBankAccountTypeLabel,
  formatDate,
  formatCurrency,
} from '../src';
import { HR_PERMISSIONS } from '../../../_shared/constants/hr-permissions';

export default function AdmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const admissionId = params.id as string;
  const { hasPermission } = usePermissions();

  const canManage = hasPermission(HR_PERMISSIONS.ONBOARDING.MANAGE);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: admission, isLoading } = useQuery<AdmissionInvite>({
    queryKey: admissionKeys.detail(admissionId),
    queryFn: () => admissionsApi.get(admissionId),
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const approveMutation = useApproveAdmission({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: admissionKeys.detail(admissionId),
      });
    },
  });

  const rejectMutation = useRejectAdmission({
    onSuccess: () => {
      setIsRejectOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({
        queryKey: admissionKeys.detail(admissionId),
      });
    },
  });

  const resendMutation = useResendAdmission();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleApprove = () => {
    if (!admission) return;
    approveMutation.mutate(admission.id);
  };

  const handleReject = () => {
    if (!admission || !rejectionReason.trim()) return;
    rejectMutation.mutate({
      id: admission.id,
      reason: rejectionReason.trim(),
    });
  };

  const handleResend = () => {
    if (!admission) return;
    resendMutation.mutate(admission.id);
  };

  const handleCopyPublicLink = () => {
    if (!admission?.token) return;
    const publicUrl = `${window.location.origin}/admission/${admission.token}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copiado para a área de transferência');
  };

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
              { label: 'Admissões', href: '/hr/admissions' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading />
        </PageBody>
      </PageLayout>
    );
  }

  if (!admission) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Recursos Humanos', href: '/hr' },
              { label: 'Admissões', href: '/hr/admissions' },
              { label: 'Não encontrada' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <div className="text-center py-12 text-muted-foreground">
            Admissão não encontrada.
          </div>
        </PageBody>
      </PageLayout>
    );
  }

  const candidateData = admission.candidateData;
  const documents = admission.documents ?? [];
  const signature = admission.signature;

  const isActive =
    admission.status === 'PENDING' ||
    admission.status === 'IN_PROGRESS' ||
    admission.status === 'COMPLETED';

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Recursos Humanos', href: '/hr' },
            { label: 'Admissões', href: '/hr/admissions' },
            { label: admission.fullName },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {canManage && isActive && admission.status !== 'COMPLETED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-2.5 gap-2"
                  onClick={handleResend}
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden md:inline">Reenviar Convite</span>
                </Button>
              )}
              {canManage &&
                admission.status === 'COMPLETED' &&
                !admission.employeeId && (
                  <Button
                    size="sm"
                    className="h-9 px-2.5 gap-2"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden md:inline">Aprovar</span>
                  </Button>
                )}
            </div>
          }
        />
      </PageHeader>

      <PageBody>
        <div className="space-y-6">
          {/* Identity Card */}
          <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <UserPlus className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold tracking-tight truncate">
                    {admission.fullName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {admission.email}
                    {admission.phone && ` \u2022 ${admission.phone}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Criado em {formatDate(admission.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getAdmissionStatusColor(admission.status)}`}
                >
                  {getAdmissionStatusLabel(admission.status)}
                </span>
              </div>
            </div>
          </Card>

          {/* Public Link */}
          {admission.token && isActive && (
            <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <Link2 className="h-5 w-5 text-foreground" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold">Link Público</h3>
                  <p className="text-sm text-muted-foreground">
                    Link de acesso para o candidato preencher os dados
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm bg-muted/50 rounded-lg px-3 py-2 truncate">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/admission/${admission.token}`}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2.5 gap-2 shrink-0"
                    onClick={handleCopyPublicLink}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Employee link (if completed and approved) */}
          {admission.employeeId && (
            <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Funcionário criado com sucesso
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    {admission.employee?.fullName ??
                      'Ver perfil do funcionário'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2.5"
                  onClick={() =>
                    router.push(`/hr/employees/${admission.employeeId}`)
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver Funcionário
                </Button>
              </div>
            </Card>
          )}

          {/* Onboarding checklist link */}
          {admission.employeeId && (
            <Card className="p-4 bg-sky-50/50 dark:bg-sky-500/5 border-sky-200 dark:border-sky-500/20">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-sky-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                    Checklist de Onboarding gerado automaticamente
                  </p>
                  <p className="text-xs text-sky-600/80 dark:text-sky-400/80">
                    Acompanhe o progresso de integração do novo colaborador
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2.5"
                  onClick={() => router.push('/hr/onboarding')}
                >
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Ver Onboarding
                </Button>
              </div>
            </Card>
          )}

          {/* Rejection reason */}
          {admission.rejectionReason && (
            <Card className="p-4 bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    Motivo da Rejeição
                  </p>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
                    {admission.rejectionReason}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section: Vaga */}
            <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <Briefcase className="h-5 w-5 text-foreground" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold">Vaga</h3>
                  <p className="text-sm text-muted-foreground">
                    Informações sobre o cargo e contrato
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
              <div className="p-4 sm:p-6 space-y-3">
                <InfoField
                  label="Cargo"
                  value={admission.position?.name ?? '-'}
                />
                <InfoField
                  label="Departamento"
                  value={admission.department?.name ?? '-'}
                />
                <InfoField
                  label="Tipo de Contrato"
                  value={getContractTypeLabel(admission.contractType)}
                />
                <InfoField
                  label="Regime de Trabalho"
                  value={getWorkRegimeLabel(admission.workRegime)}
                />
                <InfoField
                  label="Data de Início Prevista"
                  value={formatDate(admission.expectedStartDate)}
                />
                {admission.salary && (
                  <InfoField
                    label="Salário"
                    value={formatCurrency(admission.salary)}
                  />
                )}
                <InfoField
                  label="Expira em"
                  value={formatDate(admission.expiresAt)}
                />
              </div>
            </Card>

            {/* Section: Dados do Candidato */}
            <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <User className="h-5 w-5 text-foreground" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold">
                    Dados do Candidato
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Informações pessoais preenchidas pelo candidato
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
              <div className="p-4 sm:p-6 space-y-3">
                {candidateData ? (
                  <>
                    <InfoField label="Nome" value={candidateData.fullName} />
                    <InfoField label="CPF" value={candidateData.cpf ?? '-'} />
                    {candidateData.rg && (
                      <InfoField label="RG" value={candidateData.rg} />
                    )}
                    <InfoField
                      label="Data de Nascimento"
                      value={formatDate(candidateData.birthDate)}
                    />
                    <InfoField
                      label="Estado Civil"
                      value={getMaritalStatusLabel(candidateData.maritalStatus)}
                    />
                    <InfoField
                      label="Nacionalidade"
                      value={candidateData.nationality}
                    />
                    {candidateData.address && (
                      <InfoField
                        label="Endereço"
                        value={`${candidateData.address.street}, ${candidateData.address.number}${candidateData.address.complement ? ` - ${candidateData.address.complement}` : ''}, ${candidateData.address.neighborhood}, ${candidateData.address.city}/${candidateData.address.state} - ${candidateData.address.zipCode}`}
                      />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Aguardando preenchimento pelo candidato
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Section: Dados Bancários */}
          {candidateData?.bankData && (
            <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <Wallet className="h-5 w-5 text-foreground" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold">Dados Bancários</h3>
                  <p className="text-sm text-muted-foreground">
                    Conta para depósito de salário
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <InfoField
                    label="Banco"
                    value={`${candidateData.bankData.bankCode} - ${candidateData.bankData.bankName}`}
                  />
                  <InfoField
                    label="Agência"
                    value={candidateData.bankData.agency}
                  />
                  <InfoField
                    label="Conta"
                    value={candidateData.bankData.account}
                  />
                  <InfoField
                    label="Tipo"
                    value={getBankAccountTypeLabel(
                      candidateData.bankData.accountType
                    )}
                  />
                  {candidateData.bankData.pixKey && (
                    <InfoField
                      label="Chave PIX"
                      value={candidateData.bankData.pixKey}
                    />
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Section: Dependentes */}
          {candidateData?.dependants && candidateData.dependants.length > 0 && (
            <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <Users className="h-5 w-5 text-foreground" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold">
                    Dependentes ({candidateData.dependants.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dependentes declarados pelo candidato
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {candidateData.dependants.map((dep, idx) => (
                    <div
                      key={dep.id ?? idx}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Nome
                          </span>
                          <p className="font-medium">{dep.fullName}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            CPF
                          </span>
                          <p className="font-medium">{dep.cpf}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Parentesco
                          </span>
                          <p className="font-medium">
                            {getRelationshipLabel(dep.relationship)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Nascimento
                          </span>
                          <p className="font-medium">
                            {formatDate(dep.birthDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Section: Documentos */}
          <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <FileText className="h-5 w-5 text-foreground" />
              <div className="flex-1">
                <h3 className="text-base font-semibold">
                  Documentos ({documents.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Documentos enviados pelo candidato
                </p>
              </div>
            </div>
            <div className="border-b border-border" />
            <div className="p-4 sm:p-6">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {getDocumentTypeLabel(doc.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.fileName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getDocumentStatusColor(doc.status)}`}
                        >
                          {getDocumentStatusLabel(doc.status)}
                        </span>
                        {doc.fileUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum documento enviado ainda
                </p>
              )}
            </div>
          </Card>

          {/* Section: Assinatura Digital */}
          <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <PenTool className="h-5 w-5 text-foreground" />
              <div className="flex-1">
                <h3 className="text-base font-semibold">Assinatura Digital</h3>
                <p className="text-sm text-muted-foreground">
                  Assinatura eletrônica do contrato de admissão
                </p>
              </div>
            </div>
            <div className="border-b border-border" />
            <div className="p-4 sm:p-6">
              {signature ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <InfoField label="Assinante" value={signature.signerName} />
                  <InfoField label="CPF" value={signature.signerCpf} />
                  <InfoField label="E-mail" value={signature.signerEmail} />
                  <InfoField
                    label="Data da Assinatura"
                    value={formatDate(signature.signedAt)}
                  />
                  <InfoField label="IP" value={signature.ipAddress} />
                  <InfoField
                    label="PIN Verificado"
                    value={signature.pinVerified ? 'Sim' : 'Não'}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aguardando assinatura do candidato
                </p>
              )}
            </div>
          </Card>

          {/* Reject section (inline) */}
          {canManage &&
            admission.status === 'COMPLETED' &&
            !admission.employeeId && (
              <Card className="bg-white dark:bg-white/5 border border-border overflow-hidden py-0">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                  <XCircle className="h-5 w-5 text-rose-500" />
                  <div className="flex-1">
                    <h3 className="text-base font-semibold">
                      Rejeitar Admissão
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Informe o motivo para rejeitar esta admissão
                    </p>
                  </div>
                </div>
                <div className="border-b border-border" />
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Motivo da rejeição</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Informe o motivo da rejeição..."
                      rows={3}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-9 px-2.5"
                    onClick={handleReject}
                    disabled={
                      !rejectionReason.trim() || rejectMutation.isPending
                    }
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </Card>
            )}
        </div>
      </PageBody>
    </PageLayout>
  );
}
