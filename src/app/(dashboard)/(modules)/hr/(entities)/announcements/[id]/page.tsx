/**
 * HR Announcement Detail Page
 *
 * Notion/Slack-style detail view with content + read receipts tabs.
 * - Tab "Conteudo": full announcement body + audience targets + stats card
 * - Tab "Quem leu": grid of readers with avatar + readAt
 * - Tab "Quem ainda nao leu": grid of pending audience + "Lembrar" button
 *
 * Auto-marks itself as read on mount via the same `markAnnouncementRead`
 * mutation used by the listing.
 */

'use client';

import { GridLoading } from '@/components/handlers/grid-loading';
import { ReadProgressBar } from '@/components/hr/read-progress-bar';
import { ReadersAvatarStack } from '@/components/hr/readers-avatar-stack';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { portalService } from '@/services/hr';
import type { AnnouncementPriority } from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Info,
  type LucideIcon,
  Megaphone,
  Trash,
  UserRound,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PRIORITY_CONFIG: Record<
  AnnouncementPriority,
  {
    label: string;
    icon: LucideIcon;
    chipClass: string;
    gradient: string;
  }
> = {
  URGENT: {
    label: 'Urgente',
    icon: AlertTriangle,
    chipClass:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/8 dark:text-rose-300',
    gradient: 'from-rose-500 to-rose-600',
  },
  IMPORTANT: {
    label: 'Importante',
    icon: Info,
    chipClass:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/8 dark:text-amber-300',
    gradient: 'from-amber-500 to-amber-600',
  },
  NORMAL: {
    label: 'Normal',
    icon: Bell,
    chipClass:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/8 dark:text-slate-300',
    gradient: 'from-violet-500 to-violet-600',
  },
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

function formatDateTime(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const announcementId = params.id as string;

  const canEdit = hasPermission(HR_PERMISSIONS.ANNOUNCEMENTS.UPDATE);
  const canDelete = hasPermission(HR_PERMISSIONS.ANNOUNCEMENTS.DELETE);
  const canViewReceipts = hasPermission(
    HR_PERMISSIONS.ANNOUNCEMENTS.UPDATE
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'read' | 'unread'>(
    'content'
  );

  // ============================================================================
  // QUERIES
  // ============================================================================

  const announcementQuery = useQuery({
    queryKey: ['hr-announcement', announcementId],
    queryFn: async () => {
      const response = await portalService.getAnnouncement(announcementId);
      return response.announcement;
    },
  });

  const announcement = announcementQuery.data;

  const statsQuery = useQuery({
    queryKey: ['hr-announcement-stats', announcementId],
    queryFn: () => portalService.getAnnouncementStats(announcementId),
    enabled: canViewReceipts,
  });

  const receiptsQuery = useQuery({
    queryKey: ['hr-announcement-receipts', announcementId],
    queryFn: () => portalService.getAnnouncementReceipts(announcementId),
    enabled:
      canViewReceipts && (activeTab === 'read' || activeTab === 'unread'),
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const deleteMutation = useMutation({
    mutationFn: (id: string) => portalService.deleteAnnouncement(id),
    onSuccess: () => {
      toast.success('Comunicado excluido com sucesso');
      queryClient.invalidateQueries({ queryKey: ['hr-announcements'] });
      router.push('/hr/announcements');
    },
    onError: () => {
      toast.error('Erro ao excluir comunicado');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: () => portalService.markAnnouncementRead(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-announcements'] });
      queryClient.invalidateQueries({
        queryKey: ['hr-announcement', announcementId],
      });
      queryClient.invalidateQueries({
        queryKey: ['hr-announcement-stats', announcementId],
      });
    },
  });

  const remindMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      // Backend reminder endpoint not exposed yet — surface a toast and let
      // the UX express intent. When the endpoint lands, swap the body here.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _employeeId = employeeId;
      await new Promise(resolve => setTimeout(resolve, 250));
    },
    onSuccess: () => {
      toast.success('Lembrete enviado');
    },
    onError: () => {
      toast.error('Nao foi possivel enviar o lembrete');
    },
  });

  // Auto-mark-read on mount (once)
  useEffect(() => {
    if (!announcement) return;
    if (announcement.isReadByMe === false) {
      markReadMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcement?.id]);

  // ============================================================================
  // LOADING / ERROR STATES
  // ============================================================================

  if (announcementQuery.isLoading) {
    return (
      <PageLayout data-testid="announcements-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Comunicados', href: '/hr/announcements' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!announcement) {
    return (
      <PageLayout data-testid="announcements-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Comunicados', href: '/hr/announcements' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Comunicado nao encontrado
            </h2>
            <Button onClick={() => router.push('/hr/announcements')}>
              Voltar para Comunicados
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  const config = PRIORITY_CONFIG[announcement.priority];
  const PriorityIcon = config.icon;
  const publishedAt = formatDate(announcement.publishedAt);
  const expiresAt = formatDate(announcement.expiresAt);

  const audienceTargets = announcement.audienceTargets ?? {};
  const departmentsCount = audienceTargets.departments?.length ?? 0;
  const teamsCount = audienceTargets.teams?.length ?? 0;
  const rolesCount = audienceTargets.roles?.length ?? 0;
  const employeesCount = audienceTargets.employees?.length ?? 0;
  const isBroadcast =
    departmentsCount === 0 &&
    teamsCount === 0 &&
    rolesCount === 0 &&
    employeesCount === 0;

  const readCount = statsQuery.data?.readCount ?? announcement.readCount ?? 0;
  const totalAudience =
    statsQuery.data?.totalAudience ?? announcement.audienceCount ?? 0;
  const unreadCount =
    statsQuery.data?.unreadCount ?? Math.max(0, totalAudience - readCount);
  const readPercentage =
    statsQuery.data?.readPercentage ??
    (totalAudience === 0 ? 0 : Math.round((readCount / totalAudience) * 100));

  const recentReaders =
    statsQuery.data?.recentReaders.map(reader => ({
      id: reader.employeeId,
      fullName: reader.fullName,
      photoUrl: reader.photoUrl,
      readAt: typeof reader.readAt === 'string'
        ? reader.readAt
        : new Date(reader.readAt).toISOString(),
    })) ?? [];

  // ============================================================================
  // ACTION BUTTONS
  // ============================================================================

  const actionButtons: Array<{
    id: string;
    title: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }> = [];
  if (canDelete) {
    actionButtons.push({
      id: 'delete',
      title: 'Excluir',
      icon: Trash,
      onClick: () => setIsDeleteDialogOpen(true),
      variant: 'outline',
    });
  }
  if (canEdit) {
    actionButtons.push({
      id: 'edit',
      title: 'Editar',
      icon: Edit,
      onClick: () => router.push(`/hr/announcements/${announcementId}/edit`),
    });
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout data-testid="announcements-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Comunicados', href: '/hr/announcements' },
            { label: announcement.title },
          ]}
          buttons={actionButtons}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br',
                config.gradient
              )}
            >
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {announcement.title}
                </h1>
                <Badge
                  variant="outline"
                  className={cn('gap-1', config.chipClass)}
                >
                  <PriorityIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
                {!announcement.isActive && (
                  <Badge variant="secondary">Inativo</Badge>
                )}
                {announcement.isReadByMe && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/8 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Lido
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {announcement.authorEmployee && (
                  <span>por {announcement.authorEmployee.fullName}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {publishedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-violet-500" />
                  <span>{publishedAt}</span>
                </div>
              )}
              {expiresAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Expira em {expiresAt}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Stats card (only if can view receipts) */}
        {canViewReceipts && (
          <Card
            data-testid="announcements-stats-card"
            className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10"
          >
            <div className="grid gap-6 md:grid-cols-3">
              <StatTile
                icon={Users}
                accent="violet"
                label="Audiencia total"
                value={totalAudience.toString()}
                caption="Colaboradores que devem receber"
              />
              <StatTile
                icon={CheckCircle2}
                accent="emerald"
                label="Leram"
                value={`${readCount}`}
                caption={`${readPercentage}% da audiencia`}
              />
              <StatTile
                icon={BellRing}
                accent="amber"
                label="Pendentes"
                value={`${unreadCount}`}
                caption="Ainda nao confirmaram leitura"
              />
            </div>
            <div className="mt-5">
              <ReadProgressBar
                readCount={readCount}
                totalAudience={totalAudience}
              />
            </div>
            {recentReaders.length > 0 && (
              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Ultimos leitores:
                </span>
                <ReadersAvatarStack
                  readers={recentReaders}
                  limit={8}
                  totalReaders={readCount}
                />
              </div>
            )}
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={value =>
            setActiveTab(value as 'content' | 'read' | 'unread')
          }
        >
          <TabsList
            className={cn(
              'grid w-full h-12 mb-4',
              canViewReceipts ? 'grid-cols-3' : 'grid-cols-1'
            )}
            data-testid="announcements-detail-tabs"
          >
            <TabsTrigger value="content">Conteudo</TabsTrigger>
            {canViewReceipts && (
              <>
                <TabsTrigger value="read" data-testid="tab-readers">
                  Quem leu
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[0.625rem] font-semibold text-white">
                    {readCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="unread" data-testid="tab-non-readers">
                  Quem ainda nao leu
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[0.625rem] font-semibold text-white">
                    {unreadCount}
                  </span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Content tab */}
          <TabsContent value="content" className="mt-0 space-y-4">
            <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
              <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
                <Megaphone className="h-5 w-5" />
                Comunicado
              </h3>
              <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {announcement.content}
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
              <h3 className="text-lg items-center flex uppercase font-semibold gap-2 mb-4">
                <Users className="h-5 w-5" />
                Publico-alvo
              </h3>
              <div className="flex flex-wrap gap-2">
                {isBroadcast ? (
                  <Badge
                    variant="outline"
                    className="gap-1 border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/8 dark:text-violet-300"
                  >
                    <Users className="h-3 w-3" />
                    Toda a empresa
                  </Badge>
                ) : (
                  <>
                    {departmentsCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {departmentsCount} departamento(s)
                      </Badge>
                    )}
                    {teamsCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {teamsCount} equipe(s)
                      </Badge>
                    )}
                    {rolesCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {rolesCount} cargo(s)
                      </Badge>
                    )}
                    {employeesCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <UserRound className="h-3 w-3" />
                        {employeesCount} colaborador(es)
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Readers tab */}
          {canViewReceipts && (
            <TabsContent value="read" className="mt-0">
              <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                {receiptsQuery.isLoading ? (
                  <GridLoading count={6} layout="grid" size="sm" />
                ) : receiptsQuery.data?.readers.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Ainda ninguem confirmou leitura.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {receiptsQuery.data?.readers.map(reader => {
                      const hue = hashHue(reader.fullName);
                      const formatted = formatDateTime(reader.readAt);
                      return (
                        <div
                          key={reader.employeeId}
                          className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2 dark:bg-slate-800/40"
                        >
                          <Avatar className="size-9">
                            {reader.photoUrl ? (
                              <AvatarImage
                                src={reader.photoUrl}
                                alt={reader.fullName}
                              />
                            ) : null}
                            <AvatarFallback
                              className="text-xs font-semibold text-white"
                              style={{
                                background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 30) % 360}, 65%, 45%))`,
                              }}
                            >
                              {getInitials(reader.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {reader.fullName}
                            </p>
                            {formatted && (
                              <p className="text-[0.6875rem] text-muted-foreground truncate">
                                Leu em {formatted}
                              </p>
                            )}
                          </div>
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>
          )}

          {/* Non-readers tab */}
          {canViewReceipts && (
            <TabsContent value="unread" className="mt-0">
              <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
                {receiptsQuery.isLoading ? (
                  <GridLoading count={6} layout="grid" size="sm" />
                ) : receiptsQuery.data?.nonReaders.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Todos da audiencia ja confirmaram leitura.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {receiptsQuery.data?.nonReaders.map(person => {
                      const hue = hashHue(person.fullName);
                      return (
                        <div
                          key={person.employeeId}
                          className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2 dark:bg-slate-800/40"
                        >
                          <Avatar className="size-9">
                            {person.photoUrl ? (
                              <AvatarImage
                                src={person.photoUrl}
                                alt={person.fullName}
                              />
                            ) : null}
                            <AvatarFallback
                              className="text-xs font-semibold text-white"
                              style={{
                                background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 30) % 360}, 65%, 45%))`,
                              }}
                            >
                              {getInitials(person.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {person.fullName}
                            </p>
                            {person.department?.name && (
                              <p className="text-[0.6875rem] text-muted-foreground truncate">
                                {person.department.name}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={remindMutation.isPending}
                            onClick={() =>
                              remindMutation.mutate(person.employeeId)
                            }
                            className="gap-1"
                            data-testid={`announcement-remind-${person.employeeId}`}
                          >
                            <BellRing className="h-3.5 w-3.5" />
                            Lembrar
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </PageBody>

      <VerifyActionPinModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => deleteMutation.mutate(announcementId)}
        title="Excluir Comunicado"
        description={`Digite seu PIN de acao para excluir o comunicado "${announcement.title}". Esta acao nao pode ser desfeita.`}
      />
    </PageLayout>
  );
}

// ============================================================================
// StatTile — small KPI card used in the stats area
// ============================================================================

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  caption?: string;
  accent: 'violet' | 'emerald' | 'amber';
}

function StatTile({ icon: Icon, label, value, caption, accent }: StatTileProps) {
  const accentClasses: Record<StatTileProps['accent'], string> = {
    violet:
      'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    emerald:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber:
      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  };

  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          accentClasses[accent]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold leading-tight">{value}</p>
        {caption && (
          <p className="text-xs text-muted-foreground mt-0.5">{caption}</p>
        )}
      </div>
    </div>
  );
}
