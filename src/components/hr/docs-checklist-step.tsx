'use client';

/**
 * DocsChecklistStep
 *
 * Rippling-style "documentos obrigatórios" upfront checklist used as the first
 * step of the admission wizard. It surfaces the full CLT-mandated paperwork
 * list to recruiters BEFORE any candidate data is collected, avoiding the
 * common pitfall of discovering a missing document at step 4.
 *
 * Each entry tracks one of four states:
 *   - pending  (slate)  — nothing uploaded yet
 *   - uploaded (sky)    — file received, awaiting review
 *   - approved (emerald) — file validated by HR
 *   - rejected (rose)   — file refused, with reason; user must re-upload
 *
 * The component is fully controlled: parent owns the entries map (so the
 * wizard can persist progress through `saveDraft`).
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type {
  AdmissionDocChecklistEntry,
  AdmissionDocChecklistStatus,
} from '@/lib/hr/admission-draft';
import { storageFilesService } from '@/services/storage/files.service';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  Landmark,
  Loader2,
  Upload,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// CHECKLIST DEFINITION (CLT — Brasil)
// =============================================================================

interface ChecklistDoc {
  type: string;
  label: string;
  required: boolean;
  note?: string;
}

interface ChecklistGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  documents: ChecklistDoc[];
}

export const ADMISSION_DOCS_CHECKLIST: ChecklistGroup[] = [
  {
    id: 'personal',
    title: 'Documentos Pessoais',
    icon: User,
    iconBg: 'bg-violet-100 dark:bg-violet-500/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    documents: [
      {
        type: 'RG_OR_CNH',
        label: 'RG ou CNH (frente e verso)',
        required: true,
      },
      { type: 'CPF', label: 'CPF', required: true },
      {
        type: 'PROOF_ADDRESS',
        label: 'Comprovante de residência',
        required: true,
        note: 'Conta de luz, água, internet ou similar (até 90 dias)',
      },
      {
        type: 'VOTER_REGISTRATION',
        label: 'Título de eleitor',
        required: true,
      },
      {
        type: 'MILITARY_CERT',
        label: 'Certificado de reservista',
        required: false,
        note: 'Obrigatório para homens entre 18 e 45 anos',
      },
      {
        type: 'BIRTH_OR_MARRIAGE_CERT',
        label: 'Certidão de nascimento ou casamento',
        required: true,
      },
      {
        type: 'PHOTO_3X4',
        label: 'Foto 3x4 (digital)',
        required: true,
      },
    ],
  },
  {
    id: 'professional',
    title: 'Documentos Profissionais',
    icon: Briefcase,
    iconBg: 'bg-sky-100 dark:bg-sky-500/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    documents: [
      {
        type: 'CTPS',
        label: 'Carteira de Trabalho (CTPS)',
        required: true,
        note: 'Física ou digital (gov.br)',
      },
      {
        type: 'PIS_PASEP',
        label: 'PIS/PASEP',
        required: false,
        note: 'Se já cadastrado anteriormente',
      },
      {
        type: 'EDUCATION_CERT',
        label: 'Certidão de escolaridade',
        required: true,
        note: 'Diploma ou histórico do último grau concluído',
      },
    ],
  },
  {
    id: 'banking',
    title: 'Dados Bancários',
    icon: Landmark,
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    documents: [
      {
        type: 'BANK_PROOF',
        label: 'Comprovante de conta bancária',
        required: true,
        note: 'Extrato com nome do titular ou contrato bancário',
      },
    ],
  },
  {
    id: 'health',
    title: 'Saúde Ocupacional',
    icon: Heart,
    iconBg: 'bg-rose-100 dark:bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    documents: [
      {
        type: 'ASO_ADMISSIONAL',
        label: 'Atestado de Saúde Ocupacional (ASO)',
        required: true,
        note: 'Emitido por médico do trabalho antes do início das atividades',
      },
    ],
  },
  {
    id: 'family',
    title: 'Documentos da Família (opcional)',
    icon: Users,
    iconBg: 'bg-amber-100 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    documents: [
      {
        type: 'CHILDREN_BIRTH_CERT',
        label: 'Certidão de nascimento dos filhos',
        required: false,
        note: 'Filhos até 14 anos para salário-família',
      },
      {
        type: 'DEPENDANTS_CPF',
        label: 'CPF dos dependentes',
        required: false,
      },
      {
        type: 'VACCINATION_CARD',
        label: 'Cartão de vacinação',
        required: false,
        note: 'Filhos até 6 anos',
      },
    ],
  },
];

// =============================================================================
// TYPES
// =============================================================================

export interface DocsChecklistStepProps {
  /** Map of doc type → entry (controlled by parent). */
  entries: Record<string, AdmissionDocChecklistEntry>;
  onEntriesChange: (next: Record<string, AdmissionDocChecklistEntry>) => void;
  /** Whether the user opted to continue with pending docs. */
  allowMissingDocs: boolean;
  onAllowMissingDocsChange: (next: boolean) => void;
  /** Disables uploads (e.g. during submission) */
  disabled?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DocsChecklistStep({
  entries,
  onEntriesChange,
  allowMissingDocs,
  onAllowMissingDocsChange,
  disabled = false,
}: DocsChecklistStepProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTypeRef = useRef<string | null>(null);

  // ------- progress -------

  const { requiredCount, requiredCompleted, totalUploaded } = useMemo(() => {
    let required = 0;
    let completed = 0;
    let uploaded = 0;
    for (const group of ADMISSION_DOCS_CHECKLIST) {
      for (const doc of group.documents) {
        if (doc.required) required++;
        const entry = entries[doc.type];
        if (entry && entry.status !== 'pending') {
          uploaded++;
          if (doc.required && entry.status !== 'rejected') completed++;
        }
      }
    }
    return {
      requiredCount: required,
      requiredCompleted: completed,
      totalUploaded: uploaded,
    };
  }, [entries]);

  const progressPercent =
    requiredCount > 0
      ? Math.round((requiredCompleted / requiredCount) * 100)
      : 100;

  const allRequiredDone = requiredCompleted >= requiredCount;

  // ------- handlers -------

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const updateEntry = useCallback(
    (type: string, patch: Partial<AdmissionDocChecklistEntry>) => {
      const previous = entries[type];
      const next: AdmissionDocChecklistEntry = {
        ...(previous ?? { type, status: 'pending' }),
        ...patch,
        type,
        status: patch.status ?? previous?.status ?? 'pending',
        updatedAt: new Date().toISOString(),
      };
      onEntriesChange({ ...entries, [type]: next });
    },
    [entries, onEntriesChange]
  );

  const removeEntry = useCallback(
    (type: string) => {
      const nextEntries = { ...entries };
      delete nextEntries[type];
      onEntriesChange(nextEntries);
    },
    [entries, onEntriesChange]
  );

  const handleUploadClick = useCallback((type: string) => {
    pendingTypeRef.current = type;
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      const type = pendingTypeRef.current;
      event.target.value = '';
      if (!file || !type) return;

      setUploadingType(type);
      setUploadProgress(0);

      try {
        const uploaded = await storageFilesService.uploadFileWithProgress(
          null,
          file,
          percent => setUploadProgress(percent),
          { entityType: 'admission-draft' }
        );

        updateEntry(type, {
          status: 'uploaded',
          fileId: uploaded.file.id,
          fileName: file.name,
          rejectionReason: undefined,
        });
        toast.success('Documento anexado com sucesso');
      } catch {
        toast.error('Erro ao anexar documento');
      } finally {
        setUploadingType(null);
        setUploadProgress(0);
        pendingTypeRef.current = null;
      }
    },
    [updateEntry]
  );

  const handleRemoveAttachment = useCallback(
    async (type: string) => {
      const entry = entries[type];
      if (!entry?.fileId) {
        removeEntry(type);
        return;
      }
      try {
        await storageFilesService.deleteFile(entry.fileId);
      } catch {
        // best-effort: even if remote delete fails, drop local reference
      }
      removeEntry(type);
      toast.success('Anexo removido');
    },
    [entries, removeEntry]
  );

  // ------- render -------

  return (
    <div className="flex flex-col gap-4" data-testid="admission-docs-checklist">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileSelected}
        disabled={disabled}
      />

      {/* Progress summary */}
      <Card className="p-4 bg-white dark:bg-slate-800/60 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-500/10">
            <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Documentação obrigatória
            </h3>
            <p className="text-xs text-muted-foreground">
              {requiredCompleted} de {requiredCount} obrigatórios anexados
              {totalUploaded > requiredCompleted
                ? ` \u00b7 ${totalUploaded - requiredCompleted} opcional(is) anexado(s)`
                : ''}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              progressPercent === 100
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/8 dark:text-emerald-300'
                : progressPercent >= 50
                  ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/8 dark:text-sky-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/8 dark:text-slate-300'
            }
          >
            {progressPercent}%
          </Badge>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent === 100
                ? 'bg-emerald-500'
                : progressPercent >= 50
                  ? 'bg-sky-500'
                  : 'bg-slate-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Groups */}
      {ADMISSION_DOCS_CHECKLIST.map(group => {
        const GroupIcon = group.icon;
        const isCollapsed = collapsedGroups.has(group.id);
        const groupCompleted = group.documents.filter(d => {
          const entry = entries[d.type];
          return entry && entry.status !== 'pending';
        }).length;

        return (
          <Card
            key={group.id}
            className="overflow-hidden bg-white dark:bg-slate-800/60 border border-border"
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="flex items-center gap-3 w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-lg ${group.iconBg}`}
              >
                <GroupIcon className={`h-4 w-4 ${group.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {group.title}
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-xs tabular-nums border-slate-200 dark:border-slate-600"
              >
                {groupCompleted}/{group.documents.length}
              </Badge>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {!isCollapsed && (
              <div className="border-t border-border">
                {group.documents.map(doc => {
                  const entry = entries[doc.type];
                  const status: AdmissionDocChecklistStatus =
                    entry?.status ?? 'pending';
                  const isUploading = uploadingType === doc.type;

                  return (
                    <div
                      key={doc.type}
                      data-testid={`admission-doc-item-${doc.type}`}
                      className="flex flex-col gap-1 px-4 py-3 border-b last:border-b-0 border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm text-foreground truncate">
                            {doc.label}
                          </span>
                          {doc.required ? (
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[10px] px-1.5 py-0 border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/8 dark:text-violet-300"
                            >
                              Obrigatório
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[10px] px-1.5 py-0 border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
                            >
                              Opcional
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={status} />

                          {!isUploading && status === 'pending' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              data-testid={`admission-doc-upload-${doc.type}`}
                              onClick={() => handleUploadClick(doc.type)}
                              disabled={disabled}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Anexar
                            </Button>
                          )}

                          {!isUploading && status !== 'pending' && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleUploadClick(doc.type)}
                                disabled={disabled}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Substituir
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                                title="Remover anexo"
                                onClick={() => handleRemoveAttachment(doc.type)}
                                disabled={disabled}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}

                          {isUploading && (
                            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                          )}
                        </div>
                      </div>

                      {isUploading && (
                        <div className="ml-6 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {uploadProgress}%
                          </span>
                        </div>
                      )}

                      {entry?.fileName && !isUploading && (
                        <div className="ml-6 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="truncate max-w-[280px]">
                            {entry.fileName}
                          </span>
                        </div>
                      )}

                      {status === 'rejected' && entry?.rejectionReason && (
                        <div className="ml-6 flex items-start gap-2 text-[11px] text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>{entry.rejectionReason}</span>
                        </div>
                      )}

                      {doc.note && status === 'pending' && (
                        <p className="ml-6 text-[11px] text-muted-foreground italic">
                          {doc.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {/* Allow missing docs toggle */}
      {!allRequiredDone && (
        <Card className="p-4 bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor="allow-missing-docs"
                className="text-sm font-medium text-amber-800 dark:text-amber-200"
              >
                Continuar mesmo com documentos pendentes
              </Label>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                A admissão poderá ser concluída posteriormente quando todos os
                documentos obrigatórios forem recebidos. Esta operação fica
                registrada no log de auditoria.
              </p>
            </div>
            <Switch
              id="allow-missing-docs"
              data-testid="admission-allow-missing-docs"
              checked={allowMissingDocs}
              onCheckedChange={onAllowMissingDocsChange}
              disabled={disabled}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function StatusBadge({ status }: { status: AdmissionDocChecklistStatus }) {
  if (status === 'uploaded') {
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 py-0 border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/8 dark:text-sky-300"
      >
        <Upload className="h-3 w-3 mr-0.5" />
        Recebido
      </Badge>
    );
  }
  if (status === 'approved') {
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 py-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/8 dark:text-emerald-300"
      >
        <CheckCircle2 className="h-3 w-3 mr-0.5" />
        Aprovado
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 py-0 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/8 dark:text-rose-300"
      >
        <XCircle className="h-3 w-3 mr-0.5" />
        Rejeitado
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1.5 py-0 border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
    >
      <Clock className="h-3 w-3 mr-0.5" />
      Pendente
    </Badge>
  );
}

/**
 * Returns true when all required documents have been uploaded (or approved).
 * Used by the wizard to enable the "Avançar" button.
 */
export function areRequiredDocsComplete(
  entries: Record<string, AdmissionDocChecklistEntry>
): boolean {
  for (const group of ADMISSION_DOCS_CHECKLIST) {
    for (const doc of group.documents) {
      if (!doc.required) continue;
      const entry = entries[doc.type];
      if (!entry || entry.status === 'pending' || entry.status === 'rejected') {
        return false;
      }
    }
  }
  return true;
}
