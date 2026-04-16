'use client';

/**
 * DraftRestoreToast
 *
 * Surfaces a Sonner toast when the user reopens the admission wizard and a
 * previously saved draft is detected. Two actions are offered:
 *   - "Continuar"  → calls `onResume`, closes the toast
 *   - "Descartar"  → calls `onDiscard`, closes the toast
 *
 * The toast auto-dismisses after 30s. The component itself renders nothing
 * visible — it just triggers the toast on mount via useEffect, behaving as
 * an effect-only component to keep the parent JSX uncluttered.
 */

import {
  clearDraft,
  type AdmissionDraftPayload,
} from '@/lib/hr/admission-draft';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface DraftRestoreToastProps {
  /** When true, the toast is shown on mount. */
  open: boolean;
  /** Authenticated user id (used to clear the draft on discard). */
  userId: string;
  /** The draft payload — only used to format the savedAt timestamp. */
  draft: AdmissionDraftPayload | null;
  onResume: () => void;
  onDiscard: () => void;
}

const TOAST_ID = 'admission-draft-restore-toast';
const AUTO_DISMISS_MS = 30_000;

export function DraftRestoreToast({
  open,
  userId,
  draft,
  onResume,
  onDiscard,
}: DraftRestoreToastProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open || firedRef.current || !draft) return;
    firedRef.current = true;

    const savedAt = formatRelative(draft.savedAt);

    toast('Continuar admissão em andamento?', {
      id: TOAST_ID,
      description: savedAt
        ? `Rascunho salvo ${savedAt}.`
        : 'Há um rascunho salvo deste fluxo de admissão.',
      duration: AUTO_DISMISS_MS,
      action: {
        label: 'Continuar',
        onClick: () => {
          toast.dismiss(TOAST_ID);
          onResume();
        },
      },
      cancel: {
        label: 'Descartar',
        onClick: () => {
          toast.dismiss(TOAST_ID);
          clearDraft(userId);
          onDiscard();
        },
      },
    });

    return () => {
      toast.dismiss(TOAST_ID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset firing flag when toast is closed externally so it can re-fire next time
  useEffect(() => {
    if (!open) firedRef.current = false;
  }, [open]);

  return null;
}

function formatRelative(iso: string | undefined): string | null {
  if (!iso) return null;
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return null;
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'há instantes';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `há ${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  return `há ${diffDay}d`;
}
