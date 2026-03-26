'use client';

import { useState, lazy, Suspense } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { CommentInput } from '@/components/tasks/shared/comment-input';
import { CustomFieldsSection } from './custom-fields-section';
import {
  MessageSquare,
  ListChecks,
  CheckSquare,
  Activity,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomField } from '@/types/tasks';

/* ── Lazy-loaded heavy sections ── */
const CardCommentsTab = lazy(() =>
  import('../tabs/card-comments-tab').then(m => ({
    default: m.CardCommentsTab,
  }))
);
const CardSubtasksTab = lazy(() =>
  import('../tabs/card-subtasks-tab').then(m => ({
    default: m.CardSubtasksTab,
  }))
);
const CardChecklistTab = lazy(() =>
  import('../tabs/card-checklist-tab').then(m => ({
    default: m.CardChecklistTab,
  }))
);
const CardActivityTab = lazy(() =>
  import('../tabs/card-activity-tab').then(m => ({
    default: m.CardActivityTab,
  }))
);

interface CardModalContentPanelProps {
  // Description
  description: string;
  onDescriptionChange: (value: string) => void;
  onDescriptionBlur: () => void;
  // Custom fields
  boardId: string;
  customFields: CustomField[];
  customFieldValues: Record<string, string>;
  onCustomFieldChange: (fieldId: string, value: string) => void;
  // Comments
  recentComments?: unknown[];
  totalComments?: number;
  onAddComment?: (content: string) => void;
  // Current user (for comment input avatar)
  currentUserName?: string | null;
  currentUserAvatarUrl?: string | null;
  // Mode
  isCreateMode?: boolean;
  // Card-specific for lazy sections
  cardId?: string;
  onOpenSubtask?: (subtaskId: string) => void;
}

/* ── Collapsible section wrapper ── */

function CollapsibleSection({
  icon: Icon,
  title,
  count,
  iconColor,
  defaultOpen = true,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  iconColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 dark:bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Icon className={cn('h-4 w-4 shrink-0', iconColor)} />
        <span className="text-sm font-medium flex-1">{title}</span>
        {count != null && count > 0 && (
          <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

/* ── Loading skeleton for lazy sections ── */

function SectionSkeleton() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

/* ── Main content panel ── */

export function CardModalGeneralTab({
  description,
  onDescriptionChange,
  onDescriptionBlur,
  boardId,
  customFields,
  customFieldValues,
  onCustomFieldChange,
  totalComments,
  onAddComment,
  currentUserName,
  currentUserAvatarUrl,
  isCreateMode = false,
  cardId,
  onOpenSubtask,
}: CardModalContentPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* ── Description ── */}
        <div>
          <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-2">
            Descrição
          </p>
          <Textarea
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            onBlur={onDescriptionBlur}
            placeholder="Adicionar descrição detalhada..."
            rows={4}
            className="text-sm resize-y min-h-[80px] border-border/60 bg-muted/20 dark:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-primary/40"
          />
        </div>

        {/* ── Custom Fields ── */}
        {customFields.length > 0 && (
          <CustomFieldsSection
            boardId={boardId}
            fields={customFields}
            values={customFieldValues}
            onChange={onCustomFieldChange}
          />
        )}

        {/* ── Subtasks (edit mode) ── */}
        {!isCreateMode && cardId && (
          <CollapsibleSection
            icon={ListChecks}
            title="Subtarefas"
            iconColor="text-violet-500"
          >
            <Suspense fallback={<SectionSkeleton />}>
              <CardSubtasksTab
                boardId={boardId}
                cardId={cardId}
                onOpenSubtask={onOpenSubtask}
              />
            </Suspense>
          </CollapsibleSection>
        )}

        {/* ── Checklist (edit mode) ── */}
        {!isCreateMode && cardId && (
          <CollapsibleSection
            icon={CheckSquare}
            title="Checklists"
            iconColor="text-teal-500"
          >
            <Suspense fallback={<SectionSkeleton />}>
              <CardChecklistTab boardId={boardId} cardId={cardId} />
            </Suspense>
          </CollapsibleSection>
        )}

        {/* ── Comments ── */}
        {!isCreateMode && cardId && (
          <CollapsibleSection
            icon={MessageSquare}
            title="Comentários"
            count={totalComments}
            iconColor="text-emerald-500"
          >
            <Suspense fallback={<SectionSkeleton />}>
              <CardCommentsTab boardId={boardId} cardId={cardId} />
            </Suspense>
          </CollapsibleSection>
        )}

        {/* ── Comments preview (inline, for non-lazy quick view) ── */}
        {!isCreateMode && !cardId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground py-2">
              <MessageSquare className="h-3.5 w-3.5 opacity-50" />
              Comentários estarão disponíveis após criar o cartão
            </div>
          </div>
        )}

        {/* ── Activity Log (edit mode) ── */}
        {!isCreateMode && cardId && (
          <CollapsibleSection
            icon={Activity}
            title="Atividade"
            iconColor="text-orange-500"
            defaultOpen={false}
          >
            <Suspense fallback={<SectionSkeleton />}>
              <CardActivityTab boardId={boardId} cardId={cardId} />
            </Suspense>
          </CollapsibleSection>
        )}

        {/* ── Create mode empty states ── */}
        {isCreateMode && (
          <div className="space-y-2 text-center py-4">
            <p className="text-xs text-muted-foreground">
              Subtarefas, checklists, comentários e atividades estarão
              disponíveis após criar o cartão.
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky comment input (edit mode) ── */}
      {!isCreateMode && onAddComment && (
        <div className="shrink-0 border-t border-border/50 pt-3 mt-3">
          <CommentInput
            userName={currentUserName}
            userAvatarUrl={currentUserAvatarUrl}
            onSubmit={onAddComment}
            placeholder="Escrever comentário rápido..."
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
