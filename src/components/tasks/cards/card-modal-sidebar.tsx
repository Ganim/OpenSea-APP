'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Clock,
  User,
  Tag,
  Columns3,
  Plus,
  CalendarDays,
  Signal,
  CircleDot,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MemberAvatar } from '@/components/tasks/shared/member-avatar';
import { LabelBadge } from '@/components/tasks/shared/label-badge';
import { AttachmentSection } from './attachment-section';
import { IntegrationLinker } from './integration-linker';
import type {
  Column,
  BoardMember,
  Label,
  CardPriority,
  CardStatus,
  CardIntegration,
  CardAttachment,
  IntegrationType,
} from '@/types/tasks';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/tasks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CardModalSidebarProps {
  // Column
  columns: Column[];
  columnId: string;
  onColumnChange: (columnId: string) => void;
  // Status
  status: CardStatus;
  onStatusChange: (status: CardStatus) => void;
  showStatus?: boolean;
  // Priority
  priority: CardPriority;
  onPriorityChange: (priority: CardPriority) => void;
  // Labels
  allLabels: Label[];
  selectedLabelIds: string[];
  onToggleLabel: (labelId: string) => void;
  onCreateLabel?: (name: string, color: string) => void;
  // Parent card
  parentCards?: { id: string; title: string }[];
  parentCardId: string | null;
  onParentCardChange?: (cardId: string | null) => void;
  // Assignee
  members: BoardMember[];
  assigneeId: string | null;
  onAssigneeChange: (userId: string | null) => void;
  // Dates
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  dueDate: Date | undefined;
  onDueDateChange: (date: Date | undefined) => void;
  // Estimated hours
  estimatedHours: string;
  onEstimatedHoursChange: (value: string) => void;
  onEstimatedHoursBlur?: () => void;
  // Attachments
  attachments: CardAttachment[];
  onUploadAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onLinkStorageFile?: (file: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
  }) => void;
  // Integrations
  integrations: CardIntegration[];
  onAddIntegration: (
    type: IntegrationType,
    entityId: string,
    entityLabel: string
  ) => void;
  onRemoveIntegration: (integrationId: string) => void;
  // Meta
  createdAt?: string | null;
  reporterName?: string | null;
}

const PRIORITY_OPTIONS: CardPriority[] = [
  'NONE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

const PRIORITY_DOT_COLORS: Record<CardPriority, string> = {
  NONE: 'bg-gray-400',
  LOW: 'bg-sky-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-rose-500',
};

const STATUS_DOT_COLORS: Record<CardStatus, string> = {
  OPEN: 'bg-gray-400',
  IN_PROGRESS: 'bg-sky-500',
  DONE: 'bg-emerald-500',
  CANCELED: 'bg-rose-500',
};

const LABEL_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

const PARENT_NONE_VALUE = '__NONE__';

/* ────────────────────────────────────────────────────── */
/* Sidebar field row                                       */
/* ────────────────────────────────────────────────────── */

function SidebarField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
        <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────── */
/* Main sidebar                                            */
/* ────────────────────────────────────────────────────── */

export function CardModalSidebar({
  columns,
  columnId,
  onColumnChange,
  status,
  onStatusChange,
  showStatus = false,
  priority,
  onPriorityChange,
  allLabels,
  selectedLabelIds,
  onToggleLabel,
  onCreateLabel,
  parentCards = [],
  parentCardId,
  onParentCardChange,
  members,
  assigneeId,
  onAssigneeChange,
  startDate,
  onStartDateChange,
  dueDate,
  onDueDateChange,
  estimatedHours,
  onEstimatedHoursChange,
  onEstimatedHoursBlur,
  attachments,
  onUploadAttachment,
  onRemoveAttachment,
  onLinkStorageFile,
  integrations,
  onAddIntegration,
  onRemoveIntegration,
  createdAt,
  reporterName,
}: CardModalSidebarProps) {
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6');

  const selectedLabels = allLabels.filter(l => selectedLabelIds.includes(l.id));

  return (
    <div className="w-full md:w-[280px] lg:w-[300px] shrink-0 border-t md:border-t-0 md:border-l border-border bg-muted/30 dark:bg-white/[0.02] overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* ── Status (edit mode) ── */}
        {showStatus && (
          <SidebarField icon={CircleDot} label="Status">
            <Select
              value={status}
              onValueChange={v => onStatusChange(v as CardStatus)}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        STATUS_DOT_COLORS[status]
                      )}
                    />
                    {STATUS_CONFIG[status].label}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_CONFIG) as CardStatus[]).map(s => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full shrink-0',
                          STATUS_DOT_COLORS[s]
                        )}
                      />
                      {STATUS_CONFIG[s].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarField>
        )}

        {/* ── Prioridade ── */}
        <SidebarField icon={Signal} label="Prioridade">
          <div className="flex items-center gap-1.5">
            {PRIORITY_OPTIONS.map(p => (
              <button
                key={p}
                type="button"
                title={PRIORITY_CONFIG[p].label}
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center transition-all',
                  priority === p
                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110'
                    : 'hover:ring-1 hover:ring-muted-foreground/30 hover:scale-105'
                )}
                onClick={() => onPriorityChange(p)}
              >
                <span
                  className={cn('h-3 w-3 rounded-full', PRIORITY_DOT_COLORS[p])}
                />
              </button>
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">
              {PRIORITY_CONFIG[priority].label}
            </span>
          </div>
        </SidebarField>

        {/* ── Responsável ── */}
        <SidebarField icon={User} label="Responsável">
          <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs w-full justify-start gap-2"
                type="button"
              >
                {assigneeId ? (
                  (() => {
                    const member = members.find(m => m.userId === assigneeId);
                    return member ? (
                      <>
                        <MemberAvatar
                          name={member.userName}
                          avatarUrl={member.userAvatarUrl}
                          size="sm"
                          className="h-5 w-5 text-[8px]"
                        />
                        <span className="truncate">
                          {member.userName ?? member.userEmail}
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Nenhum</span>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Nenhum</span>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 z-[60]" align="start">
              <div className="space-y-0.5 max-h-52 overflow-y-auto">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => {
                    onAssigneeChange(null);
                    setAssigneeOpen(false);
                  }}
                >
                  <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px]">
                    --
                  </span>
                  <span className="text-muted-foreground">Nenhum</span>
                </button>
                {members.map(m => (
                  <button
                    key={m.userId}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors',
                      assigneeId === m.userId && 'bg-muted'
                    )}
                    onClick={() => {
                      onAssigneeChange(m.userId);
                      setAssigneeOpen(false);
                    }}
                  >
                    <MemberAvatar
                      name={m.userName}
                      avatarUrl={m.userAvatarUrl}
                      size="sm"
                    />
                    <span className="truncate">
                      {m.userName ?? m.userEmail}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </SidebarField>

        {/* ── Coluna ── */}
        <SidebarField icon={Columns3} label="Coluna">
          <Select value={columnId} onValueChange={onColumnChange}>
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...columns]
                .sort((a, b) => a.position - b.position)
                .map(col => (
                  <SelectItem key={col.id} value={col.id}>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.color ?? '#6b7280' }}
                      />
                      {col.title}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </SidebarField>

        {/* ── Etiquetas ── */}
        <SidebarField icon={Tag} label="Etiquetas">
          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {selectedLabels.map(label => (
                <LabelBadge
                  key={label.id}
                  name={label.name}
                  color={label.color}
                  className="text-[9px]"
                />
              ))}
            </div>
          )}
          <Popover open={labelsOpen} onOpenChange={setLabelsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs w-full justify-start gap-1.5"
                type="button"
              >
                <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                {selectedLabels.length > 0
                  ? `${selectedLabels.length} selecionada${selectedLabels.length > 1 ? 's' : ''}`
                  : 'Nenhuma'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2 z-[60]" align="start">
              {showCreateLabel ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-1">
                    Nova etiqueta
                  </p>
                  <Input
                    value={newLabelName}
                    onChange={e => setNewLabelName(e.target.value)}
                    placeholder="Nome da etiqueta"
                    className="h-7 text-xs"
                    autoFocus
                    onKeyDown={e => {
                      if (
                        e.key === 'Enter' &&
                        newLabelName.trim() &&
                        onCreateLabel
                      ) {
                        onCreateLabel(newLabelName.trim(), newLabelColor);
                        setNewLabelName('');
                        setShowCreateLabel(false);
                      }
                      if (e.key === 'Escape') setShowCreateLabel(false);
                    }}
                  />
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {LABEL_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          'h-5 w-5 rounded-full transition-all',
                          newLabelColor === color
                            ? 'ring-2 ring-offset-1 ring-offset-background ring-primary scale-110'
                            : 'hover:scale-110'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewLabelColor(color)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <Button
                      size="sm"
                      className="h-7 text-xs flex-1"
                      disabled={!newLabelName.trim()}
                      onClick={() => {
                        if (newLabelName.trim() && onCreateLabel) {
                          onCreateLabel(newLabelName.trim(), newLabelColor);
                          setNewLabelName('');
                          setShowCreateLabel(false);
                        }
                      }}
                    >
                      Criar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setShowCreateLabel(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {allLabels.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-2 py-1">
                        Nenhuma etiqueta neste quadro
                      </p>
                    ) : (
                      allLabels.map(label => {
                        const isSelected = selectedLabelIds.includes(label.id);
                        return (
                          <button
                            key={label.id}
                            type="button"
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                            onClick={() => onToggleLabel(label.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none"
                            />
                            <LabelBadge name={label.name} color={label.color} />
                          </button>
                        );
                      })
                    )}
                  </div>
                  {onCreateLabel && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-muted transition-colors mt-1 border-t border-border pt-2"
                      onClick={() => setShowCreateLabel(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Criar etiqueta
                    </button>
                  )}
                </>
              )}
            </PopoverContent>
          </Popover>
        </SidebarField>

        {/* ── Datas ── */}
        <div className="border-t border-border/50 pt-4 space-y-4">
          <SidebarField icon={CalendarDays} label="Início">
            <DateTimePicker
              value={startDate ?? null}
              onChange={date => onStartDateChange(date ?? undefined)}
              placeholder="Definir início"
            />
          </SidebarField>

          <SidebarField icon={CalendarDays} label="Prazo">
            <DateTimePicker
              value={dueDate ?? null}
              onChange={date => onDueDateChange(date ?? undefined)}
              placeholder="Definir prazo"
            />
          </SidebarField>

          <SidebarField icon={Clock} label="Tempo Estimado">
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={0}
                step={0.5}
                placeholder="Horas"
                value={estimatedHours}
                onChange={e => onEstimatedHoursChange(e.target.value)}
                onBlur={onEstimatedHoursBlur}
                className="h-8 text-xs flex-1"
              />
              <span className="text-[10px] text-muted-foreground shrink-0">
                horas
              </span>
            </div>
          </SidebarField>
        </div>

        {/* ── Card Pai ── */}
        {parentCards.length > 0 && onParentCardChange && (
          <div className="border-t border-border/50 pt-4">
            <SidebarField icon={Columns3} label="Cartão Pai">
              <Select
                value={parentCardId ?? PARENT_NONE_VALUE}
                onValueChange={v =>
                  onParentCardChange(v === PARENT_NONE_VALUE ? null : v)
                }
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PARENT_NONE_VALUE}>
                    <span className="text-muted-foreground">Nenhum</span>
                  </SelectItem>
                  {parentCards.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="truncate">{c.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SidebarField>
          </div>
        )}

        {/* ── Anexos ── */}
        <div className="border-t border-border/50 pt-4">
          <SidebarField icon={Paperclip} label="Anexos">
            <AttachmentSection
              attachments={attachments}
              onUpload={onUploadAttachment}
              onRemove={onRemoveAttachment}
              onLinkStorageFile={onLinkStorageFile}
            />
          </SidebarField>
        </div>

        {/* ── Integrações ── */}
        <div className="border-t border-border/50 pt-4">
          <SidebarField icon={Columns3} label="Integrações">
            <IntegrationLinker
              integrations={integrations}
              onAdd={onAddIntegration}
              onRemove={onRemoveIntegration}
            />
          </SidebarField>
        </div>

        {/* ── Meta (created date, reporter) ── */}
        {createdAt && (
          <div className="border-t border-border/50 pt-4">
            <div className="space-y-1.5 text-[10px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Criado em</span>
                <span className="font-medium text-foreground/70">
                  {format(new Date(createdAt), "dd 'de' MMM, yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              {reporterName && (
                <div className="flex items-center justify-between">
                  <span>Criado por</span>
                  <span className="font-medium text-foreground/70">
                    {reporterName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
