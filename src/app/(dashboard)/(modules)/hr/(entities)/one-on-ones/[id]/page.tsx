/**
 * 1:1 Meeting Detail Page
 *
 * Layout 3-col (lg) ou stack (mobile):
 *  - Talking Points: lista vertical, autor (manager/report), toggle resolved,
 *    inline edit (autor) e composer.
 *  - Notes: tabs Compartilhadas | Minhas (privadas), auto-save com debounce 1s.
 *  - Action Items: checklist com owner avatar, due date e composer.
 *
 * PageActionBar inclui Edit (placeholder), "Marcar como realizada" e
 * "Cancelar" — esta última protegida por VerifyActionPinModal.
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
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import {
  useAddActionItem,
  useAddTalkingPoint,
  useCancelOneOnOne,
  useCompleteOneOnOne,
  useDeleteActionItem,
  useDeleteOneOnOne,
  useDeleteTalkingPoint,
  useOneOnOne,
  useUpdateActionItem,
  useUpdateTalkingPoint,
  useUpsertOneOnOneNote,
} from '@/hooks/hr/use-one-on-ones';
import { useDebounce } from '@/hooks/use-debounce';
import { useMyEmployee } from '@/hooks/use-me';
import { usePermissions } from '@/hooks/use-permissions';
import { translateError } from '@/lib/error-messages';
import type {
  OneOnOneActionItem,
  OneOnOneMeeting,
  OneOnOneNote,
  OneOnOneRole,
  OneOnOneStatus,
  TalkingPoint,
} from '@/types/hr';
import {
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  Clock,
  Lock,
  MessageSquareText,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// HELPERS
// ============================================================================

const STATUS_LABEL: Record<OneOnOneStatus, string> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Realizada',
  CANCELLED: 'Cancelada',
};

const STATUS_BADGE_CLASSES: Record<OneOnOneStatus, string> = {
  SCHEDULED:
    'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  COMPLETED:
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  CANCELLED:
    'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};

const ROLE_BADGE_CLASSES: Record<OneOnOneRole, string> = {
  manager:
    'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
  report:
    'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
};

const ROLE_LABEL: Record<OneOnOneRole, string> = {
  manager: 'Gestor',
  report: 'Liderado',
};

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-pink-500',
];

function hashColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index++) {
    hash = (hash << 5) - hash + name.charCodeAt(index);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================================================
// PAGE
// ============================================================================

export default function OneOnOneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const { hasPermission } = usePermissions();
  const canList = hasPermission(HR_PERMISSIONS.ONE_ON_ONES.LIST);
  const canEdit = hasPermission(HR_PERMISSIONS.ONE_ON_ONES.UPDATE);
  const canDelete = hasPermission(HR_PERMISSIONS.ONE_ON_ONES.DELETE);

  const { data: myEmployeeData } = useMyEmployee();
  const myEmployeeId = myEmployeeData?.employee?.id;

  const meetingQuery = useOneOnOne(meetingId, canList);
  const meeting = meetingQuery.data?.meeting;

  const completeMutation = useCompleteOneOnOne();
  const cancelMutation = useCancelOneOnOne();
  const deleteMutation = useDeleteOneOnOne();

  const [isCancelPinOpen, setIsCancelPinOpen] = useState(false);
  const [isDeletePinOpen, setIsDeletePinOpen] = useState(false);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleComplete = useCallback(() => {
    completeMutation.mutate(meetingId, {
      onSuccess: () => toast.success('Reunião marcada como realizada.'),
      onError: error =>
        toast.error(
          translateError(error instanceof Error ? error.message : String(error))
        ),
    });
  }, [completeMutation, meetingId]);

  const handleCancelConfirm = useCallback(() => {
    cancelMutation.mutate(meetingId, {
      onSuccess: () => {
        toast.success('Reunião cancelada.');
        setIsCancelPinOpen(false);
      },
      onError: error => {
        toast.error(
          translateError(error instanceof Error ? error.message : String(error))
        );
        setIsCancelPinOpen(false);
      },
    });
  }, [cancelMutation, meetingId]);

  const handleDeleteConfirm = useCallback(() => {
    deleteMutation.mutate(meetingId, {
      onSuccess: () => {
        toast.success('Reunião excluída.');
        router.push('/hr/one-on-ones');
      },
      onError: error => {
        toast.error(
          translateError(error instanceof Error ? error.message : String(error))
        );
        setIsDeletePinOpen(false);
      },
    });
  }, [deleteMutation, meetingId, router]);

  // ============================================================================
  // GUARDS
  // ============================================================================

  if (!canList) {
    return (
      <PageLayout data-testid="one-on-one-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Reuniões 1:1', href: '/hr/one-on-ones' },
              { label: 'Sem permissão' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Sem permissão"
            message="Você não tem permissão para visualizar esta reunião."
          />
        </PageBody>
      </PageLayout>
    );
  }

  if (meetingQuery.isLoading) {
    return (
      <PageLayout data-testid="one-on-one-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Reuniões 1:1', href: '/hr/one-on-ones' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" gap="gap-4" />
        </PageBody>
      </PageLayout>
    );
  }

  if (meetingQuery.error || !meeting) {
    return (
      <PageLayout data-testid="one-on-one-detail-page">
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Reuniões 1:1', href: '/hr/one-on-ones' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Reunião não encontrada"
            message="A reunião 1:1 solicitada não foi encontrada."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/one-on-ones'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  const isManager = myEmployeeId === meeting.managerId;
  const isReport = myEmployeeId === meeting.reportId;
  const myRole: OneOnOneRole | null = isManager
    ? 'manager'
    : isReport
      ? 'report'
      : null;
  const isReadOnly = meeting.status !== 'SCHEDULED';

  return (
    <PageLayout data-testid="one-on-one-detail-page">
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Reuniões 1:1', href: '/hr/one-on-ones' },
            { label: formatDateTime(meeting.scheduledAt) },
          ]}
          buttons={[
            ...(canEdit && meeting.status === 'SCHEDULED'
              ? [
                  {
                    id: 'complete-meeting',
                    title: 'Marcar como realizada',
                    icon: CheckCircle2,
                    onClick: handleComplete,
                    variant: 'outline' as const,
                  },
                  {
                    id: 'cancel-meeting',
                    title: 'Cancelar 1:1',
                    icon: XCircle,
                    onClick: () => setIsCancelPinOpen(true),
                    variant: 'outline' as const,
                  },
                ]
              : []),
            ...(canEdit
              ? [
                  {
                    id: 'edit-meeting',
                    title: 'Editar',
                    icon: Pencil,
                    onClick: () =>
                      toast.info(
                        'A edição completa de 1:1 estará disponível em breve.'
                      ),
                    variant: 'outline' as const,
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    id: 'delete-meeting',
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setIsDeletePinOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex flex-wrap items-start gap-4">
            <PairAvatar
              primaryName={meeting.manager?.fullName ?? 'Gestor'}
              secondaryName={meeting.report?.fullName ?? 'Liderado'}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">
                {meeting.manager?.fullName ?? 'Gestor'} &harr;{' '}
                {meeting.report?.fullName ?? 'Liderado'}
              </h2>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDateTime(meeting.scheduledAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {meeting.durationMinutes} min
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={STATUS_BADGE_CLASSES[meeting.status]}
                >
                  {STATUS_LABEL[meeting.status]}
                </Badge>
                <Badge
                  variant="outline"
                  className={ROLE_BADGE_CLASSES.manager}
                >
                  Gestor: {meeting.manager?.fullName ?? '—'}
                </Badge>
                <Badge variant="outline" className={ROLE_BADGE_CLASSES.report}>
                  Liderado: {meeting.report?.fullName ?? '—'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* 3-col layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TalkingPointsColumn
            meeting={meeting}
            myEmployeeId={myEmployeeId}
            myRole={myRole}
            isReadOnly={isReadOnly}
            canEdit={canEdit}
          />

          <NotesColumn
            meeting={meeting}
            myEmployeeId={myEmployeeId}
            myRole={myRole}
            isReadOnly={isReadOnly}
            canEdit={canEdit}
          />

          <ActionItemsColumn
            meeting={meeting}
            myEmployeeId={myEmployeeId}
            isReadOnly={isReadOnly}
            canEdit={canEdit}
          />
        </div>
      </PageBody>

      <VerifyActionPinModal
        isOpen={isCancelPinOpen}
        onClose={() => setIsCancelPinOpen(false)}
        onSuccess={handleCancelConfirm}
        title="Cancelar reunião 1:1"
        description="Digite seu PIN de Ação para cancelar esta reunião 1:1. Essa ação não pode ser desfeita."
      />

      <VerifyActionPinModal
        isOpen={isDeletePinOpen}
        onClose={() => setIsDeletePinOpen(false)}
        onSuccess={handleDeleteConfirm}
        title="Excluir reunião 1:1"
        description="Digite seu PIN de Ação para excluir esta reunião 1:1. Essa ação não pode ser desfeita."
      />
    </PageLayout>
  );
}

// ============================================================================
// PAIR AVATAR
// ============================================================================

function PairAvatar({
  primaryName,
  secondaryName,
  size = 'md',
}: {
  primaryName: string;
  secondaryName: string;
  size?: 'md' | 'lg';
}) {
  const dim = size === 'lg' ? 'h-12 w-12 text-sm' : 'h-9 w-9 text-xs';
  return (
    <div className="flex -space-x-3">
      <div
        className={`flex ${dim} items-center justify-center rounded-full border-2 border-white font-semibold text-white dark:border-slate-900 ${hashColor(primaryName)}`}
      >
        {initials(primaryName)}
      </div>
      <div
        className={`flex ${dim} items-center justify-center rounded-full border-2 border-white font-semibold text-white dark:border-slate-900 ${hashColor(secondaryName)}`}
      >
        {initials(secondaryName)}
      </div>
    </div>
  );
}

// ============================================================================
// TALKING POINTS COLUMN
// ============================================================================

interface TalkingPointsColumnProps {
  meeting: OneOnOneMeeting;
  myEmployeeId?: string;
  myRole: OneOnOneRole | null;
  isReadOnly: boolean;
  canEdit: boolean;
}

function TalkingPointsColumn({
  meeting,
  myEmployeeId,
  isReadOnly,
  canEdit,
}: TalkingPointsColumnProps) {
  const [composer, setComposer] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState('');

  const addMutation = useAddTalkingPoint(meeting.id);
  const updateMutation = useUpdateTalkingPoint(meeting.id);
  const deleteMutation = useDeleteTalkingPoint(meeting.id);

  const points = meeting.talkingPoints ?? [];

  const handleAdd = useCallback(async () => {
    const content = composer.trim();
    if (!content) return;
    try {
      await addMutation.mutateAsync({ content });
      setComposer('');
    } catch (error) {
      toast.error(
        translateError(error instanceof Error ? error.message : String(error))
      );
    }
  }, [addMutation, composer]);

  const handleToggleResolved = useCallback(
    (point: TalkingPoint) => {
      updateMutation.mutate(
        { talkingPointId: point.id, payload: { resolved: !point.resolved } },
        {
          onError: error =>
            toast.error(
              translateError(
                error instanceof Error ? error.message : String(error)
              )
            ),
        }
      );
    },
    [updateMutation]
  );

  const handleSaveEdit = useCallback(
    (point: TalkingPoint) => {
      const content = editingDraft.trim();
      if (!content) {
        setEditingId(null);
        return;
      }
      updateMutation.mutate(
        { talkingPointId: point.id, payload: { content } },
        {
          onSuccess: () => setEditingId(null),
          onError: error =>
            toast.error(
              translateError(
                error instanceof Error ? error.message : String(error)
              )
            ),
        }
      );
    },
    [editingDraft, updateMutation]
  );

  const handleDelete = useCallback(
    (pointId: string) => {
      deleteMutation.mutate(pointId, {
        onError: error =>
          toast.error(
            translateError(
              error instanceof Error ? error.message : String(error)
            )
          ),
      });
    },
    [deleteMutation]
  );

  return (
    <Card className="flex flex-col gap-3 bg-white/5 p-4">
      <header className="flex items-center gap-2">
        <MessageSquareText className="h-4 w-4 text-violet-500" />
        <h3 className="text-sm font-semibold">Pautas</h3>
        <span className="text-xs text-muted-foreground">({points.length})</span>
      </header>

      <ul
        className="flex flex-col gap-2"
        data-testid="talking-points-list"
      >
        {points.length === 0 ? (
          <li className="rounded-md border border-dashed border-border bg-white/40 px-3 py-6 text-center text-xs text-muted-foreground dark:bg-slate-900/20">
            Nenhuma pauta cadastrada ainda.
          </li>
        ) : (
          points.map(point => {
            const isAuthor = point.authorId === myEmployeeId;
            const isEditing = editingId === point.id;
            return (
              <li
                key={point.id}
                data-testid={`talking-point-${point.id}`}
                className={`rounded-lg border bg-white p-3 dark:bg-slate-800/60 ${
                  point.resolved
                    ? 'border-emerald-200 dark:border-emerald-500/30'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleResolved(point)}
                    disabled={isReadOnly || !canEdit}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      point.resolved
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-muted-foreground/40 hover:border-emerald-500'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={
                      point.resolved
                        ? 'Marcar como pendente'
                        : 'Marcar como resolvido'
                    }
                  >
                    {point.resolved && <CheckSquare className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editingDraft}
                          onChange={event =>
                            setEditingDraft(event.target.value)
                          }
                          className="min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="h-8"
                            onClick={() => handleSaveEdit(point)}
                          >
                            <Save className="h-3.5 w-3.5" />
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`text-sm whitespace-pre-wrap ${
                          point.resolved
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {point.content}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 ${ROLE_BADGE_CLASSES[point.authorRole]}`}
                      >
                        {ROLE_LABEL[point.authorRole]}
                      </Badge>
                      <span>{point.author?.fullName ?? 'Desconhecido'}</span>
                      <span>&middot;</span>
                      <span>{formatDateTime(point.createdAt)}</span>
                    </div>
                  </div>
                  {!isEditing && isAuthor && !isReadOnly && canEdit && (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingId(point.id);
                          setEditingDraft(point.content);
                        }}
                        aria-label="Editar pauta"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                        onClick={() => handleDelete(point.id)}
                        aria-label="Remover pauta"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      {!isReadOnly && canEdit && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <Label
            htmlFor="talking-point-composer"
            className="text-xs text-muted-foreground"
          >
            Adicionar pauta
          </Label>
          <textarea
            id="talking-point-composer"
            value={composer}
            onChange={event => setComposer(event.target.value)}
            placeholder="O que você gostaria de discutir?"
            className="min-h-[64px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!composer.trim() || addMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// NOTES COLUMN
// ============================================================================

interface NotesColumnProps {
  meeting: OneOnOneMeeting;
  myEmployeeId?: string;
  myRole: OneOnOneRole | null;
  isReadOnly: boolean;
  canEdit: boolean;
}

function NotesColumn({
  meeting,
  myEmployeeId,
  myRole,
  isReadOnly,
  canEdit,
}: NotesColumnProps) {
  const [activeTab, setActiveTab] = useState<'shared' | 'private'>('shared');

  const notes = meeting.notes ?? [];

  const sharedNote = useMemo<OneOnOneNote | undefined>(
    () => notes.find(note => !note.isPrivate),
    [notes]
  );
  const myPrivateNote = useMemo<OneOnOneNote | undefined>(
    () => notes.find(note => note.isPrivate && note.authorId === myEmployeeId),
    [notes, myEmployeeId]
  );

  return (
    <Card className="flex flex-col gap-3 bg-white/5 p-4">
      <header className="flex items-center gap-2">
        <MessageSquareText className="h-4 w-4 text-sky-500" />
        <h3 className="text-sm font-semibold">Anotações</h3>
      </header>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-10">
          <TabsTrigger
            value="shared"
            onClick={() => setActiveTab('shared')}
            className="flex items-center gap-2 text-xs"
            data-testid="notes-shared-tab"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Compartilhadas
          </TabsTrigger>
          <TabsTrigger
            value="private"
            onClick={() => setActiveTab('private')}
            className="flex items-center gap-2 text-xs"
            data-testid="notes-private-tab"
            disabled={!myRole}
          >
            <Lock className="h-3.5 w-3.5" />
            Minhas (privadas)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'shared' ? (
        <NoteEditor
          meetingId={meeting.id}
          existingNote={sharedNote}
          isPrivate={false}
          dataTestId="notes-shared"
          isReadOnly={isReadOnly || !canEdit}
          placeholder="Anotações compartilhadas entre gestor e liderado..."
        />
      ) : myRole ? (
        <NoteEditor
          meetingId={meeting.id}
          existingNote={myPrivateNote}
          isPrivate={true}
          dataTestId="notes-private"
          isReadOnly={isReadOnly}
          placeholder="Estas anotações são visíveis apenas para você."
        />
      ) : (
        <p className="rounded-md border border-dashed border-border bg-white/40 px-3 py-6 text-center text-xs text-muted-foreground dark:bg-slate-900/20">
          Apenas participantes da reunião podem manter anotações privadas.
        </p>
      )}
    </Card>
  );
}

interface NoteEditorProps {
  meetingId: string;
  existingNote?: OneOnOneNote;
  isPrivate: boolean;
  dataTestId: string;
  isReadOnly: boolean;
  placeholder: string;
}

function NoteEditor({
  meetingId,
  existingNote,
  isPrivate,
  dataTestId,
  isReadOnly,
  placeholder,
}: NoteEditorProps) {
  const [draft, setDraft] = useState(existingNote?.content ?? '');
  const [isDirty, setIsDirty] = useState(false);
  const debouncedDraft = useDebounce(draft, 1000);

  const upsertMutation = useUpsertOneOnOneNote(meetingId);

  // Sync external updates (e.g. someone else edited a shared note)
  useEffect(() => {
    if (!isDirty) {
      setDraft(existingNote?.content ?? '');
    }
  }, [existingNote?.content, existingNote?.updatedAt, isDirty]);

  // Auto-save on debounced change
  useEffect(() => {
    if (!isDirty) return;
    if (isReadOnly) return;
    if (debouncedDraft === (existingNote?.content ?? '')) {
      setIsDirty(false);
      return;
    }
    upsertMutation.mutate(
      { content: debouncedDraft, isPrivate },
      {
        onSuccess: () => setIsDirty(false),
        onError: error =>
          toast.error(
            translateError(
              error instanceof Error ? error.message : String(error)
            )
          ),
      }
    );
  }, [debouncedDraft, isDirty, existingNote?.content, isPrivate, isReadOnly, upsertMutation]);

  return (
    <div className="flex flex-col gap-2" data-testid={dataTestId}>
      <textarea
        value={draft}
        onChange={event => {
          setDraft(event.target.value);
          setIsDirty(true);
        }}
        readOnly={isReadOnly}
        placeholder={placeholder}
        className="min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none disabled:opacity-60"
      />
      <p className="text-[11px] text-muted-foreground">
        {upsertMutation.isPending
          ? 'Salvando...'
          : isDirty
            ? 'Alterações não salvas...'
            : existingNote?.updatedAt
              ? `Salvo às ${formatDateTime(existingNote.updatedAt)}`
              : 'Auto-save ativo (1s).'}
      </p>
    </div>
  );
}

// ============================================================================
// ACTION ITEMS COLUMN
// ============================================================================

interface ActionItemsColumnProps {
  meeting: OneOnOneMeeting;
  myEmployeeId?: string;
  isReadOnly: boolean;
  canEdit: boolean;
}

function ActionItemsColumn({
  meeting,
  myEmployeeId,
  isReadOnly,
  canEdit,
}: ActionItemsColumnProps) {
  const [content, setContent] = useState('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  const addMutation = useAddActionItem(meeting.id);
  const updateMutation = useUpdateActionItem(meeting.id);
  const deleteMutation = useDeleteActionItem(meeting.id);

  const items = meeting.actionItems ?? [];

  // Default owner = current user if participant, else manager
  useEffect(() => {
    if (ownerId) return;
    if (myEmployeeId === meeting.managerId || myEmployeeId === meeting.reportId) {
      setOwnerId(myEmployeeId as string);
    } else {
      setOwnerId(meeting.managerId);
    }
  }, [ownerId, myEmployeeId, meeting.managerId, meeting.reportId]);

  const ownerOptions = useMemo(
    () =>
      [meeting.manager, meeting.report].filter(
        (participant): participant is NonNullable<typeof participant> =>
          !!participant
      ),
    [meeting.manager, meeting.report]
  );

  const handleAdd = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || !ownerId) return;
    try {
      await addMutation.mutateAsync({
        content: trimmed,
        ownerId,
        dueDate: dueDate || undefined,
      });
      setContent('');
      setDueDate('');
    } catch (error) {
      toast.error(
        translateError(error instanceof Error ? error.message : String(error))
      );
    }
  }, [addMutation, content, ownerId, dueDate]);

  const handleToggleCompleted = useCallback(
    (item: OneOnOneActionItem) => {
      updateMutation.mutate(
        {
          actionItemId: item.id,
          payload: { completed: !item.completed },
        },
        {
          onError: error =>
            toast.error(
              translateError(
                error instanceof Error ? error.message : String(error)
              )
            ),
        }
      );
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    (itemId: string) => {
      deleteMutation.mutate(itemId, {
        onError: error =>
          toast.error(
            translateError(
              error instanceof Error ? error.message : String(error)
            )
          ),
      });
    },
    [deleteMutation]
  );

  return (
    <Card className="flex flex-col gap-3 bg-white/5 p-4">
      <header className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-semibold">Ações</h3>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </header>

      <ul className="flex flex-col gap-2" data-testid="action-items-list">
        {items.length === 0 ? (
          <li className="rounded-md border border-dashed border-border bg-white/40 px-3 py-6 text-center text-xs text-muted-foreground dark:bg-slate-900/20">
            Nenhuma ação registrada.
          </li>
        ) : (
          items.map(item => {
            const ownerName = item.owner?.fullName ?? 'Responsável';
            return (
              <li
                key={item.id}
                data-testid={`action-item-${item.id}`}
                className={`rounded-lg border bg-white p-3 dark:bg-slate-800/60 ${
                  item.completed
                    ? 'border-emerald-200 dark:border-emerald-500/30'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(item)}
                    disabled={isReadOnly || !canEdit}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      item.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-muted-foreground/40 hover:border-emerald-500'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={
                      item.completed ? 'Marcar como pendente' : 'Concluir'
                    }
                  >
                    {item.completed && <CheckSquare className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm whitespace-pre-wrap ${
                        item.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {item.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white ${hashColor(ownerName)}`}
                      >
                        {initials(ownerName)}
                      </span>
                      <span>{ownerName}</span>
                      {item.dueDate && (
                        <Badge
                          variant="outline"
                          className="border-amber-300 bg-amber-50 text-[10px] py-0 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                        >
                          Prazo {formatDate(item.dueDate)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && canEdit && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Remover ação"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      {!isReadOnly && canEdit && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <Label
            htmlFor="action-item-composer"
            className="text-xs text-muted-foreground"
          >
            Nova ação
          </Label>
          <Input
            id="action-item-composer"
            value={content}
            onChange={event => setContent(event.target.value)}
            placeholder="Descreva o próximo passo..."
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              value={ownerId}
              onChange={event => setOwnerId(event.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Responsável"
            >
              {ownerOptions.map(participant => (
                <option key={participant.id} value={participant.id}>
                  {participant.fullName}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={dueDate}
              onChange={event => setDueDate(event.target.value)}
              aria-label="Prazo"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!content.trim() || !ownerId || addMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      )}

      {isReadOnly && (
        <p className="rounded-md border border-dashed border-border bg-white/40 px-3 py-2 text-center text-[11px] text-muted-foreground dark:bg-slate-900/20">
          Esta reunião está {STATUS_LABEL[meeting.status].toLowerCase()} —
          edição desabilitada.
        </p>
      )}
    </Card>
  );
}
